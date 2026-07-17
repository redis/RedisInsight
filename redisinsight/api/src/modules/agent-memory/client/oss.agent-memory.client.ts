import { NotFoundException } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import {
  MemoryAPIClient,
  SearchOptions as SdkSearchOptions,
} from 'agent-memory-client';

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
  AgentMemoryServerUrl,
  DISCOVERY_SCAN_LIMIT,
  LONG_TERM_MEMORY_SEARCH_LIMIT,
  SESSIONS_LIST_LIMIT,
  SUMMARY_VIEW_NAMES,
} from 'src/modules/agent-memory/constants';
import { AgentMemoryClient } from 'src/modules/agent-memory/client/agent-memory.client';
import {
  fromOssMemory,
  fromOssSummaryView,
  fromOssWorkingMemory,
} from 'src/modules/agent-memory/client/transformers';

/**
 * Client for the open-source `redis/agent-memory-server`.
 *
 * The server speaks snake_case; responses are normalized to the camelCase
 * shapes in agent-memory.types.ts before leaving this class. Auth is
 * optional - a bearer token is attached only when the endpoint has an
 * apiKey configured. Transport errors are mapped to sanitized HTTP
 * exceptions by the base-class response interceptor.
 */
export class OssAgentMemoryClient extends AgentMemoryClient {
  protected readonly api: AxiosInstance;

  /** Official server SDK - used where it covers our calls; the axios
   * instance stays for the working-memory family (the SDK lacks user_id
   * scoping there) and the discovery scan. */
  private readonly sdk: MemoryAPIClient;

  constructor(
    metadata: AgentMemoryClientMetadata,
    endpoint: AgentMemoryEndpoint,
  ) {
    super(metadata, endpoint);

    this.api = this.createApi({
      baseURL: endpoint.url,
      timeout: AGENT_MEMORY_TIMEOUT,
      headers: endpoint.apiKey
        ? { Authorization: `Bearer ${endpoint.apiKey}` }
        : {},
    });

    this.sdk = new MemoryAPIClient({
      baseUrl: endpoint.url.replace(/\/+$/, ''),
      timeout: AGENT_MEMORY_TIMEOUT,
      bearerToken: endpoint.apiKey || undefined,
    });
  }

  getCapabilities(): AgentMemoryCapabilities {
    return {
      namespaces: true,
      optimizeQuery: true,
      summaryViews: true,
      addEvents: true,
    };
  }

  async connect(): Promise<void> {
    await this.sdkCall(() => this.sdk.healthCheck());
  }

  async ensureAuth(): Promise<void> {
    // Static bearer token - nothing to refresh.
  }

  async listSessions(filter: AgentMemoryScopeFilter): Promise<string[]> {
    const { data } = await this.api.get(
      `${AgentMemoryServerUrl.WorkingMemory}/`,
      {
        params: {
          limit: SESSIONS_LIST_LIMIT,
          user_id: filter.userId || undefined,
          namespace: filter.namespace || undefined,
        },
      },
    );
    return data?.sessions ?? [];
  }

  async getWorkingMemory(
    sessionId: string,
    filter: AgentMemoryScopeFilter,
  ): Promise<WorkingMemoryResponse> {
    const { data } = await this.api.get(
      `${AgentMemoryServerUrl.WorkingMemory}/${encodeURIComponent(sessionId)}`,
      {
        params: {
          user_id: filter.userId || undefined,
          namespace: filter.namespace || undefined,
        },
      },
    );
    return fromOssWorkingMemory(data ?? {});
  }

  async deleteWorkingMemory(
    sessionId: string,
    filter: AgentMemoryScopeFilter,
  ): Promise<void> {
    await this.api.delete(
      `${AgentMemoryServerUrl.WorkingMemory}/${encodeURIComponent(sessionId)}`,
      {
        params: {
          user_id: filter.userId || undefined,
          namespace: filter.namespace || undefined,
        },
      },
    );
  }

  /**
   * Append one message via read-modify-write: the server's PUT replaces
   * the whole working-memory record (there is no append endpoint), so the
   * raw record is fetched, extended and written back. A concurrent agent
   * write in that window would be lost - acceptable for a debug tool. A
   * new session id reads as missing and the PUT creates it.
   */
  async appendMessage(
    sessionId: string,
    filter: AgentMemoryScopeFilter,
    message: AgentMemoryNewMessage,
  ): Promise<void> {
    const params = {
      user_id: filter.userId || undefined,
      namespace: filter.namespace || undefined,
    };
    let current: Record<string, any> = {};
    try {
      const { data } = await this.api.get(
        `${AgentMemoryServerUrl.WorkingMemory}/${encodeURIComponent(sessionId)}`,
        { params },
      );
      current = data ?? {};
    } catch (error) {
      // Only a missing session may start fresh - anything else (timeout,
      // 5xx, auth) must abort, or the PUT would replace the session's
      // whole working memory with this single message.
      if (!(error instanceof NotFoundException)) throw error;
    }

    await this.api.put(
      `${AgentMemoryServerUrl.WorkingMemory}/${encodeURIComponent(sessionId)}`,
      {
        session_id: sessionId,
        user_id: current.user_id ?? filter.userId ?? null,
        namespace: current.namespace ?? filter.namespace ?? null,
        context: current.context ?? null,
        data: current.data ?? {},
        memories: current.memories ?? [],
        messages: [
          ...(current.messages ?? []),
          { role: message.role, content: message.content },
        ],
      },
    );
  }

