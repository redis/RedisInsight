// FE-local values shared with the BE that are NOT exposed via the OpenAPI
// surface (HTTP REST). The Azure callback flow ships its result from the BE
// HTML callback page to the FE via `localStorage` (see
// redisinsight/api/src/modules/azure/auth/azure-auth-callback.template.ts), so
// both sides need the same string constants without a swagger contract.
//
// Other BE enums that appear in REST responses (ListElementDestination,
// NodeRole, HealthStatus, etc.) are re-exported from `apiClient` instead —
// keep new mirrors out of this file unless the value is genuinely
// out-of-band (socket.io / localStorage bridge / IPC).

export enum AzureAuthStatus {
  Processing = 'processing',
  Succeed = 'succeed',
  Failed = 'failed',
}

export const AZURE_OAUTH_STORAGE_KEY = 'ri_azure_oauth_result'
