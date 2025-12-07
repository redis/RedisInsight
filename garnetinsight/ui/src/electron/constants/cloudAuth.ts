export enum CloudAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export interface CloudAuthResponse {
  status: CloudAuthStatus
  message?: string
  error?: object | string
}

export enum CloudJobStatus {
  Initializing = 'initializing',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
}

export enum CloudJobStep {
  Credentials = 'credentials',
  Subscription = 'subscription',
  Database = 'database',
  Import = 'import',
}

export enum CloudJobName {
  CreateFreeDatabase = 'CREATE_FREE_DATABASE',
  CreateFreeSubscription = 'CREATE_FREE_SUBSCRIPTION',
  CreateFreeSubscriptionAndDatabase = 'CREATE_FREE_SUBSCRIPTION_AND_DATABASE',
  ImportFreeDatabase = 'IMPORT_FREE_DATABASE',
  WaitForActiveDatabase = 'WAIT_FOR_ACTIVE_DATABASE',
  WaitForActiveSubscription = 'WAIT_FOR_ACTIVE_SUBSCRIPTION',
  WaitForTask = 'WAIT_FOR_TASK',
  Unknown = 'UNKNOWN',
}
