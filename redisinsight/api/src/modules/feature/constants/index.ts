import { Feature } from 'src/modules/feature/model/feature';

export enum FeatureServerEvents {
  FeaturesRecalculate = 'FeaturesRecalculate',
  FeaturesRecalculated = 'FeaturesRecalculated',
}

export enum FeatureEvents {
  Features = 'features',
}

export enum FeatureStorage {
  Env = 'env',
  Database = 'database',
  Custom = 'custom',
}
export enum FeatureConfigConfigDestination {
  Default = 'default',
  Remote = 'remote',
}

export enum KnownFeatures {
  InsightsRecommendations = 'insightsRecommendations',
  CloudSso = 'cloudSso',
  CloudSsoRecommendedSettings = 'cloudSsoRecommendedSettings',
  RedisModuleFilter = 'redisModuleFilter',
  RedisClient = 'redisClient',
  DocumentationChat = 'documentationChat',
  DatabaseChat = 'databaseChat',
  Rdi = 'redisDataIntegration',
  HashFieldExpiration = 'hashFieldExpiration',
  EnhancedCloudUI = 'enhancedCloudUI',
  DatabaseManagement = 'databaseManagement',
  VectorSearch = 'vectorSearch',
  DatabasesListV2 = 'databasesListV2',
  AzureEntraId = 'azureEntraId',
}

export interface IFeatureFlag {
  name: string;
  storage: string;
  factory?: () => Partial<Feature>;
}
