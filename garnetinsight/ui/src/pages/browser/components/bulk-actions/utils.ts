import { BulkActionsStatus } from 'uiSrc/constants'

export const isProcessingBulkAction = (status?: BulkActionsStatus) =>
  status === BulkActionsStatus.Running ||
  status === BulkActionsStatus.Preparing ||
  status === BulkActionsStatus.Initializing

export const isProcessedBulkAction = (status?: BulkActionsStatus) =>
  status === BulkActionsStatus.Completed ||
  status === BulkActionsStatus.Aborted ||
  status === BulkActionsStatus.Failed ||
  status === BulkActionsStatus.Disconnected
