export enum BulkActionsServerEvent {
  Create = 'create',
  Get = 'get',
  Abort = 'abort',
  Overview = 'overview',
  Error = 'error',
  SubscribeReport = 'subscribe-bulk-action-report',
  UnsubscribeReport = 'unsubscribe-bulk-action-report',
  StartExecution = 'start-bulk-action-execution',
}

export enum BulkActionsClientEvent {
  ReportKeys = 'report-keys',
  ReportComplete = 'report-complete',
  ReportReady = 'report-ready',
}

export enum BulkActionsType {
  Delete = 'delete',
  Upload = 'upload',
  Unlink = 'unlink',
}

export enum BulkActionsStatus {
  Initializing = 'initializing',
  Initialized = 'initialized',
  Preparing = 'preparing',
  Ready = 'ready',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Aborted = 'aborted',
  Disconnected = 'disconnected',
}

export const MAX_BULK_ACTION_ERRORS_LENGTH = 500
