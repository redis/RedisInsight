/* eslint-disable max-len */
import { numberWithSpaces } from 'src/utils/base.helper';

export default {
  UNAUTHORIZED: 'Authorization failed',
  FORBIDDEN: 'Access denied',
  BAD_REQUEST: 'Bad request',
  NOT_FOUND: 'Resource was not found',
  INTERNAL_SERVER_ERROR: 'Server error',
  REQUEST_TIMEOUT: 'Request timeout',

  INVALID_CLIENT_METADATA: 'Client metadata missed required properties',
  INVALID_SESSION_METADATA: 'Session metadata missed required properties',

  INVALID_DATABASE_INSTANCE_ID: 'Invalid database instance id.',
  COMMAND_EXECUTION_NOT_FOUND: 'Command execution was not found.',
  DATABASE_ANALYSIS_NOT_FOUND: 'Database analysis was not found.',
  DATABASE_RECOMMENDATION_NOT_FOUND: 'Database recommendation was not found.',
  BROWSER_HISTORY_ITEM_NOT_FOUND: 'Browser history item was not found.',
  PROFILER_LOG_FILE_NOT_FOUND: 'Profiler log file was not found.',
  CONSUMER_GROUP_NOT_FOUND: 'Consumer Group with such name was not found.',
  PLUGIN_STATE_NOT_FOUND: 'Plugin state was not found.',
  CUSTOM_TUTORIAL_NOT_FOUND: 'Custom Tutorial was not found.',
  CUSTOM_TUTORIAL_UNABLE_TO_FETCH_FROM_EXTERNAL:
    'Unable fetch zip file from external source.',
  CUSTOM_TUTORIAL_UNSUPPORTED_ORIGIN: 'Unsupported origin for tutorial.',
  UNDEFINED_INSTANCE_ID: 'Undefined redis database instance id.',
  NO_CONNECTION_TO_REDIS_DB: 'No connection to the Redis Database.',
  WRONG_DATABASE_TYPE: 'Wrong database type.',
  CONNECTION_TIMEOUT:
    'The connection has timed out, please check the connection details.',
  DB_CONNECTION_TIMEOUT:
    'The connection timed out. Try increasing the timeout in the connection settings.',
  DB_CLUSTER_CONNECT_FAILED:
    'Garnet Insight requires connectivity to all nodes of your clustered database. Ensure all nodes are accessible or increase the timeout.',
  SERVER_CLOSED_CONNECTION: 'Server closed the connection.',
  UNABLE_TO_ESTABLISH_CONNECTION: 'Unable to establish connection.',
  RECONNECTING_TO_DATABASE: 'Reconnecting to the redis database.',
  AUTHENTICATION_FAILED: () =>
    'Failed to authenticate, please check the username or password.',
  INCORRECT_DATABASE_URL: (url) =>
    `Could not connect to ${url}, please check the connection details.`,
  INCORRECT_CERTIFICATES: (url) =>
    `Could not connect to ${url}, please check the CA or Client certificate.`,
  INCORRECT_CREDENTIALS: (url) =>
    `Could not connect to ${url}, please check the Username or Password.`,
  DATABASE_DEFAULT_USER_DISABLED:
    'Database does not have default user enabled.',
  DATABASE_MANAGEMENT_IS_DISABLED:
    'Database connection management is disabled.',
  CA_CERT_EXIST: 'This ca certificate name is already in use.',
  INVALID_CA_BODY: 'Invalid CA body',
  INVALID_SSH_PRIVATE_KEY_BODY: 'Invalid SSH private key body',
  SSH_AGENTS_ARE_NOT_SUPPORTED: 'SSH Agents are not supported',
  INVALID_SSH_BODY: 'Invalid SSH body',
  INVALID_CERTIFICATE_BODY: 'Invalid certificate body',
  INVALID_PRIVATE_KEY: 'Invalid private key',
  INVALID_COMPRESSOR: 'Invalid compressor',
  CERTIFICATE_NAME_IS_NOT_DEFINED: 'Certificate name is not defined',
  CLIENT_CERT_EXIST: 'This client certificate name is already in use.',
  INVALID_CERTIFICATE_ID: 'Invalid certificate id.',
  SENTINEL_MASTER_NAME_REQUIRED: 'Sentinel master name must be specified.',
  MASTER_GROUP_NOT_EXIST: "Master group with this name doesn't exist",

  KEY_NAME_EXIST: 'This key name is already in use.',
  REDISEARCH_INDEX_EXIST: 'This index name is already in use.',
  KEY_NOT_EXIST: 'Key with this name does not exist.',
  PATH_NOT_EXISTS: () => 'There is no such path.',
  INDEX_OUT_OF_RANGE: () => 'Index is out of range.',
  MEMBER_IN_SET_NOT_EXIST: 'This member does not exist.',
  NEW_KEY_NAME_EXIST: 'New key name is already in use.',
  KEY_OR_TIMEOUT_NOT_EXIST:
    'Key with this name does not exist or does not have an associated timeout.',
  SERVER_NOT_AVAILABLE: 'Server is not available. Please try again later.',
  REDIS_CLOUD_FORBIDDEN: 'Error fetching account details.',

  DATABASE_IS_INACTIVE: 'The database is inactive.',
  DATABASE_ALREADY_EXISTS: 'The database already exists.',

  INCORRECT_CLUSTER_CURSOR_FORMAT: 'Incorrect cluster cursor format.',
  REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT: () =>
    'Removing multiple elements is available for Redis databases v. 6.2 or later.',
  SCAN_PER_KEY_TYPE_NOT_SUPPORT: () =>
    'Filtering per Key types is available for Redis databases v. 6.0 or later.',
  WRONG_DISCOVERY_TOOL: () =>
    'Selected discovery tool is incorrect, please add this database manually using Host and Port.',
  COMMAND_NOT_SUPPORTED: (command: string) =>
    `Redis does not support '${command}' command.`,
  PLUGIN_COMMAND_NOT_SUPPORTED: (command: string) =>
    `Plugin ERROR: The '${command}' command is not allowed by the Garnet Insight Plugins.`,
  PLUGIN_STATE_MAX_SIZE: (size: number) =>
    `State should be less then ${size} bytes.`,
  WORKBENCH_COMMAND_NOT_SUPPORTED: (command) =>
    `Workbench ERROR: The '${command}' command is not supported by the Garnet Insight Workbench.`,
  WORKBENCH_RESPONSE_TOO_BIG: () =>
    'Results have been deleted since they exceed 1 MB. Re-run the command to see new results.',
  CLI_COMMAND_NOT_SUPPORTED: (command: string) =>
    `CLI ERROR: The '${command}' command is not supported by the Garnet Insight CLI.`,
  CLI_UNTERMINATED_QUOTES: () => 'Invalid argument(s): Unterminated quotes.',
  CLI_INVALID_QUOTES_CLOSING: () =>
    'Invalid argument(s): Closing quote must be followed by a space or nothing at all.',
  CLUSTER_NODE_NOT_FOUND: (node: string) =>
    `Node ${node} not exist in OSS Cluster.`,
  REDIS_MODULE_IS_REQUIRED: (module: string) =>
    `Required ${module} module is not loaded.`,
  APP_SETTINGS_NOT_FOUND: () => 'Could not find application settings.',
  SERVER_INFO_NOT_FOUND: () => 'Could not find server info.',
  INCREASE_MINIMUM_LIMIT: (count?: number) =>
    count
      ? `Set MAXSEARCHRESULTS to at least ${numberWithSpaces(count)}.`
      : 'Increase MAXSEARCHRESULTS value to search more.',
  INVALID_WINDOW_ID: 'Invalid window id.',
  UNDEFINED_WINDOW_ID: 'Undefined window id.',
  LIBRARY_NOT_EXIST: 'This library does not exist.',

  REDIS_CONNECTION_FAILED: 'Unable to connect to the Redis database',

  CLOUD_CAPI_KEY_UNAUTHORIZED: 'Unable to authorize such CAPI key',
  CLOUD_OAUTH_CANCELED: 'Authorization request was canceled.',
  CLOUD_OAUTH_MISCONFIGURATION: 'Authorization server misconfiguration.',
  CLOUD_OAUTH_GITHUB_EMAIL_PERMISSION:
    'Unable to get an email from the GitHub account. Make sure that it is available.',
  CLOUD_OAUTH_SSO_UNSUPPORTED_EMAIL: 'Invalid email.',
  CLOUD_OAUTH_MISSED_REQUIRED_DATA:
    'Unable to get required data from the user profile.',
  CLOUD_OAUTH_UNKNOWN_AUTHORIZATION_REQUEST: 'Unknown authorization request.',
  CLOUD_OAUTH_UNEXPECTED_ERROR: 'Unexpected error.',

  CLOUD_JOB_UNEXPECTED_ERROR: 'Unexpected error occurred',
  CLOUD_JOB_ABORTED: 'Cloud job aborted',
  CLOUD_JOB_NOT_FOUND: 'Cloud job was not found',
  CLOUD_JOB_UNSUPPORTED: 'Unsupported cloud job',
  CLOUD_SUBSCRIPTION_IN_FAILED_STATE:
    'Cloud subscription is in the failed state',
  CLOUD_SUBSCRIPTION_IN_UNEXPECTED_STATE:
    'Cloud subscription is in unexpected state',
  CLOUD_SUBSCRIPTION_UNABLE_TO_DETERMINE:
    'Unable to determine or create free cloud subscription',
  CLOUD_TASK_PROCESSING_ERROR: 'Cloud task processing returned an error',
  CLOUD_TASK_NO_RESOURCE_ID: 'Cloud task respond without resource id',
  CLOUD_TASK_NOT_FOUND: 'Cloud task was not found',
  CLOUD_DATABASE_IN_FAILED_STATE: 'Cloud database is in the failed state',
  CLOUD_DATABASE_IN_UNEXPECTED_STATE: 'Cloud database is in unexpected state',
  CLOUD_DATABASE_ALREADY_EXISTS_FREE: 'Free database already exists',
  CLOUD_DATABASE_IMPORT_FORBIDDEN:
    'Adding your Redis Cloud database to Garnet Insight is disabled due to a setting restricting database connection management.',
  CLOUD_DATABASE_ENDPOINT_INVALID:
    'Database endpoint is unavailable. It may still be provisioning or has been disabled.',
  CLOUD_PLAN_NOT_FOUND_FREE: 'Unable to find free cloud plan',
  CLOUD_SUBSCRIPTION_ALREADY_EXISTS_FREE: 'Free subscription already exists',
  COMMON_DEFAULT_IMPORT_ERROR: 'Unable to import default data',
  AI_QUERY_REQUEST_RATE_LIMIT: 'Exceeded limit for requests',
  AI_QUERY_TOKEN_RATE_LIMIT:
    'Exceeded limit for characters in the conversation',
  AI_QUERY_MAX_TOKENS_RATE_LIMIT: 'Token count exceeds the conversation limit',

  RDI_DEPLOY_PIPELINE_FAILURE: 'Failed to deploy pipeline',
  RDI_RESET_PIPELINE_FAILURE: 'Failed to reset pipeline',
  RDI_STOP_PIPELINE_FAILURE: 'Failed to stop pipeline',
  RDI_START_PIPELINE_FAILURE: 'Failed to start pipeline',
  RDI_TIMEOUT_ERROR:
    'Encountered a timeout error while attempting to retrieve data',
  RDI_VALIDATION_ERROR: 'Validation error',
  INVALID_RDI_INSTANCE_ID: 'Invalid rdi instance id.',
  UNSAFE_BIG_JSON_LENGTH:
    'This JSON is too large. Try opening it with Garnet Insight Desktop.',

  // database settings
  DATABASE_SETTINGS_NOT_FOUND: 'Could not find settings for this database',
};
