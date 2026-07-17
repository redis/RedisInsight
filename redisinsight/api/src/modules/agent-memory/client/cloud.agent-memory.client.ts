import { BadRequestException } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { AgentMemory as IrisAgentMemoryClient } from '@redis-iris/agent-memory';

type IrisSearchRequest = NonNullable<
  Parameters<IrisAgentMemoryClient['searchLongTermMemory']>[0]
>;
type IrisFilter = NonNullable<IrisSearchRequest['filter']>;
type IrisMessageRole = Parameters<
  IrisAgentMemoryClient['addSessionEvent']
>[0]['role'];

import {
  AgentMemoryClientMetadata,
  AgentMemoryEndpoint,
} from 'src/modules/agent-memory/models';
import {
  AgentMemoryCapabilities,
  AgentMemoryConfiguration,
  AgentMemoryNewMessage,
  AgentMemoryScopeFilter,
  DiscoveryFiltersResponse,
  LongTermMemorySearchResponse,
  SummaryView,
  SummaryViewPartitionFilters,
  WorkingMemoryResponse,
} from 'src/modules/agent-memory/agent-memory.types';
import { SearchLongTermMemoryDto } from 'src/modules/agent-memory/dto';
import {
  AGENT_MEMORY_TIMEOUT,
  CLOUD_EVENT_ROLES,
  LONG_TERM_MEMORY_SEARCH_LIMIT,
  SESSIONS_LIST_LIMIT,
} from 'src/modules/agent-memory/constants';
import { AgentMemoryClient } from 'src/modules/agent-memory/client/agent-memory.client';
import {
  fromCloudMemory,
  fromCloudSessionMemory,
} from 'src/modules/agent-memory/client/transformers';

/**
 * Client for the Redis Cloud agent memory service (Iris / Context Engine).
 *
 * Endpoints live under /v1/stores/{storeId}/... and require a bearer API
 * key. Responses are camelCase with cloud-specific field names and are
 * normalized to the shared shapes before leaving this class. Transport
 * errors are mapped to sanitized HTTP exceptions by the base-class
 * response interceptor.
 *
 * Cloud has no namespace concept, no summary views, no similarity scores
 * and no per-message extraction flag - capabilities reflect that and the
 * UI degrades gracefully.
 *
 * The cloud search endpoint rejects requests with neither `text` nor
 * `filter`; a single-space text is used as a benign match-all sentinel.
 */
const MATCH_ALL_TEXT = ' ';

export class CloudAgentMemoryClient extends AgentMemoryClient {
  protected readonly api: AxiosInstance;

  /** Official Iris data-plane SDK - used for everything except the store
   * details lookup, which is outside its surface. */
  private readonly sdk: IrisAgentMemoryClient;

  constructor(
    metadata: AgentMemoryClientMetadata,
    endpoint: AgentMemoryEndpoint,
  ) {
    super(metadata, endpoint);

    if (!endpoint.storeId || !endpoint.apiKey) {
      throw new BadRequestException(
        'Store ID and API key are required for the Redis Cloud backend',
      );
    }

    const baseUrl = endpoint.url.replace(/\/+$/, '');

    this.api = this.createApi({
      baseURL: `${baseUrl}/v1/stores/${encodeURIComponent(endpoint.storeId)}`,
      timeout: AGENT_MEMORY_TIMEOUT,
      headers: {
        Authorization: `Bearer ${endpoint.apiKey}`,
        Accept: 'application/json',
      },
    });

    this.sdk = new IrisAgentMemoryClient({
      serverURL: baseUrl,
      storeId: endpoint.storeId,
      apiKey: endpoint.apiKey,
      timeoutMs: AGENT_MEMORY_TIMEOUT,
    });
  }

  getCapabilities(): AgentMemoryCapabilities {
    return {
      namespaces: false,
      optimizeQuery: false,
      summaryViews: false,
      addEvents: true,
    };
  }

  async connect(): Promise<void> {
    // A cheap authenticated list call verifies host + credentials +
    // store id in one shot. The service requires either an owner filter
    // or includeAll=true on listings.
    await this.sdkCall(() =>
      this.sdk.listSessions(1, undefined, undefined, true),
    );
  }

  async ensureAuth(): Promise<void> {
    // Static bearer token - nothing to refresh.
  }

  async listSessions(filter: AgentMemoryScopeFilter): Promise<string[]> {
    // The service requires either an owner filter or includeAll=true
    const data = await this.sdkCall(() =>
      this.sdk.listSessions(
        SESSIONS_LIST_LIMIT,
        undefined,
        filter.userId || undefined,
        filter.userId ? undefined : true,
      ),
    );
    return (data?.items ?? []).filter((id): id is string => Boolean(id));
  }

  async getWorkingMemory(
    sessionId: string,
    _filter: AgentMemoryScopeFilter,
  ): Promise<WorkingMemoryResponse> {
    const data = await this.sdkCall(() => this.sdk.getSessionMemory(sessionId));
    return fromCloudSessionMemory(data ?? {});
  }

  async deleteWorkingMemory(
    sessionId: string,
    _filter: AgentMemoryScopeFilter,
  ): Promise<void> {
    await this.sdkCall(() => this.sdk.deleteSessionMemory(sessionId));
  }

