import { IndexSummary } from 'uiSrc/slices/interfaces/redisearch'

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
