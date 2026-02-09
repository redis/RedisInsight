export enum TelemetryEvents {
  // Main events
  ApplicationFirstStart = 'APPLICATION_FIRST_START',
  ApplicationStarted = 'APPLICATION_STARTED',
  AnalyticsPermission = 'ANALYTICS_PERMISSION',
  SettingsScanThresholdChanged = 'SETTINGS_KEYS_TO_SCAN_CHANGED',
  SettingsWorkbenchPipelineChanged = 'SETTINGS_WORKBENCH_PIPELINE_CHANGED',
  DatabaseConnectedClientList = 'DATABASE_CONNECTED_CLIENT_LIST',

  // Events for redis instances
  RedisInstanceAdded = 'CONFIG_DATABASES_DATABASE_ADDED',
  RedisInstanceAddFailed = 'CONFIG_DATABASES_DATABASE_ADD_FAILED',
  RedisInstanceDeleted = 'CONFIG_DATABASES_DATABASE_DELETED',
  RedisInstanceEditedByUser = 'CONFIG_DATABASES_DATABASE_EDITED_BY_USER',
  RedisInstanceConnectionFailed = 'DATABASE_CONNECTION_FAILED',

  // Databases import
  DatabaseImportParseFailed = 'CONFIG_DATABASES_REDIS_IMPORT_PARSE_FAILED',
  DatabaseImportFailed = 'CONFIG_DATABASES_REDIS_IMPORT_FAILED',
  DatabaseImportSucceeded = 'CONFIG_DATABASES_REDIS_IMPORT_SUCCEEDED',
  DatabaseImportPartiallySucceeded = 'CONFIG_DATABASES_REDIS_IMPORT_PARTIALLY_SUCCEEDED',

  // Events for autodiscovery flows
  RedisSoftwareDiscoverySucceed = 'CONFIG_DATABASES_REDIS_SOFTWARE_AUTODISCOVERY_SUCCEEDED',
  RedisSoftwareDiscoveryFailed = 'CONFIG_DATABASES_REDIS_SOFTWARE_AUTODISCOVERY_FAILED',
  RedisCloudSubscriptionsDiscoverySucceed = 'CONFIG_DATABASES_REDIS_CLOUD_AUTODISCOVERY_SUBSCRIPTIONS_SUCCEEDED',
  RedisCloudSubscriptionsDiscoveryFailed = 'CONFIG_DATABASES_REDIS_CLOUD_AUTODISCOVERY_SUBSCRIPTIONS_FAILED',
  RedisCloudDatabasesDiscoverySucceed = 'CONFIG_DATABASES_REDIS_CLOUD_AUTODISCOVERY_DATABASES_SUCCEEDED',
  RedisCloudDatabasesDiscoveryFailed = 'CONFIG_DATABASES_REDIS_CLOUD_AUTODISCOVERY_DATABASES_FAILED',
  SentinelMasterGroupsDiscoverySucceed = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUCCEEDED',
  SentinelMasterGroupsDiscoveryFailed = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_FAILED',

  // Events for cloud oauth
  CloudSignInSucceeded = 'CLOUD_SIGN_IN_SUCCEEDED',
  CloudSignInFailed = 'CLOUD_SIGN_IN_FAILED',
  CloudFreeDatabaseCreated = 'CLOUD_FREE_DATABASE_CREATED',
  CloudFreeDatabaseFailed = 'CLOUD_FREE_DATABASE_FAILED',

  // Events for Azure oauth
  AzureSignInSucceeded = 'AZURE_SIGN_IN_SUCCEEDED',
  AzureSignInFailed = 'AZURE_SIGN_IN_FAILED',

  // Events for Azure autodiscovery
  AzureSubscriptionsDiscoverySucceeded = 'AZURE_SUBSCRIPTIONS_AUTODISCOVERY_SUCCEEDED',
  AzureSubscriptionsDiscoveryFailed = 'AZURE_SUBSCRIPTIONS_AUTODISCOVERY_FAILED',
  AzureDatabasesDiscoverySucceeded = 'AZURE_DATABASES_AUTODISCOVERY_SUCCEEDED',
  AzureDatabasesDiscoveryFailed = 'AZURE_DATABASES_AUTODISCOVERY_FAILED',
  AzureDatabaseAdded = 'AZURE_DATABASE_ADDED',
  AzureDatabaseAddFailed = 'AZURE_DATABASE_ADD_FAILED',

  // Event for cloud CAPI keys
  CloudAccountKeyGenerated = 'CLOUD_ACCOUNT_KEY_GENERATED',
  CloudAccountKeyGenerationFailed = 'CLOUD_ACCOUNT_KEY_GENERATION_FAILED',
  CloudAccountSecretGenerated = 'CLOUD_ACCOUNT_SECRET_GENERATED',
  CloudAccountSecretGenerationFailed = 'CLOUD_ACCOUNT_SECRET_GENERATION_FAILED',

  // Events for cli tool
  CliClientCreated = 'CLI_CLIENT_CREATED',
  CliClientCreationFailed = 'CLI_CLIENT_CREATION_FAILED',
  CliClientConnectionError = 'CLI_CLIENT_CONNECTION_ERROR',
  CliClientDeleted = 'CLI_CLIENT_DELETED',
  CliClientRecreated = 'CLI_CLIENT_RECREATED',
  CliCommandExecuted = 'CLI_COMMAND_EXECUTED',
  CliIndexInfoSubmitted = 'CLI_INDEX_INFO_SUBMITTED',
  CliClusterNodeCommandExecuted = 'CLI_CLUSTER_COMMAND_EXECUTED',
  CliCommandErrorReceived = 'CLI_COMMAND_ERROR_RECEIVED',

  // Events for workbench tool
  WorkbenchCommandExecuted = 'WORKBENCH_COMMAND_EXECUTED',
  WorkbenchIndexInfoSubmitted = 'WORKBENCH_INDEX_INFO_SUBMITTED',
  WorkbenchCommandErrorReceived = 'WORKBENCH_COMMAND_ERROR_RECEIVED',
  WorkbenchCommandDeleted = 'WORKBENCH_COMMAND_DELETE_COMMAND',

  // Events for search tool
  SearchCommandExecuted = 'SEARCH_COMMAND_EXECUTED',
  SearchIndexInfoSubmitted = 'SEARCH_INDEX_INFO_SUBMITTED',
  SearchCommandErrorReceived = 'SEARCH_COMMAND_ERROR_RECEIVED',

  // Custom tutorials
  WorkbenchEnablementAreaImportSucceeded = 'WORKBENCH_ENABLEMENT_AREA_IMPORT_SUCCEEDED',
  WorkbenchEnablementAreaImportFailed = 'WORKBENCH_ENABLEMENT_AREA_IMPORT_FAILED',

  // Profiler
  ProfilerLogDownloaded = 'PROFILER_LOG_DOWNLOADED',
  ProfilerLogDeleted = 'PROFILER_LOG_DELETED',

  // Slowlog
  SlowlogSetLogSlowerThan = 'SLOWLOG_SET_LOG_SLOWER_THAN',
  SlowlogSetMaxLen = 'SLOWLOG_SET_MAX_LEN',

  // Pub/Sub
  PubSubMessagePublished = 'PUBSUB_MESSAGE_PUBLISHED',
  PubSubChannelSubscribed = 'PUBSUB_CHANNEL_SUBSCRIBED',
  PubSubChannelUnsubscribed = 'PUBSUB_CHANNEL_UNSUBSCRIBED',

  // Bulk Actions
  BulkActionsStarted = 'BULK_ACTIONS_STARTED',
  BulkActionsStopped = 'BULK_ACTIONS_STOPPED',
  BulkActionsSucceed = 'BULK_ACTIONS_SUCCEED',
  BulkActionsFailed = 'BULK_ACTIONS_FAILED',
  ImportSamplesUploaded = 'IMPORT_SAMPLES_UPLOADED',

  // Feature
  FeatureFlagConfigUpdated = 'FEATURE_FLAG_CONFIG_UPDATED',
  FeatureFlagConfigUpdateError = 'FEATURE_FLAG_CONFIG_UPDATE_ERROR',
  FeatureFlagInvalidRemoteConfig = 'FEATURE_FLAG_INVALID_REMOTE_CONFIG',
  FeatureFlagRecalculated = 'FEATURE_FLAG_RECALCULATED',

  // Insights
  InsightsTipGenerated = 'INSIGHTS_TIP_GENERATED',

  // RDI
  RdiInstanceDeleted = 'RDI_INSTANCE_DELETED',
  RdiPipelineDeploymentSucceeded = 'RDI_PIPELINE_DEPLOYMENT_SUCCEEDED',
  RdiPipelineDeploymentFailed = 'RDI_PIPELINE_DEPLOYMENT_FAILED',
  RdiPipelineUploaded = 'RDI_PIPELINE_UPLOAD_SUCCEEDED',
  RdiPipelineUploadFailed = 'RDI_PIPELINE_UPLOAD_FAILED',
}

export enum CommandType {
  Core = 'core',
  Module = 'module',
}

export const unknownCommand = 'unknown';