  async searchLongTermMemory(
    dto: SearchLongTermMemoryDto,
  ): Promise<LongTermMemorySearchResponse> {
    // The SDK's typed multi-value key `in_` 500s on the server (verified
    // live); the server accepts `any`, and the SDK passes plain filter
    // objects through to the wire verbatim.
    const anyOf = (values: string[]) =>
      ({ any: values }) as unknown as { in_: string[] };

    const options: SdkSearchOptions = {
      text: dto.text ?? '',
      limit: LONG_TERM_MEMORY_SEARCH_LIMIT,
      optimizeQuery: dto.optimizeQuery || undefined,
    };
    const userIds = dto.userIds ?? [];
    if (userIds.length === 1) options.userId = { eq: userIds[0] };
    else if (userIds.length > 1) options.userId = anyOf(userIds);
    else if (dto.userId) options.userId = { eq: dto.userId };
    const namespaces = dto.namespaces ?? [];
    if (namespaces.length === 1) options.namespace = { eq: namespaces[0] };
    else if (namespaces.length > 1) options.namespace = anyOf(namespaces);
    else if (dto.namespace) options.namespace = { eq: dto.namespace };
    const sessionIds = dto.sessionIds ?? [];
    if (sessionIds.length === 1) options.sessionId = { eq: sessionIds[0] };
    else if (sessionIds.length > 1) options.sessionId = anyOf(sessionIds);
    const memoryTypes = dto.memoryTypes ?? [];
    if (memoryTypes.length === 1) options.memoryType = { eq: memoryTypes[0] };
    else if (memoryTypes.length > 1) options.memoryType = anyOf(memoryTypes);
    if (dto.topics?.length) options.topics = { any: dto.topics };
    if (dto.entities?.length) options.entities = { any: dto.entities };

    const data = await this.sdkCall(() =>
      this.sdk.searchLongTermMemory(options),
    );

    const memories = (data?.memories ?? []).map(fromOssMemory);
    // The SDK reports dist: 0 on no-text listings; a relevance score is
    // only meaningful when a text search ranked the results.
    if (!dto.text?.trim()) {
      memories.forEach((memory) => {
        memory.score = undefined;
      });
    }
    return { memories, total: data?.total ?? memories.length };
  }

  async deleteLongTermMemories(ids: string[]): Promise<void> {
    await this.sdkCall(() => this.sdk.deleteLongTermMemories(ids));
  }

  /**
   * The server doesn't expose first-class user/namespace enumeration
   * endpoints - scan one page of long-term memory and collect distinct
   * values. Scan order is preserved so the first entries are the most
   * recently active (the UI's auto-pick relies on this).
   */
  async discoverFilters(): Promise<DiscoveryFiltersResponse> {
    const { data } = await this.api.post(
      AgentMemoryServerUrl.LongTermMemorySearch,
      { text: '', limit: DISCOVERY_SCAN_LIMIT },
    );
    const memories: Record<string, any>[] = data?.memories ?? [];
    const users = [
      ...new Set(memories.map((m) => m.user_id).filter(Boolean)),
    ] as string[];
    const namespaces = [
      ...new Set(memories.map((m) => m.namespace).filter(Boolean)),
    ] as string[];
    return { users, namespaces };
  }

  /**
   * The OSS server exposes no configuration API (see its OpenAPI spec) -
   * report only the connection details RedisInsight manages itself. TTLs
   * stay undefined and render as "not exposed" in the UI.
   */
  async getConfiguration(): Promise<AgentMemoryConfiguration> {
    return {
      serviceName: this.endpoint.name,
      endpoint: this.endpoint.url,
    };
  }

  async listSummaryViews(): Promise<SummaryView[] | null> {
    try {
      const views = await this.sdkCall(() => this.sdk.listSummaryViews());
      return (views ?? []).map(fromOssSummaryView);
    } catch (error) {
      // Only a missing route means an older server without summary views -
      // transient failures must reject, or the UI hides the pane for good.
      if (error instanceof NotFoundException) return null;
      throw error;
    }
  }

  /**
   * A default is skipped when ANY existing view covers its grouping,
   * regardless of who created or named it - the grouping is the view's
   * identity, the name is only a label.
   */
  async createDefaultSummaryViews(): Promise<SummaryView[]> {
    const existing = (await this.listSummaryViews()) ?? [];
    const hasGrouping = (groupBy: string[]) =>
      existing.some(
        (view) =>
          view.groupBy.length === groupBy.length &&
          groupBy.every((key) => view.groupBy.includes(key)),
      );

    if (!hasGrouping(['user_id'])) {
      await this.createSummaryView(SUMMARY_VIEW_NAMES.userProfile, ['user_id']);
    }
    if (!hasGrouping(['session_id'])) {
      await this.createSummaryView(SUMMARY_VIEW_NAMES.sessionProfile, [
        'session_id',
      ]);
    }

    return (await this.listSummaryViews()) ?? [];
  }

  async deleteSummaryView(viewId: string): Promise<void> {
    await this.sdkCall(() => this.sdk.deleteSummaryView(viewId));
  }

  async runSummaryView(viewId: string): Promise<void> {
    await this.sdkCall(() => this.sdk.runSummaryView(viewId));
  }

  async listSummaryViewPartitions(
    viewId: string,
    filters: SummaryViewPartitionFilters,
  ): Promise<object[]> {
    const partitions = await this.sdkCall(() =>
      this.sdk.listSummaryViewPartitions(viewId, {
        userId: filters.userId || undefined,
      }),
    );
    return partitions ?? [];
  }

  async runSummaryViewPartition(
    viewId: string,
    group: Record<string, string>,
  ): Promise<object> {
    const result = await this.sdkCall(() =>
      this.sdk.runSummaryViewPartition(viewId, group),
    );
    return result ?? {};
  }

  private async createSummaryView(
    name: string,
    groupBy: string[],
  ): Promise<object> {
    return this.sdkCall(() =>
      this.sdk.createSummaryView({
        name,
        source: 'long_term',
        group_by: groupBy,
        continuous: true,
      }),
    );
  }
}
