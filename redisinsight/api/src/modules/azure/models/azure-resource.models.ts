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
}
