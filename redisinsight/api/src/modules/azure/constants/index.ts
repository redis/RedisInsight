// Azure OAuth Configuration
// These are PoC values - in production, these should come from config/env
export const AZURE_CONFIG = {
  CLIENT_ID: 'f9895a25-74d6-40ca-ba97-a547ea0b5717',
  TENANT_ID: 'be18ca4e-bb52-4385-8b6a-0ecfb7e7033c',
  REDIRECT_URI: 'http://localhost:5541/azure/oauth/callback',
  // Management API scopes (for listing resources, fetching keys)
  MANAGEMENT_SCOPES: [
    'openid',
    'profile',
    'offline_access',
    'https://management.azure.com/user_impersonation',
  ],
  // Redis scopes (for Entra ID auth to Redis) - must be requested separately
  REDIS_SCOPES: ['https://redis.azure.com/.default'],
} as const;

// Azure Resource Manager API endpoints
export const AZURE_API_BASE = 'https://management.azure.com';
export const API_VERSION_SUBSCRIPTIONS = '2022-12-01';
export const API_VERSION_REDIS = '2023-08-01';
export const API_VERSION_REDIS_ENTERPRISE = '2024-09-01-preview';

// Token refresh buffer (refresh 5 minutes before expiry)
export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
