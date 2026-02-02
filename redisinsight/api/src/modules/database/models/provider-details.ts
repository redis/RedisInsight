/**
 * Provider-specific metadata stored in the providerDetails JSON column.
 * This is used to store additional information about databases added through
 * cloud provider autodiscovery.
 */

export enum CloudProvider {
  Azure = 'azure',
}

export enum AzureAuthType {
  EntraId = 'entra-id',
  AccessKey = 'access-key',
}

export interface AzureProviderDetails {
  provider: CloudProvider.Azure;
  authType: AzureAuthType;
  /** MSAL account ID for token refresh (homeAccountId) */
  azureAccountId?: string;
}

export type ProviderDetails = AzureProviderDetails;
