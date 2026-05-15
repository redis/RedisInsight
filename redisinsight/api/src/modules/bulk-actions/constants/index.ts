export enum BulkActionsServerEvents {
  Create = 'create',
  Get = 'get',
  Abort = 'abort',
}

export enum BulkActionType {
  Delete = 'delete',
  Upload = 'upload',
  Unlink = 'unlink',
}

export enum BulkActionConfirmation {
  Standard = 'standard',
  TypeToConfirm = 'type-to-confirm',
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
