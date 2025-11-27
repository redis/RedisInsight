export enum BulkActionsServerEvents {
  Create = 'create',
  Get = 'get',
  Abort = 'abort',
  SubscribeBulkActionReport = 'subscribe-bulk-action-report',
  UnsubscribeBulkActionReport = 'unsubscribe-bulk-action-report',
  StartBulkActionExecution = 'start-bulk-action-execution',
}

export enum BulkActionsClientEvents {
  ReportKeys = 'report-keys',
  ReportComplete = 'report-complete',
  ReportReady = 'report-ready',
}

export enum BulkActionType {
  Delete = 'delete',
  Upload = 'upload',
  Unlink = 'unlink',
}

export enum BulkActionStatus {
  Initializing = 'initializing',
  Initialized = 'initialized',
  Preparing = 'preparing',
  Ready = 'ready',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Aborted = 'aborted',
}
