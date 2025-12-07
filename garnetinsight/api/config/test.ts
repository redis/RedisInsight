export default {
  dir_path: {
    dataDir: process.env.RI_DATA_DIR || '.test_run/data',
  },
  server: {
    env: 'test',
    requestTimeout: parseInt(process.env.RI_REQUEST_TIMEOUT, 10) || 1000,
  },
  db: {
    synchronize: process.env.RI_DB_SYNC
      ? process.env.RI_DB_SYNC === 'true'
      : true,
    migrationsRun: process.env.RI_DB_MIGRATIONS
      ? process.env.RI_DB_MIGRATIONS === 'true'
      : false,
  },
  profiler: {
    logFileIdleThreshold:
      parseInt(process.env.RI_PROFILER_LOG_FILE_IDLE_THRESHOLD, 10) || 1000 * 2, // 3sec
  },
  notifications: {
    updateUrl:
      process.env.RI_NOTIFICATION_UPDATE_URL ||
      'https://s3.amazonaws.com/garnetinsight.test/public/tests/notifications.json',
  },
  features_config: {
    url:
      process.env.RI_FEATURES_CONFIG_URL ||
      'http://localhost:5551/remote/features-config.json',
  },
  analytics: {
    startEvents: process.env.RI_ANALYTICS_START_EVENTS
      ? process.env.RI_ANALYTICS_START_EVENTS === 'true'
      : true,
  },
  cloud: {
    apiUrl:
      process.env.RI_CLOUD_API_URL ||
      'https://app-sm.k8s-cloudapi.sm-qa.qa.redislabs.com/api/v1',
    apiToken: process.env.RI_CLOUD_API_TOKEN || 'token',
    capiUrl:
      process.env.RI_CLOUD_CAPI_URL ||
      'https://api-k8s-cloudapi.qa.redislabs.com/v1',
    capiKeyName: process.env.RI_CLOUD_CAPI_KEY_NAME || 'Garnetinsight',
    freeSubscriptionName:
      process.env.RI_CLOUD_FREE_SUBSCRIPTION_NAME || 'My free subscription',
    freeDatabaseName: process.env.RI_CLOUD_FREE_DATABASE_NAME || 'Redis-Cloud',
    defaultPlanRegion: process.env.RI_CLOUD_DEFAULT_PLAN_REGION || 'eu-west-1',
    jobIterationInterval:
      parseInt(process.env.RI_CLOUD_JOB_ITERATION_INTERVAL, 10) || 10_000, // 10 sec
    discoveryTimeout:
      parseInt(process.env.RI_CLOUD_DISCOVERY_TIMEOUT, 10) || 60 * 1000, // 1 min
    databaseConnectionTimeout:
      parseInt(process.env.RI_CLOUD_DATABASE_CONNECTION_TIMEOUT, 10) ||
      30 * 1000,
    renewTokensBeforeExpire:
      parseInt(process.env.RI_CLOUD_DATABASE_CONNECTION_TIMEOUT, 10) ||
      2 * 60_000, // 2min
    idp: {
      google: {
        authorizeUrl: 'oauth2/authorize',
        tokenUrl: 'oauth2/token',
        revokeTokenUrl: 'oauth2/revoke',
        issuer: 'https://authorization.server.com',
        clientId: 'cid_p6vA6A5tF36Jf6twH2cBOqtt7n',
        redirectUri: 'garnetinsight:/cloud/oauth/callback',
        idp: 'test-google-idp',
      },
      github: {
        authorizeUrl: 'oauth2/authorize',
        tokenUrl: 'oauth2/token',
        revokeTokenUrl: 'oauth2/revoke',
        issuer: 'https://authorization.server.com',
        clientId: 'cid_p6vA6A5tF36Jf6twH2cBOqtt7n',
        redirectUri: 'garnetinsight:/cloud/oauth/callback',
        idp: 'test-github-idp',
      },
    },
  },
};
