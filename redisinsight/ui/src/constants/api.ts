import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

enum ApiEndpoints {
  DATABASES = 'databases',
  DATABASES_IMPORT = 'databases/import',
  DATABASES_TEST_CONNECTION = 'databases/test',
  DATABASES_EXPORT = 'databases/export',

  TAGS = 'tags',

  BULK_ACTIONS_IMPORT = 'bulk-actions/import',
  BULK_ACTIONS_IMPORT_DEFAULT_DATA = 'bulk-actions/import/default-data',
  BULK_ACTIONS_IMPORT_TUTORIAL_DATA = 'bulk-actions/import/tutorial-data',
  BULK_ACTIONS_IMPORT_VECTOR_COLLECTION = 'bulk-actions/import/vector-collection',

  CA_CERTIFICATES = 'certificates/ca',
  CLIENT_CERTIFICATES = 'certificates/client',

  REDIS_CLUSTER_GET_DATABASES = 'redis-enterprise/cluster/get-databases',
  REDIS_CLUSTER_DATABASES = 'redis-enterprise/cluster/databases',

  REDIS_CLOUD_ACCOUNT = 'cloud/autodiscovery/account',
  REDIS_CLOUD_SUBSCRIPTIONS = 'cloud/autodiscovery/subscriptions',
  REDIS_CLOUD_GET_DATABASES = 'cloud/autodiscovery/get-databases',
  REDIS_CLOUD_DATABASES = 'cloud/autodiscovery/databases',

  SENTINEL_GET_DATABASES = 'redis-sentinel/get-databases',
  SENTINEL_DATABASES = 'redis-sentinel/databases',

  KEYS = 'keys',
  KEYS_METADATA = 'keys/get-metadata',
  KEY_INFO = 'keys/get-info',
  KEY_NAME = 'keys/name',
  KEY_TTL = 'keys/ttl',

  ZSET = 'zSet',
  ZSET_MEMBERS = 'zSet/members',
  ZSET_MEMBERS_SEARCH = 'zSet/search',
  ZSET_GET_MEMBERS = 'zSet/get-members',

  SET = 'set',
  SET_GET_MEMBERS = 'set/get-members',
  SET_MEMBERS = 'set/members',

  STRING = 'string',
  STRING_VALUE = 'string/get-value',
  STRING_VALUE_DOWNLOAD = 'string/download-value',

  HASH = 'hash',
  HASH_FIELDS = 'hash/fields',
  HASH_GET_FIELDS = 'hash/get-fields',
  HASH_TTL = 'hash/ttl',

  LIST = 'list',
  LIST_GET_ELEMENTS = 'list/get-elements',
  LIST_DELETE_ELEMENTS = 'list/elements',

  REJSON = 'rejson-rl',
  REJSON_GET = 'rejson-rl/get',
  REJSON_SET = 'rejson-rl/set',
  REJSON_ARRAPPEND = 'rejson-rl/arrappend',

  STREAMS = 'streams',
  STREAMS_ENTRIES = 'streams/entries',
  STREAMS_ENTRIES_GET = 'streams/entries/get',
  STREAMS_CONSUMER_GROUPS = 'streams/consumer-groups',
  STREAMS_CONSUMERS = 'streams/consumer-groups/consumers',
  STREAMS_CONSUMER_GROUPS_GET = 'streams/consumer-groups/get',
  STREAMS_CONSUMERS_GET = 'streams/consumer-groups/consumers/get',
  STREAMS_CONSUMERS_MESSAGES_GET = 'streams/consumer-groups/consumers/pending-messages/get',
  STREAM_CLAIM_PENDING_MESSAGES = 'streams/consumer-groups/consumers/pending-messages/claim',
  STREAM_ACK_PENDING_ENTRIES = 'streams/consumer-groups/consumers/pending-messages/ack',

  INFO = 'info',
  CLI_BLOCKING_COMMANDS = 'info/cli-blocking-commands',
  CLI_UNSUPPORTED_COMMANDS = 'info/cli-unsupported-commands',

  CLI = 'cli',
  SEND_COMMAND = 'send-command',
  SEND_CLUSTER_COMMAND = 'send-cluster-command',

  COMMAND_EXECUTIONS = 'command-executions',

  SETTINGS = 'settings',
  SETTINGS_AGREEMENTS_SPEC = 'settings/agreements/spec',

  WORKBENCH_COMMAND_EXECUTIONS = 'workbench/command-executions',

  PROFILER = 'profiler',
  PROFILER_LOGS = 'profiler/logs',

  REDIS_COMMANDS = 'commands',
  GUIDES = 'static/guides/manifest.json',
  TUTORIALS = 'static/tutorials/manifest.json',
  CUSTOM_TUTORIALS = 'custom-tutorials',
  CUSTOM_TUTORIALS_MANIFEST = 'custom-tutorials/manifest',
  PLUGINS = 'plugins',
  STATE = 'state',
  CONTENT_CREATE_DATABASE = 'static/content/create-redis.json',
  CONTENT_RECOMMENDATIONS = 'static/content/recommendations.json',
  CONTENT_GUIDE_LINKS = 'static/content/guide-links.json',
  GUIDES_PATH = 'static/guides',
  TUTORIALS_PATH = 'static/tutorials',
  CUSTOM_TUTORIALS_PATH = 'static/custom-tutorials',

