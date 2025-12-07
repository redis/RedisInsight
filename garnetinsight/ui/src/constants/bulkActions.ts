export enum BulkActionsServerEvent {
  Create = 'create',
  Get = 'get',
  Abort = 'abort',
  Overview = 'overview',
  Error = 'error',
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
