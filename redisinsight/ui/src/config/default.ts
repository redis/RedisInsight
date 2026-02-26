import * as packageJson from '../../../package.json'

const intEnv = (envName: string, defaultValue: number): number => {
  const value = parseInt(process?.env?.[envName] || '', 10)

  return Number.isNaN(value) ? defaultValue : value
}

const booleanEnv = (envName: string, defaultValue: boolean): boolean => {
  const value = process?.env?.[envName]

  if (value === undefined) {
    return defaultValue
  }

  return ['true', '1'].includes(value || '')
}

const apiUrl =
  process.env.RI_SERVER_TLS_CERT && process.env.RI_SERVER_TLS_KEY
    ? 'https://localhost'
    : 'http://localhost'

export const defaultConfig = {
  api: {
    prefix: process.env.RI_API_PREFIX ?? 'api',
    port: intEnv('RI_APP_PORT', 5540),
    baseUrl: process.env.RI_BASE_API_URL ?? apiUrl,
    hostedBaseUrl: process.env.RI_HOSTED_API_BASE_URL ?? '',
    hostedBase: process.env.RI_HOSTED_BASE ?? '',
    csrfEndpoint: process.env.RI_CSRF_ENDPOINT ?? '',
    socketTransports: process.env.RI_SOCKET_TRANSPORTS,
    socketCredentials: booleanEnv('RI_SOCKET_CREDENTIALS', false),
    hostedSocketProxyPath: process.env.RI_HOSTED_SOCKET_PROXY_PATH,
  },
  database: {
    defaultConnectionTimeout: intEnv('RI_CONNECTIONS_TIMEOUT_DEFAULT', 30_000),
    defaultTimeoutToGetInfo: intEnv('RI_TIMEOUT_TO_GET_INFO', 5_000),
    defaultTimeoutToGetRecommendations: intEnv(
      'RI_TIMEOUT_TO_GET_RECOMMENDATIONS',
      60_000,
    ),
    shouldGetRecommendations: booleanEnv(
      'RI_SHOULD_GET_RECOMMENDATIONS',
      false,
    ),
  },
  app: {
    version: packageJson.version,
    sha: process.env.GITHUB_SHA,
    env: process.env.NODE_ENV,
    type: process.env.RI_APP_TYPE,
    resourcesBaseUrl: process.env.RI_RESOURCES_BASE_URL ?? apiUrl, // todo: no usage found
    unauthenticatedRedirect: process.env.RI_401_REDIRECT_URL ?? '',
    smConsoleRedirect: process.env.RI_SM_REDIRECT_URL ?? '',
    dbUpgradeRedirectBase: process.env.RI_DB_UPGRADE_REDIRECT_URL ?? '',
    defaultTheme: process.env.RI_DEFAULT_THEME ?? 'SYSTEM',
    lazyLoad: booleanEnv('RI_ROUTES_LAZY_LOAD', false),
    routesExcludedByEnv: booleanEnv('RI_ROUTES_EXCLUDED_BY_ENV', false),
    returnUrlBase: process.env.RI_RETURN_URL_BASE,
    returnUrlLabel: process.env.RI_RETURN_URL_LABEL || 'Back',
    returnUrlTooltip: process.env.RI_RETURN_URL_TOOLTIP || 'Back',
    activityMonitorOrigin: process.env.RI_ACTIVITY_MONITOR_ORIGIN,
    activityMonitorThrottleTimeout: intEnv(
      'RI_ACTIVITY_MONITOR_THROTTLE_TIMEOUT',
      30_000,
    ),
    sessionTtlSeconds: intEnv('RI_SESSION_TTL_SECONDS', 30 * 60),
    localResourcesBaseUrl: process.env.RI_LOCAL_RESOURCES_BASE_URL,
    useLocalResources: booleanEnv('RI_USE_LOCAL_RESOURCES', false),
    indexedDbName: process.env.RI_INDEXED_DB_NAME || 'RI_LOCAL_STORAGE',
    vectorSearchIndexedDbName:
      process.env.RI_VECTOR_SEARCH_INDEXED_DB_NAME ||
      'RI_VECTOR_SEARCH_STORAGE',
    truncatedStringPrefix:
      process.env.RI_CLIENTS_TRUNCATED_STRING_PREFIX ||
      '[Truncated due to length]',
  },
  workbench: {
    pipelineCountDefault: intEnv('PIPELINE_COUNT_DEFAULT', 5),
    maxResultSize: intEnv('RI_COMMAND_EXECUTION_MAX_RESULT_SIZE', 1024 * 1024),
  },
  browser: {
    scanCountDefault: intEnv('RI_SCAN_COUNT_DEFAULT', 500),
    scanTreeCountDefault: intEnv('RI_SCAN_TREE_COUNT_DEFAULT', 10_000),
    databaseOverviewRefreshInterval: intEnv(
      'RI_DATABASE_OVERVIEW_REFRESH_INTERVAL',
      5,
    ),
    databaseOverviewMinimumRefreshInterval: intEnv(
      'RI_DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL',
      1,
    ),
    rejsonMonacoEditorMaxThreshold: intEnv(
      'RI_REJSON_MONACO_EDITOR_MAX_THRESHOLD',
      10_000,
    ),
  },
  features: {
    envDependent: {
      defaultFlag: booleanEnv('RI_FEATURES_ENV_DEPENDENT_DEFAULT_FLAG', true),
    },
    cloudAds: {
      defaultFlag: booleanEnv('RI_FEATURES_CLOUD_ADS_DEFAULT_FLAG', true),
    },
  },
  sentry: {
    dsn: process.env.RI_SENTRY_ELECTRON_DSN ?? '',
    environment: process.env.RI_SENTRY_ENVIRONMENT ?? 'development',
    enabled: booleanEnv('RI_SENTRY_ENABLED', false),
  },
}

export type Config = typeof defaultConfig

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
export type PartialConfig = DeepPartial<Config>
