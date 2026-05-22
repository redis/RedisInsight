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

// Mirrors `BulkActionConfirmation` in
// `redisinsight/api/src/modules/bulk-actions/constants/index.ts` (BE PR #5930,
// merged). The BE enum is not re-exported via `apiClient` because bulk-actions
// is exposed through a WebSocket gateway, and `dump-openapi.ts` only surfaces
// REST DTOs. If a REST endpoint ever references `CreateBulkActionDto` (or the
// OpenAPI dumper is extended to cover WS DTOs), switch all imports of
// `BulkActionConfirmation` to `apiClient` and delete this definition. String
// values must stay in sync with the BE enum.
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
