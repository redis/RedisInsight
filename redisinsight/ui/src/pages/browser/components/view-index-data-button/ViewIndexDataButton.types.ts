import { IndexSummary } from 'uiSrc/slices/interfaces/redisearch'

export interface ViewIndexDataButtonProps {
  indexes: IndexSummary[]
  instanceId: string
  onNavigate?: (indexName: string) => void
}
