export interface AzureSubscription {
  subscriptionId: string;
  displayName: string;
  state: string;
}

export interface AzureRedisDatabase {
  id: string;
  name: string;
  subscriptionId: string;
  subscriptionName: string;
  resourceGroup: string;
  location: string;
  type: 'standard' | 'enterprise';
  host: string;
  port: number;
  sslPort?: number;
  provisioningState: string;
  sku?: {
    name: string;
    family?: string;
    capacity?: number;
  };
  // For enterprise clusters
  accessKeysAuthentication?: 'Enabled' | 'Disabled';
}

export interface AzureConnectionDetails {
  host: string;
  port: number;
  password?: string;
  username?: string;
  tls: boolean;
  authType: 'accessKey' | 'entraId';
  /** Token expiration time for Entra ID authentication (ISO string) */
  tokenExpiresAt?: string;
  /** MSAL account ID for token refresh (homeAccountId) */
  azureAccountId?: string;
  /** Azure subscription ID */
  subscriptionId: string;
  /** Azure subscription display name */
  subscriptionName: string;
  /** Azure resource group name */
  resourceGroup: string;
  /** Full Azure resource ID */
  resourceId: string;
}
