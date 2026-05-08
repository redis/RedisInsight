// Mirrors of BE enums that the OpenAPI generator inlines as string-literal
// unions in the generated `apiClient` (see redisinsight/api-client). These are
// kept here so the UI does not import enum values from the API codebase.

export enum ListElementDestination {
  Tail = 'TAIL',
  Head = 'HEAD',
}

export enum NodeRole {
  Primary = 'primary',
  Replica = 'replica',
}

export enum HealthStatus {
  Online = 'online',
  Offline = 'offline',
  Loading = 'loading',
}

export enum AzureAuthStatus {
  Processing = 'processing',
  Succeed = 'succeed',
  Failed = 'failed',
}

export const AZURE_OAUTH_STORAGE_KEY = 'ri_azure_oauth_result'
