/**
 * Azure AD authority URL for multi-tenant authentication.
 * Uses 'common' endpoint to allow any Azure AD tenant.
 */
export const AZURE_AUTHORITY = 'https://login.microsoftonline.com/common';

/**
 * Azure App Registration Client ID.
 */
export const AZURE_CLIENT_ID = '61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0';

/**
 * Azure Redis scope for Entra ID authentication.
 * This scope is required to get access tokens for Azure Cache for Redis.
 */
export const AZURE_REDIS_SCOPE = 'https://redis.azure.com/.default';

/**
 * Azure Management scope for Azure Resource Manager API.
 * Used for autodiscovery of Azure Redis resources.
 */
export const AZURE_MANAGEMENT_SCOPE = 'https://management.azure.com/.default';

/**
 * Azure OAuth redirect path for the application.
 */
export const AZURE_OAUTH_REDIRECT_PATH = 'redisinsight://azure/oauth/callback';

/**
 * Scopes requested during the initial OAuth login flow.
 *
 * IMPORTANT: Azure AD does not allow requesting scopes from multiple resources
 * (e.g., redis.azure.com AND management.azure.com) in a single authorization request.
 * This results in error AADSTS70011: "static scope limit exceeded".
 *
 * We request only the Redis scope during login. The Management scope can be
 * acquired later using acquireTokenSilent() when needed.
 *
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc
 */
export const AZURE_OAUTH_SCOPES = [
  AZURE_REDIS_SCOPE,
  'offline_access', // Required for refresh tokens
  'openid', // Required for ID token
  'profile', // Required for user info (name, etc.)
];

export enum AzureAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export enum AzureRedisType {
  Standard = 'standard',
  Enterprise = 'enterprise',
}

export enum AzureAuthType {
  AccessKey = 'accessKey',
  EntraId = 'entraId',
}

export enum AzureAccessKeysStatus {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
}

/**
 * Azure subscription states from Azure Resource Manager API.
 * Values match Azure API response casing (PascalCase).
 * @see https://learn.microsoft.com/en-us/rest/api/resources/subscriptions/list#subscriptionstate
 */
export enum AzureSubscriptionState {
  Enabled = 'Enabled',
}

/**
 * Azure resource provisioning states.
 * Values match Azure API response casing (PascalCase).
 * @see https://learn.microsoft.com/en-us/rest/api/redis/redis/get#provisioningstate
 */
export enum AzureProvisioningState {
  Succeeded = 'Succeeded',
}

export const AZURE_API_BASE = 'https://management.azure.com';

export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

// API versions - latest stable as of January 2025

// https://learn.microsoft.com/en-us/rest/api/resources/subscriptions/list
export const API_VERSION_SUBSCRIPTIONS = '2022-12-01';
// https://learn.microsoft.com/en-us/rest/api/redis/redis
export const API_VERSION_REDIS = '2024-11-01';
// https://learn.microsoft.com/en-us/rest/api/redis/redisenterprisecache/redis-enterprise
export const API_VERSION_REDIS_ENTERPRISE = '2025-07-01';

export const AUTODISCOVERY_MAX_CONCURRENT_REQUESTS = 20;

// Azure subscription IDs are standard UUIDs (8-4-4-4-12 hex pattern)
export const AZURE_SUBSCRIPTION_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const AzureApiUrls = {
  getSubscriptions: () =>
    `/subscriptions?api-version=${API_VERSION_SUBSCRIPTIONS}`,

  getStandardRedisInSubscription: (subscriptionId: string) =>
    `/subscriptions/${subscriptionId}/providers/Microsoft.Cache/redis?api-version=${API_VERSION_REDIS}`,

  getEnterpriseRedisInSubscription: (subscriptionId: string) =>
    `/subscriptions/${subscriptionId}/providers/Microsoft.Cache/redisEnterprise?api-version=${API_VERSION_REDIS_ENTERPRISE}`,

  getEnterpriseDatabases: (
    subscriptionId: string,
    resourceGroup: string,
    clusterName: string,
  ) =>
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Cache/redisEnterprise/${clusterName}/databases?api-version=${API_VERSION_REDIS_ENTERPRISE}`,

  postStandardRedisKeys: (
    subscriptionId: string,
    resourceGroup: string,
    name: string,
  ) =>
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Cache/redis/${name}/listKeys?api-version=${API_VERSION_REDIS}`,

  postEnterpriseRedisKeys: (
    subscriptionId: string,
    resourceGroup: string,
    clusterName: string,
    databaseName: string = 'default',
  ) =>
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Cache/redisEnterprise/${clusterName}/databases/${databaseName}/listKeys?api-version=${API_VERSION_REDIS_ENTERPRISE}`,
};
