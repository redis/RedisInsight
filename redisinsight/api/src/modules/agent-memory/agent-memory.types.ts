/**
 * Normalized (camelCase) shapes returned to the UI. The backend client
 * translates the Redis Agent Memory service's responses into these shapes
 * so the UI reads one consistent contract.
 */

export interface AgentMemoryMessage {
  id?: string;
  role: string;
  content: string;
  createdAt?: string;
}

export interface WorkingMemoryResponse {
  sessionId: string;
  userId?: string;
  namespace?: string;
  messages: AgentMemoryMessage[];
  /** Compacted summary of older session history, maintained by the
   * backend summarization workflow. Absent until the first cycle runs. */
  summary?: string;
  createdAt?: string;
}

export interface LongTermMemoryRecord {
  id: string;
  text: string;
  memoryType?: string;
  userId?: string;
  sessionId?: string;
  namespace?: string;
  topics: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LongTermMemorySearchResponse {
  memories: LongTermMemoryRecord[];
  total: number;
}

export interface DiscoveryFiltersResponse {
  users: string[];
  namespaces: string[];
}

export interface AgentMemoryNewMessage {
  role: string;
  content: string;
}

export interface AgentMemoryScopeFilter {
  userId?: string;
}

/**
 * Store configuration as shown in the Redis Cloud console (General
 * Settings + Memory Configuration). Fields the backend doesn't expose
 * stay undefined.
 */
export interface AgentMemoryConfiguration {
  serviceName?: string;
  storeId?: string;
  database?: string;
  endpoint?: string;
  shortTermTtl?: string;
  longTermTtl?: string;
}
