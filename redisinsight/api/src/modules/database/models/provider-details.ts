/**
 * Provider-specific metadata stored in the providerDetails JSON column.
 */

export type AzureAuthType = 'accessKey' | 'entraId';

/**
 * Azure-specific provider details for Azure Cache for Redis databases.
 */
export interface AzureProviderDetails {
  /** Azure subscription ID */
  subscriptionId: string;

  /** Azure subscription display name */
  subscriptionName: string;

  /** Azure resource group name */
  resourceGroup: string;

  /** Full Azure resource ID */
  resourceId: string;

  /** Authentication type used for connection */
  authType: AzureAuthType;

  /** Token expiration time for Entra ID authentication (ISO string) */
  tokenExpiresAt?: string;

  /** MSAL account ID for token refresh (homeAccountId) */
  azureAccountId?: string;
}

/**
 * Union type for all provider-specific details.
 * Extend this as more cloud providers are supported.
 */
export type ProviderDetails = AzureProviderDetails;

/**
 * Helper to check if provider details are Azure-specific
 */
export function isAzureProviderDetails(
  details: ProviderDetails | null | undefined,
): details is AzureProviderDetails {
  if (!details) return false;
  return (
    'subscriptionId' in details &&
    'resourceGroup' in details &&
    'authType' in details
  );
}

/**
 * Helper to check if database uses Azure Entra ID authentication
 */
export function isAzureEntraIdAuth(
  details: ProviderDetails | null | undefined,
): boolean {
  return isAzureProviderDetails(details) && details.authType === 'entraId';
}

