export interface IndexSummary {
  name: string
  prefixes: string[]
  keyType: string
}

export enum UseIsKeyIndexedStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

export interface UseIsKeyIndexedResult {
  isIndexed: boolean
  indexes: IndexSummary[]
  status: UseIsKeyIndexedStatus
  refresh: () => Promise<void>
}
