import { BulkActionsStatus, BulkActionsType, KeyTypes } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { IBulkActionOverview as IBulkActionOverviewBE } from 'apiSrc/modules/bulk-actions/interfaces/bulk-action-overview.interface'

export interface IBulkActionOverview
  extends Omit<IBulkActionOverviewBE, 'status'> {
  status: BulkActionsStatus
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
