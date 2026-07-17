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
  AgentMemory = 'agentMemory',
  HashFieldExpiration = 'hashFieldExpiration',
  EnhancedCloudUI = 'enhancedCloudUI',
  DatabaseManagement = 'databaseManagement',
  CustomTutorials = 'customTutorials',
  VectorSearchV2 = 'vectorSearchV2',
  AzureEntraId = 'azureEntraId',
  DevAzureEntraId = 'dev-azureEntraId',
  DevBrowser = 'dev-browser',
  VectorSet = 'vectorSet',
  DevArray = 'dev-array',
  ProdMode = 'prodMode',
  DevLanguage = 'dev-language',
  WhatsNew = 'whatsNew',
}

export interface IFeatureFlag {
  name: string;
  storage: string;
  factory?: () => Partial<Feature>;
}
