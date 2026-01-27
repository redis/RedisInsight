import {
  AzureAccessKeysStatus,
  AzureAuthType,
  AzureRedisType,
} from '../constants';

export interface AzureSubscription {
  subscriptionId: string;
  displayName: string;
  state: string;
}

export interface AzureRedisDatabase {
  id: string;
  name: string;
  subscriptionId: string;
  resourceGroup: string;
  location: string;
  type: AzureRedisType;
  host: string;
  port: number;
  sslPort?: number;
  provisioningState: string;
  sku?: {
    name: string;
    family?: string;
    capacity?: number;
  };
  accessKeysAuthentication?: AzureAccessKeysStatus;
}

export interface AzureConnectionDetails {
  host: string;
  port: number;
  password?: string;
  username?: string;
  tls: boolean;
  authType: AzureAuthType;
  azureAccountId?: string;
  subscriptionId: string;
  resourceGroup: string;
  resourceId: string;
}
