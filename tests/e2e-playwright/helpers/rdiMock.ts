import { Page, Route } from '@playwright/test';
import { RdiInstanceData, RdiPipelineData, RdiPipelineStatus } from 'e2eSrc/types';

/**
 * A request the mock answered, for assertions such as "Stop sent a request"
 */
export interface RdiMockRequest {
  method: string;
  /** Path relative to the RDI proxy (e.g. `/api/v2/pipelines/orders/stop`), or the RedisInsight API path */
  path: string;
}

type Json = object;

const RDI_API_PATH = /^\/api\/rdi(\/|$)/;
const PIPELINE_PATH = /^\/api\/v2\/pipelines\/([^/]+)$/;
const PIPELINE_ACTION_PATH = /^\/api\/v2\/pipelines\/([^/]+)\/(start|stop|reset)$/;
const PIPELINE_STATUS_PATH = /^\/api\/v2\/pipelines\/([^/]+)\/status$/;
const PIPELINE_EMPTY_LIST_PATH = /^\/api\/v2\/pipelines\/[^/]+\/(secrets|metric-collections)$/;
const PIPELINE_DLQS_PATH = /^\/api\/v2\/pipelines\/[^/]+\/dlqs$/;
const V1_SCHEMAS_PATH = /^\/api\/v1\/pipelines\/(config|jobs)\/schemas$/;

const STATUS_AFTER_ACTION: Record<string, RdiPipelineStatus> = {
  start: 'started',
  stop: 'stopped',
  reset: 'started',
};

/**
 * Fakes an RDI instance for the RDI pages, so they can be tested without an
 * RDI backend.
 *
 * RedisInsight can't store an RDI instance without one: `POST /api/rdi` logs in
 * to RDI and reads its version first. So the mock answers in the browser,
 * with `page.route`, both RedisInsight's own RDI endpoints (`/api/rdi`,
 * `/api/rdi/:id`, `/api/rdi/:id/connect`) and the RDI API calls the
 * `@rdi-ui/pipeline` package sends through RedisInsight's proxy
 * (`/api/rdi/:id/proxy/api/v2/...`).
 *
 * Routes match on the URL path, so the mock works whatever host and port the
 * API is served on (browser dev server, served statics, Electron).
 *
 * Pipeline actions (start/stop/reset) update the faked status, so the
 * polled pipeline list reflects them. Anything not faked gets a 404 and is
 * listed in `unhandled`.
 */
export class RdiMock {
  readonly requests: RdiMockRequest[] = [];
  readonly unhandled: RdiMockRequest[] = [];

  private instance: RdiInstanceData | undefined;
  private readonly pipelines = new Map<string, RdiPipelineData>();
  private readonly statusChangedAt = new Map<string, string>();

  constructor(private readonly page: Page) {}

  /**
   * Install the routes. Call before navigating to the RDI pages.
   */
  async install(instance: RdiInstanceData, pipelines: RdiPipelineData[]): Promise<void> {
    this.instance = instance;
    this.pipelines.clear();
    pipelines.forEach((pipeline) => this.setPipeline(pipeline));

    await this.page.route(
      (url) => RDI_API_PATH.test(url.pathname),
      (route) => this.handle(route),
    );
  }

  /**
   * Requests sent to the RDI proxy with this method and path
   */
  proxyRequests(method: string, path: string): RdiMockRequest[] {
    return this.requests.filter((request) => request.method === method && request.path === path);
  }

  private setPipeline(pipeline: RdiPipelineData): void {
    this.pipelines.set(pipeline.name, pipeline);
    this.statusChangedAt.set(pipeline.name, new Date().toISOString());
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const method = request.method();
    const { pathname } = new URL(request.url());
    const instance = this.instance!;
    const instancePath = `/api/rdi/${instance.id}`;
    const proxyPath = `${instancePath}/proxy`;

    if (pathname.startsWith(`${proxyPath}/`)) {
      const path = pathname.slice(proxyPath.length);
      this.requests.push({ method, path });
      return this.handleProxy(route, method, path);
    }

    this.requests.push({ method, path: pathname });

    if (method === 'GET' && pathname === '/api/rdi') return this.json(route, [instance]);
    if (method === 'GET' && pathname === instancePath) return this.json(route, instance);
    if (method === 'GET' && pathname === `${instancePath}/connect`) return this.json(route, {});

    return this.notFound(route, method, pathname);
  }

