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

// TODO(RI-8196): remove this enum once the BE PR merges
// (https://github.com/redis/RedisInsight/pull/5930) and `BulkActionConfirmation`
// becomes available from `apiClient`. At that point, switch all imports of
// `BulkActionConfirmation` from `uiSrc/constants` to `apiClient` and delete
// this definition. String values must stay in sync with the BE enum.
export enum BulkActionConfirmation {
  Standard = 'standard',
  TypeToConfirm = 'type-to-confirm',
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
