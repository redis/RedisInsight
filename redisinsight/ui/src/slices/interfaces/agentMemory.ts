import { Nullable } from 'uiSrc/utils'

export enum AgentMemoryBackendType {
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

export interface AgentMemoryMessage {
  id?: string
  role: string
  content: string
  createdAt?: string
}

export interface AgentMemorySummary {
  text: string
  updatedAt?: string
  summarizedEvents?: number
}

export interface WorkingMemory {
  sessionId: string
  userId?: string
  namespace?: string
  messages: AgentMemoryMessage[]
  /** Compacted summary of older session history, maintained by the
   * backend summarization workflow. Absent until the first cycle runs. */
  summary?: AgentMemorySummary
  createdAt?: string
}

export interface LongTermMemoryRecord {
  id: string
  text: string
  memoryType?: string
  userId?: string
  sessionId?: string
  namespace?: string
  topics: string[]
  createdAt?: string
  updatedAt?: string
}

export const DEFAULT_MEMORY_TYPE = 'semantic'

export enum AgentMemoryWorkspaceTab {
  Overview = 'overview',
  LongTermMemory = 'long-term-memory',
  Configuration = 'configuration',
}

export const AGENT_MEMORY_EVENT_ROLES = ['user', 'assistant', 'system']

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
    topics: string[]
    sessionIds: string[]
    memoryTypes: string[]
    userIds: string[]
    namespaces: string[]
  }
  configuration: {
    loading: boolean
    data: Nullable<AgentMemoryConfiguration>
  }
}
