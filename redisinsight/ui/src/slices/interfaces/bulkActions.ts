import {
  BulkActionsStatus,
  BulkActionsType,
  KeyTypes,
  RedisDataType,
} from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

export interface IBulkActionFilterOverview {
  type: RedisDataType
  match: string
}

export interface IBulkActionProgressOverview {
  total: number
  scanned: number
}

export interface IBulkActionSummaryOverview {
  processed: number
  succeed: number
  failed: number
  errors: Array<Record<string, string>>
  keys: Array<unknown>
}

export interface IBulkActionOverview {
  id: string
  databaseId: string
  duration: number
  type: BulkActionsType
  status: BulkActionsStatus
  filter: IBulkActionFilterOverview
  progress: IBulkActionProgressOverview
  summary: IBulkActionSummaryOverview
  downloadUrl?: string
  error?: string
}

export interface StateBulkActions {
  isShowBulkActions: boolean
  loading: boolean
  error: string
  isConnected: boolean
  selectedBulkAction: SelectedBulkAction
  bulkDelete: {
    isActionTriggered: boolean
    loading: boolean
    error: string
    overview: Nullable<IBulkActionOverview>
    generateReport: boolean
    filter: Nullable<KeyTypes>
    search: string
    keyCount: Nullable<number>
  }
  bulkUpload: {
    loading: boolean
    error: string
    overview: Nullable<IBulkActionOverview>
    fileName?: string
  }
}

export interface SelectedBulkAction {
  id: string
  type: Nullable<BulkActionsType>
}
