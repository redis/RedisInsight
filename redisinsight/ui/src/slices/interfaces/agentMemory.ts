import { Nullable } from 'uiSrc/utils'

export enum AgentMemoryBackendType {
  Oss = 'oss',
  Cloud = 'cloud',
}

export interface AgentMemoryEndpoint {
  id: string
  name: string
  url: string
  backendType: AgentMemoryBackendType
  storeId?: string
  apiKey?: string
  lastConnection?: Date
}

export interface AgentMemoryCapabilities {
  namespaces: boolean
  optimizeQuery: boolean
  summaryViews: boolean
  addEvents: boolean
}

export interface AgentMemoryMessage {
  id?: string
  role: string
  content: string
  createdAt?: string
  /** When the message was persisted to Redis (messages have no updated_at) */
  persistedAt?: string
  discreteMemoryExtracted?: boolean | null
}

export interface WorkingMemory {
  sessionId: string
  userId?: string
  namespace?: string
  messages: AgentMemoryMessage[]
  summary?: string
  createdAt?: string
  /** undefined = no expiry */
  ttlSeconds?: number
}

export interface LongTermMemoryRecord {
  id: string
  /** Full Redis key holding the memory (OSS only), e.g. `memory_idx:<id>` */
  key?: string
  text: string
  memoryType?: string
  userId?: string
  sessionId?: string
  namespace?: string
  topics: string[]
  entities: string[]
  createdAt?: string
  updatedAt?: string
  score?: number
}

export interface SummaryView {
  id: string
  name: string
  groupBy: string[]
  continuous?: boolean
}

/** Groupings covered by the backend's create-default-views endpoint */
export const DEFAULT_SUMMARY_GROUPINGS = [['user_id'], ['session_id']]

export const DEFAULT_MEMORY_TYPE = 'semantic'

export interface SummaryViewPartition {
  summary?: string
  group?: Record<string, string>
  memory_count?: number
  computed_at?: string
  [key: string]: unknown
}

export enum AgentMemoryWorkspaceTab {
  Overview = 'overview',
  LongTermMemory = 'long-term-memory',
  Configuration = 'configuration',
}

export const AGENT_MEMORY_EVENT_ROLES = [
  'user',
  'assistant',
  'system',
  'tool',
] as const

/** The Cloud service has no 'tool' role */
export const CLOUD_AGENT_MEMORY_EVENT_ROLES = ['user', 'assistant', 'system']

export interface AgentMemorySessionEvent {
  sessionId: string
  role: string
  content: string
}

export interface AgentMemoryConfiguration {
  serviceName?: string
  storeId?: string
  database?: string
  endpoint?: string
  shortTermTtl?: string
  longTermTtl?: string
}

export interface StateAgentMemoryEndpoints {
  loading: boolean
  error: string
  data: AgentMemoryEndpoint[]
  loadingChanging: boolean
  connectedEndpoint: {
    id: string
    name: string
    url: string
    backendType: AgentMemoryBackendType
    loading: boolean
    error: string
    capabilities: Nullable<AgentMemoryCapabilities>
  }
}

export interface StateAgentMemoryWorkspace {
  /** Endpoint the inspector is currently bound to - responses from
   * requests started for any other endpoint are dropped as stale. */
  endpointId: Nullable<string>
  filters: {
    loading: boolean
    users: string[]
    namespaces: string[]
    sessions: string[]
    userId: Nullable<string>
    namespace: Nullable<string>
    sessionId: Nullable<string>
  }
  workingMemory: {
    loading: boolean
    error: string
    data: Nullable<WorkingMemory>
    lastRefreshTime: Nullable<number>
  }
  longTermMemory: {
    loading: boolean
    error: string
    data: LongTermMemoryRecord[]
    lastRefreshTime: Nullable<number>
    search: string
    optimizeQuery: boolean
    topics: string[]
    entities: string[]
    sessionIds: string[]
    memoryTypes: string[]
    userIds: string[]
    namespaces: string[]
  }
  summary: {
    loading: boolean
    /** null until fetched, and when the backend has no summary views API */
    views: Nullable<SummaryView[]>
    partitions: Record<string, SummaryViewPartition[]>
    /** views with a whole-view recompute task in flight */
    runningViewIds: string[]
    lastRefreshTime: Nullable<number>
  }
  configuration: {
    loading: boolean
    data: Nullable<AgentMemoryConfiguration>
  }
}