  SLOW_LOGS = 'slow-logs',
  SLOW_LOGS_CONFIG = 'slow-logs/config',

  PUB_SUB = 'pub-sub',
  PUB_SUB_MESSAGES = 'pub-sub/messages',
  CLUSTER_DETAILS = 'cluster-details',
  DATABASE_ANALYSIS = 'analysis',
  RECOMMENDATIONS = 'recommendations',
  RECOMMENDATIONS_READ = 'recommendations/read',

  NOTIFICATIONS = 'notifications',
  NOTIFICATIONS_READ = 'notifications/read',

  REDISEARCH = 'redisearch',
  REDISEARCH_SEARCH = 'redisearch/search',
  REDISEARCH_INFO = 'redisearch/info',
  HISTORY = 'history',

  FEATURES = 'features',

  CLOUD_ME = 'cloud/me',
  CLOUD_ME_JOBS = 'cloud/me/jobs',
  CLOUD_ME_ACCOUNTS = 'cloud/me/accounts',
  CLOUD_ME_LOGOUT = 'cloud/me/logout',
  CLOUD_CURRENT = 'current',

  CLOUD_SUBSCRIPTION_PLANS = 'cloud/me/subscription/plans',

  CLOUD_ME_AUTODISCOVERY_ACCOUNT = 'cloud/me/autodiscovery/account',
  CLOUD_ME_AUTODISCOVERY_SUBSCRIPTIONS = 'cloud/me/autodiscovery/subscriptions',
  CLOUD_ME_AUTODISCOVERY_GET_DATABASES = 'cloud/me/autodiscovery/get-databases',
  CLOUD_ME_AUTODISCOVERY_DATABASES = 'cloud/me/autodiscovery/databases',
  CLOUD_CAPI_KEYS = 'cloud/me/capi-keys',

  AI_ASSISTANT_CHATS = 'ai/assistant/chats',
  AI_EXPERT = 'ai/expert',

  ANALYTICS_SEND_EVENT = 'analytics/send-event',
  ANALYTICS_SEND_PAGE = 'analytics/send-page',

  AZURE_AUTH_LOGIN = 'azure/auth/login',

  RDI_INSTANCES = 'rdi',
  RDI_PIPELINE = 'pipeline',
  RDI_PIPELINE_SCHEMA = 'pipeline/schema',
  RDI_DEPLOY_PIPELINE = 'pipeline/deploy',
  RDI_TEST_CONNECTIONS = 'pipeline/test-connections',
  RDI_PIPELINE_STRATEGIES = 'pipeline/strategies',
  RDI_JOB_TEMPLATE = 'pipeline/job/template',
  RDI_CONFIG_TEMPLATE = 'pipeline/config/template',
  RDI_PIPELINE_JOB_FUNCTIONS = 'pipeline/job-functions',
  RDI_STATISTICS = 'statistics',
  RDI_PIPELINE_STATUS = 'pipeline/status',
  RDI_PIPELINE_STOP = 'pipeline/stop',
  RDI_PIPELINE_START = 'pipeline/start',
  RDI_PIPELINE_RESET = 'pipeline/reset',
}

export enum CustomHeaders {
  DbIndex = 'ri-db-index',
  WindowId = 'x-window-id',
  CsrfToken = 'X-CSRF-Token',
}

export const DEFAULT_SEARCH_MATCH = '*'

export const PIPELINE_COUNT_DEFAULT = riConfig.workbench.pipelineCountDefault
export const SCAN_COUNT_DEFAULT = riConfig.browser.scanCountDefault
export const SCAN_TREE_COUNT_DEFAULT = riConfig.browser.scanTreeCountDefault
export const SCAN_STREAM_START_DEFAULT = '-'
export const SCAN_STREAM_END_DEFAULT = '+'

export const CLOUD_AUTH_API_ENDPOINTS = [
  ApiEndpoints.CLOUD_ME,
  ApiEndpoints.CLOUD_ME_JOBS,
  ApiEndpoints.CLOUD_ME_ACCOUNTS,
  ApiEndpoints.CLOUD_SUBSCRIPTION_PLANS,
  ApiEndpoints.CLOUD_ME_AUTODISCOVERY_ACCOUNT,
  ApiEndpoints.CLOUD_ME_AUTODISCOVERY_SUBSCRIPTIONS,
  ApiEndpoints.CLOUD_ME_AUTODISCOVERY_GET_DATABASES,
  ApiEndpoints.CLOUD_ME_AUTODISCOVERY_DATABASES,
  ApiEndpoints.CLOUD_CAPI_KEYS,
]

export default ApiEndpoints