  private async handleProxy(route: Route, method: string, path: string): Promise<void> {
    if (method === 'GET' && path === '/api/v2/info') {
      return this.json(route, { version: this.instance!.version });
    }

    if (method === 'GET' && path === '/api/v2/pipelines') {
      return this.json(
        route,
        [...this.pipelines.values()].map((pipeline) => this.toPipelineResponse(pipeline)),
      );
    }

    const pipelineMatch = path.match(PIPELINE_PATH);
    if (pipelineMatch) {
      const pipeline = this.pipelines.get(decodeURIComponent(pipelineMatch[1]));
      if (!pipeline) return this.notFound(route, method, path);
      // GET reads the pipeline; PUT/PATCH with ?dry_run=true is the connection check
      return this.json(route, this.toPipelineResponse(pipeline));
    }

    const actionMatch = method === 'POST' ? path.match(PIPELINE_ACTION_PATH) : null;
    if (actionMatch) {
      const pipeline = this.pipelines.get(decodeURIComponent(actionMatch[1]));
      if (!pipeline) return this.notFound(route, method, path);
      this.setPipeline({ ...pipeline, status: STATUS_AFTER_ACTION[actionMatch[2]] });
      return this.json(route, this.toPipelineResponse(this.pipelines.get(pipeline.name)!));
    }

    const statusMatch = method === 'GET' ? path.match(PIPELINE_STATUS_PATH) : null;
    if (statusMatch) {
      const pipeline = this.pipelines.get(decodeURIComponent(statusMatch[1]));
      if (!pipeline) return this.notFound(route, method, path);
      const { status, status_changed_at, errors, components, current } = this.toPipelineResponse(pipeline);
      return this.json(route, { status, status_changed_at, errors, components, current });
    }

    if (method === 'GET' && PIPELINE_EMPTY_LIST_PATH.test(path)) return this.json(route, []);
    if (method === 'GET' && PIPELINE_DLQS_PATH.test(path)) return this.json(route, {});
    if (method === 'GET' && V1_SCHEMAS_PATH.test(path)) return this.json(route, {});
    if (method === 'GET' && path === '/api/v2/settings') return this.json(route, { standby_mode: false });

    return this.notFound(route, method, path);
  }

  /**
   * The RDI v2 `PipelineResponse` for a pipeline (snake_case, as RDI sends it)
   */
  private toPipelineResponse(pipeline: RdiPipelineData) {
    const { source, target } = pipeline;
    const componentStatus = pipeline.status === 'stopped' ? 'stopped' : 'started';

    return {
      name: pipeline.name,
      active: true,
      current: true,
      status: pipeline.status,
      status_changed_at: this.statusChangedAt.get(pipeline.name),
      errors: [],
      config: {
        sources: {
          [source.name]: {
            type: 'cdc',
            logging: { level: 'info' },
            connection: {
              type: source.type,
              host: source.host,
              port: source.port,
              database: source.database,
              user: '${SOURCE_DB_USERNAME}',
              password: '${SOURCE_DB_PASSWORD}',
            },
          },
        },
        targets: {
          target: {
            connection: {
              type: 'redis',
              host: target.host,
              port: target.port,
              user: '${TARGET_DB_USERNAME}',
              password: '${TARGET_DB_PASSWORD}',
            },
          },
        },
        processors: {},
      },
      components: [
        {
          name: `collector-${source.name}`,
          type: 'debezium-collector',
          source: source.name,
          version: this.instance!.version,
          status: componentStatus,
          replicas: 1,
          metric_collections: [],
        },
        {
          name: 'processor',
          type: 'stream-processor',
          version: this.instance!.version,
          status: componentStatus,
          replicas: 1,
          metric_collections: [],
        },
      ],
    };
  }

  private async json(route: Route, body: Json): Promise<void> {
    await route.fulfill({ json: body });
  }

  private async notFound(route: Route, method: string, path: string): Promise<void> {
    this.unhandled.push({ method, path });
    await route.fulfill({ status: 404, json: { detail: `Not faked by RdiMock: ${method} ${path}` } });
  }
}
