import {
  Rdi,
  RdiClientMetadata,
  RdiPipeline,
  RdiPipelineStatus,
  RdiProxyRequest,
  RdiProxyResponse,
  RdiStatisticsResult,
} from 'src/modules/rdi/models';
import {
  RdiDryRunJobDto,
  RdiDryRunJobResponseDto,
  RdiTemplateResponseDto,
  RdiTestConnectionsResponseDto,
} from 'src/modules/rdi/dto';
import { IDLE_THRESHOLD } from 'src/modules/rdi/constants';

export abstract class RdiClient {
  public readonly id: string;

  public lastUsed: number = Date.now();

  protected constructor(
    public readonly metadata: RdiClientMetadata,
    protected readonly rdi: Rdi,
  ) {
    this.id = RdiClient.generateId(this.metadata);
  }

  public isIdle(): boolean {
    return Date.now() - this.lastUsed > IDLE_THRESHOLD;
  }

  abstract getSchema(): Promise<object>;

  abstract getPipeline(): Promise<RdiPipeline>;

  abstract getConfigTemplate(
    pipelineType: string,
    dbType: string,
  ): Promise<RdiTemplateResponseDto>;

  abstract getJobTemplate(
    pipelineType: string,
  ): Promise<RdiTemplateResponseDto>;

  abstract getStrategies(): Promise<object>;

  abstract deploy(pipeline: RdiPipeline): Promise<void>;

  abstract stopPipeline(): Promise<void>;

  abstract startPipeline(): Promise<void>;

  abstract resetPipeline(): Promise<void>;

  abstract dryRunJob(data: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto>;

  abstract testConnections(
    config: object,
  ): Promise<RdiTestConnectionsResponseDto>;

  abstract getStatistics(): Promise<RdiStatisticsResult>;

  abstract getPipelineStatus(): Promise<RdiPipelineStatus>;

  abstract getVersion(): Promise<string>;

  abstract getJobFunctions(): Promise<object>;

  abstract ensureAuth(): Promise<void>;

  abstract connect(): Promise<void>;

  /**
   * Forwards an arbitrary request to the RDI instance's native API, reusing this
   * client's base URL and bearer token.
   *
   * Needed by the @rdi-ui/pipeline pipeline management UI, which speaks the
   * native RDI API directly instead of RedisInsight's curated /rdi endpoints.
   */
  abstract proxyRequest(request: RdiProxyRequest): Promise<RdiProxyResponse>;

  public setLastUsed(): void {
    this.lastUsed = Date.now();
  }

  static generateId(cm: RdiClientMetadata): string {
    const empty = '(nil)';
    const separator = '_';

    const id = [cm.id].join(separator);

    const uId = [
      cm.sessionMetadata?.userId || empty,
      cm.sessionMetadata?.accountId || empty,
      cm.sessionMetadata?.sessionId || empty,
      cm.sessionMetadata?.uniqueId || empty,
    ].join(separator);

    return [id, uId].join(separator);
  }
}
