export enum AzureLoginSource {
  Autodiscovery = 'autodiscovery',
  TokenRefresh = 'token-refresh',
}

export enum AzureRedisType {
  Standard = 'standard',
  Enterprise = 'enterprise',
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
  accessKeysAuthentication?: AzureAccessKeysStatus
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