  /**
   * The service has a first-class append endpoint. Roles are limited to
   * USER/ASSISTANT/SYSTEM per its spec ('tool' has no equivalent).
   */
  async appendMessage(
    sessionId: string,
    filter: AgentMemoryScopeFilter,
    message: AgentMemoryNewMessage,
  ): Promise<void> {
    const role = message.role.toUpperCase();
    if (!(CLOUD_EVENT_ROLES as readonly string[]).includes(role)) {
      throw new BadRequestException(
        `Role "${message.role}" is not supported by the Redis Cloud backend`,
      );
    }
    await this.sdkCall(() =>
      this.sdk.addSessionEvent({
        sessionId,
        actorId: filter.userId || 'redisinsight',
        role: role as IrisMessageRole,
        content: [{ text: message.content }],
        createdAt: new Date(),
      }),
    );
  }

  async searchLongTermMemory(
    dto: SearchLongTermMemoryDto,
  ): Promise<LongTermMemorySearchResponse> {
    const filter: IrisFilter = {};
    const userIds = dto.userIds ?? [];
    if (userIds.length === 1) filter.ownerId = { eq: userIds[0] };
    else if (userIds.length > 1) filter.ownerId = { in: userIds };
    else if (dto.userId) filter.ownerId = { eq: dto.userId };
    const sessionIds = dto.sessionIds ?? [];
    if (sessionIds.length === 1) filter.sessionId = { eq: sessionIds[0] };
    else if (sessionIds.length > 1) filter.sessionId = { in: sessionIds };
    const memoryTypes = dto.memoryTypes ?? [];
    if (memoryTypes.length === 1) filter.memoryType = { eq: memoryTypes[0] };
    else if (memoryTypes.length > 1) filter.memoryType = { in: memoryTypes };
    if (dto.topics?.length) filter.topics = { in: dto.topics };
    if (dto.entities?.length) {
      // The published spec omits entity filtering but the service accepts it
      (filter as Record<string, unknown>).entities = { in: dto.entities };
    }

    const hasFilter = Object.keys(filter).length > 0;
    let text: string | undefined;
    if (dto.text?.trim()) {
      text = dto.text;
    } else if (!hasFilter) {
      text = MATCH_ALL_TEXT;
    }

    const data = await this.sdkCall(() =>
      this.sdk.searchLongTermMemory({
        text,
        limit: LONG_TERM_MEMORY_SEARCH_LIMIT,
        filter: hasFilter ? filter : undefined,
        // AND across filter keys so scoping (ownerId, sessionId) and
        // narrowing (topics, entities) compose. Within each {in: [...]}
        // list the values stay OR'd.
        filterOp: hasFilter ? 'all' : undefined,
      }),
    );
    const items = (data?.items ?? []).map(fromCloudMemory);
    return { memories: items, total: items.length };
  }

  async deleteLongTermMemories(ids: string[]): Promise<void> {
    await this.sdkCall(() =>
      this.sdk.bulkDeleteLongTermMemories({ memoryIds: ids }),
    );
  }

  async discoverFilters(): Promise<DiscoveryFiltersResponse> {
    const data = await this.sdkCall(() =>
      this.sdk.searchLongTermMemory({ text: MATCH_ALL_TEXT }),
    );
    const users = [
      ...new Set(
        (data?.items ?? [])
          .map((m) => m.ownerId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    return { users, namespaces: [] };
  }

  /**
   * Fetch the store details (as shown on cloud.redis.io). Field names are
   * mapped defensively - missing fields fall back to the connection
   * details RedisInsight manages itself.
   */
  async getConfiguration(): Promise<AgentMemoryConfiguration> {
    let store: Record<string, any> = {};
    try {
      const { data } = await this.api.get('');
      store = data ?? {};
    } catch {
      // store details endpoint unavailable - fall back to local knowledge
    }

    const asTtl = (value: unknown): string | undefined =>
      value === undefined || value === null ? undefined : String(value);

    return {
      serviceName: store.name ?? store.serviceName ?? this.endpoint.name,
      storeId: store.id ?? this.endpoint.storeId,
      database: store.databaseName ?? store.database ?? store.databaseId,
      endpoint: store.endpoint ?? store.publicEndpoint ?? this.endpoint.url,
      shortTermTtl: asTtl(store.shortTermTtl ?? store.sessionTtl),
      longTermTtl: asTtl(store.longTermTtl),
    };
  }

  async listSummaryViews(): Promise<SummaryView[] | null> {
    return null;
  }

  async createDefaultSummaryViews(): Promise<SummaryView[]> {
    return [];
  }

  async deleteSummaryView(_viewId: string): Promise<void> {
    // Summary views are unsupported on Cloud - nothing to delete.
  }

  async runSummaryView(_viewId: string): Promise<void> {
    // Summary views are unsupported on Cloud - nothing to run.
  }

  async listSummaryViewPartitions(
    _viewId: string,
    _filters: SummaryViewPartitionFilters,
  ): Promise<object[]> {
    return [];
  }

  async runSummaryViewPartition(
    _viewId: string,
    _group: Record<string, string>,
  ): Promise<object> {
    return {};
  }
}
