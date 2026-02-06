export enum CustomErrorCodes {
  // General [10000, 10899]
  WindowUnauthorized = 10_001,

  // Redis Connection [10900, 10999]
  RedisConnectionFailed = 10_900,
  RedisConnectionTimeout = 10_901,
  RedisConnectionUnauthorized = 10_902,
  RedisConnectionClusterNodesUnavailable = 10_903,
  RedisConnectionUnavailable = 10_904,
  RedisConnectionAuthUnsupported = 10_905,
  RedisConnectionSentinelMasterRequired = 10_906,
  RedisConnectionIncorrectCertificate = 10_907,
  RedisConnectionDefaultUserDisabled = 10_908,

  // Cloud API [11001, 11099]
  CloudApiInternalServerError = 11_000,
  CloudApiUnauthorized = 11_001,
  CloudApiForbidden = 11_002,
  CloudApiBadRequest = 11_003,
  CloudApiNotFound = 11_004,
  CloudOauthMisconfiguration = 11_005,
  CloudOauthGithubEmailPermission = 11_006,
  CloudOauthUnknownAuthorizationRequest = 11_007,
  CloudOauthUnexpectedError = 11_008,
  CloudOauthMissedRequiredData = 11_009,
  CloudOauthCanceled = 11_010,
  CloudOauthSsoUnsupportedEmail = 11_011,
  CloudCapiUnauthorized = 11_021,
  CloudCapiKeyUnauthorized = 11_022,
  CloudCapiKeyNotFound = 11_023,
  AzureEntraIdTokenExpired = 11_024,

  // Cloud Job errors [11100, 11199]
  CloudJobUnexpectedError = 11_100,
  CloudJobAborted = 11_101,
  CloudJobUnsupported = 11_102,
  CloudTaskProcessingError = 11_103,
  CloudTaskNoResourceId = 11_104,
  CloudSubscriptionIsInTheFailedState = 11_105,
  CloudSubscriptionIsInUnexpectedState = 11_106,
  CloudDatabaseIsInTheFailedState = 11_107,
  CloudDatabaseAlreadyExistsFree = 11_108,
  CloudDatabaseIsInUnexpectedState = 11_109,
  CloudPlanUnableToFindFree = 11_110,
  CloudSubscriptionUnableToDetermine = 11_111,
  CloudTaskNotFound = 11_112,
  CloudJobNotFound = 11_113,
  CloudSubscriptionAlreadyExistsFree = 11_114,
  CloudDatabaseImportForbidden = 11_115,
  CloudDatabaseEndpointInvalid = 11_116,

  // General database errors [11200, 11299]
  DatabaseAlreadyExists = 11_200,

  // AI errors [11300, 11399]
  ConvAiInternalServerError = 11_300,
  ConvAiUnauthorized = 11_301,
  ConvAiForbidden = 11_302,
  ConvAiBadRequest = 11_303,
  ConvAiNotFound = 11_304,

  QueryAiInternalServerError = 11_351,
  QueryAiUnauthorized = 11_351,
  QueryAiForbidden = 11_352,
  QueryAiBadRequest = 11_353,
  QueryAiNotFound = 11_354,
  QueryAiRateLimitRequest = 11_360,
  QueryAiRateLimitToken = 11_361,
  QueryAiRateLimitMaxTokens = 11_362,

  // RDI errors [11400, 11599]
  RdiDeployPipelineFailure = 11_401,
  RdiUnauthorized = 11_402,
  RdiInternalServerError = 11_403,
  RdiValidationError = 11_404,
  RdiNotFound = 11_405,
  RdiForbidden = 11_406,
  RdiResetPipelineFailure = 11_407,
  RdiStartPipelineFailure = 11_408,
  RdiStopPipelineFailure = 11_409,
}
