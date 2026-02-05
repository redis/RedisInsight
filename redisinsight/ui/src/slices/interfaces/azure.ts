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

export enum ActionStatus {
  Success = 'success',
  Fail = 'fail',
}

export interface ImportAzureDatabaseResponse {
  id: string
  status: ActionStatus
  message?: string
  databaseDetails?: AzureRedisDatabase
  error?: string | object
}

// Azure autodiscovery slice interfaces
export enum LoadedAzure {
  Subscriptions = 'subscriptions',
  Databases = 'databases',
  DatabasesAdded = 'databasesAdded',
}

export interface AzureDatabaseWithStatus extends AzureRedisDatabase {
  statusAdded?: ActionStatus
  messageAdded?: string
}

export interface InitialStateAzure {
  loading: boolean
  error: string
  subscriptions: AzureSubscription[] | null
  selectedSubscription: AzureSubscription | null
  databases: AzureRedisDatabase[] | null
  databasesAdded: AzureDatabaseWithStatus[]
  loaded: {
    [LoadedAzure.Subscriptions]: boolean
    [LoadedAzure.Databases]: boolean
    [LoadedAzure.DatabasesAdded]: boolean
  }
}
