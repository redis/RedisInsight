import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';

import {
  AgentMemoryClientMetadata,
  AgentMemoryEndpoint,
} from 'src/modules/agent-memory/models';
import {
  wrapAgentMemoryError,
  wrapSdkError,
} from 'src/modules/agent-memory/exceptions';
import {
  AgentMemoryCapabilities,
  AgentMemoryNewMessage,
  AgentMemoryConfiguration,
  AgentMemoryScopeFilter,
  DiscoveryFiltersResponse,
  LongTermMemorySearchResponse,
  SummaryView,
  SummaryViewPartitionFilters,
  WorkingMemoryResponse,
} from 'src/modules/agent-memory/agent-memory.types';
import { SearchLongTermMemoryDto } from 'src/modules/agent-memory/dto';
import { AGENT_MEMORY_IDLE_THRESHOLD } from 'src/modules/agent-memory/constants';

export abstract class AgentMemoryClient {
  public readonly id: string;

  public lastUsed: number = Date.now();

  protected constructor(
    public readonly metadata: AgentMemoryClientMetadata,
    protected readonly endpoint: AgentMemoryEndpoint,
  ) {
    this.id = AgentMemoryClient.generateId(this.metadata);
  }

  public isIdle(): boolean {
    return Date.now() - this.lastUsed > AGENT_MEMORY_IDLE_THRESHOLD;
  }

  /**
   * Build the axios instance with a response interceptor that maps
   * transport errors to sanitized HTTP exceptions, so individual client
   * methods don't need per-call try/catch wrappers (methods that want a
   * fallback instead can still catch the wrapped error).
   */
  protected createApi(config: CreateAxiosDefaults): AxiosInstance {
    const api = axios.create(config);
    api.interceptors.response.use(undefined, (error) =>
      Promise.reject(wrapAgentMemoryError(error)),
    );
    return api;
  }

  /** Run an SDK request, mapping its errors like the axios interceptor */
  protected async sdkCall<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error) {
      throw wrapSdkError(error);
    }
  }

  public setLastUsed(): void {
    this.lastUsed = Date.now();
  }

  /** Verify the endpoint is reachable and credentials are valid */
  abstract connect(): Promise<void>;

  /** Re-validate auth before a pooled client is reused */
  abstract ensureAuth(): Promise<void>;

  abstract getCapabilities(): AgentMemoryCapabilities;

  abstract listSessions(filter: AgentMemoryScopeFilter): Promise<string[]>;

  abstract getWorkingMemory(
    sessionId: string,
    filter: AgentMemoryScopeFilter,
  ): Promise<WorkingMemoryResponse>;

  abstract deleteWorkingMemory(
    sessionId: string,
    filter: AgentMemoryScopeFilter,
  ): Promise<void>;

  /** Append one message to a session's working memory (creates the
   * session when the id is new) */
  abstract appendMessage(
    sessionId: string,
    filter: AgentMemoryScopeFilter,
    message: AgentMemoryNewMessage,
  ): Promise<void>;

  abstract searchLongTermMemory(
    dto: SearchLongTermMemoryDto,
  ): Promise<LongTermMemorySearchResponse>;

  abstract deleteLongTermMemories(ids: string[]): Promise<void>;

  /** Derive distinct user ids + namespaces by scanning long-term memory */
  abstract discoverFilters(): Promise<DiscoveryFiltersResponse>;

  /** Store configuration (general settings + memory TTLs) */
  abstract getConfiguration(): Promise<AgentMemoryConfiguration>;

  /**
   * List summary views configured on the server. Returns null when the
   * backend doesn't support summary views.
   */
  abstract listSummaryViews(): Promise<SummaryView[] | null>;

  /** Create the default user-profile and session-profile views if missing */
  abstract createDefaultSummaryViews(): Promise<SummaryView[]>;

  /** Delete a view's configuration (stored partition summaries remain) */
  abstract deleteSummaryView(viewId: string): Promise<void>;

  /** Trigger an async recompute of ALL partitions of a view */
  abstract runSummaryView(viewId: string): Promise<void>;

  abstract listSummaryViewPartitions(
    viewId: string,
    filters: SummaryViewPartitionFilters,
  ): Promise<object[]>;

  abstract runSummaryViewPartition(
    viewId: string,
    group: Record<string, string>,
  ): Promise<object>;

  static generateId(cm: AgentMemoryClientMetadata): string {
    const empty = '(nil)';
    const separator = '_';

    const uId = [
      cm.sessionMetadata?.userId || empty,
      cm.sessionMetadata?.accountId || empty,
      cm.sessionMetadata?.sessionId || empty,
      cm.sessionMetadata?.uniqueId || empty,
    ].join(separator);

    return [cm.id, uId].join(separator);
  }
}
