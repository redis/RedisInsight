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

export interface AzureSubscription {
  subscriptionId: string
  displayName: string
  state: string
}

export interface AzureRedisSku {
  name: string
  family?: string
  capacity?: number
}

export interface AzureRedisDatabase {
  id: string
  name: string
  subscriptionId: string
  resourceGroup: string
  location: string
  type: AzureRedisType
  host: string
  port: number
  sslPort?: number
  provisioningState: string
  sku?: AzureRedisSku
  accessKeysAuthentication?: AzureAccessKeysStatus
}

export interface AzureConnectionDetails {
  host: string
  port: number
  password?: string
  username?: string
  tls: boolean
  authType: AzureAuthType
  azureAccountId?: string
  subscriptionId: string
  resourceGroup: string
  resourceId: string
}

export enum CloudProvider {
  Azure = 'azure',
}

export interface AzureProviderDetails {
  provider: CloudProvider.Azure
  authType: AzureAuthType
  azureAccountId?: string
}
