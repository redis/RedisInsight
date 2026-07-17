/**
 * Normalized (camelCase) shapes returned to the UI.
 *
 * The OSS agent-memory-server speaks snake_case and the Redis Cloud agent
 * memory service speaks camelCase with different field names - backend
 * clients translate both into these shapes so the UI is indifferent to
 * which backend it's reading from.
 */

export interface AgentMemoryMessage {
  id?: string;
  role: string;
  content: string;
  createdAt?: string;
  /** When the message was persisted to Redis (messages have no updated_at) */
  persistedAt?: string;
  /** Whether long-term extraction already processed this message.
   * `null` when the backend doesn't expose the flag (Cloud). */
  discreteMemoryExtracted?: boolean | null;
}

export interface WorkingMemoryResponse {
  sessionId: string;
  userId?: string;
  namespace?: string;
  messages: AgentMemoryMessage[];
  summary?: string;
  createdAt?: string;
  /** null/undefined = no expiry */
  ttlSeconds?: number;
}

export interface LongTermMemoryRecord {
  id: string;
  /** Full Redis key holding the memory (OSS only), e.g. `memory_idx:<id>` */
  key?: string;
  text: string;
  memoryType?: string;
  userId?: string;
  sessionId?: string;
  namespace?: string;
  topics: string[];
  entities: string[];
  createdAt?: string;
  updatedAt?: string;
  /** Composite relevance score - present only when a text search is active
   * and the backend returns one (OSS only). */
  score?: number;
}

export interface LongTermMemorySearchResponse {
  memories: LongTermMemoryRecord[];
  total: number;
}

export interface DiscoveryFiltersResponse {
  users: string[];
  namespaces: string[];
}

export interface AgentMemoryCapabilities {
  /** Backend supports the namespace concept */
  namespaces: boolean;
  /** Backend supports server-side LLM query rewriting on search */
  optimizeQuery: boolean;
  /** Backend supports summary views */
  summaryViews: boolean;
  /** Backend supports appending events to a session's working memory */
  addEvents: boolean;
}

export interface AgentMemoryNewMessage {
  role: string;
  content: string;
}

export interface SummaryView {
  id: string;
  name: string;
  groupBy: string[];
  continuous?: boolean;
}

export interface SummaryViewPartitionFilters {
  userId?: string;
}

export interface AgentMemoryScopeFilter {
  userId?: string;
  namespace?: string;
}

/**
 * Store configuration as shown in the Redis Cloud console (General
 * Settings + Memory Configuration). Fields the backend doesn't expose
 * stay undefined - the OSS server exposes no configuration API at all,
 * so OSS endpoints only fill the fields RedisInsight itself knows.
 */
export interface AgentMemoryConfiguration {
  serviceName?: string;
  storeId?: string;
  database?: string;
  endpoint?: string;
  shortTermTtl?: string;
  longTermTtl?: string;
}
