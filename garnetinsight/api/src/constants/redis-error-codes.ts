export enum RedisErrorCodes {
  WrongType = 'WRONGTYPE',
  NoPermission = 'NOPERM',
  ConnectionRefused = 'ECONNREFUSED',
  InvalidPassword = 'WRONGPASS',
  AuthRequired = 'NOAUTH',
  ConnectionNotFound = 'ENOTFOUND',
  DNSTimeoutError = 'EAI_AGAIN',
  ClusterAllFailedError = 'ClusterAllFailedError',
  SentinelParamsRequired = 'SENTINEL_PARAMS_REQUIRED',
  ConnectionReset = 'ECONNRESET',
  Timeout = 'ETIMEDOUT',
  CommandSyntaxError = 'syntax error',
  BusyGroup = 'BUSYGROUP',
  NoGroup = 'NOGROUP',
  UnknownCommand = 'unknown command',
  RedisearchLimit = 'LIMIT',
}

export enum CertificatesErrorCodes {
  IncorrectCertificates = 'UNCERTAIN_STATE',
  DepthZeroSelfSignedCert = 'DEPTH_ZERO_SELF_SIGNED_CERT',
  SelfSignedCertInChain = 'SELF_SIGNED_CERT_IN_CHAIN',
  OSSLError = 'ERR_OSSL',
}
