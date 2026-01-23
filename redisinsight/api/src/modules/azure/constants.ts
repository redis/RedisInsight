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
 * Azure auth status values
 */
export enum AzureAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}
