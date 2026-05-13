export enum AzureAuthStatus {
  Processing = 'processing',
  Succeed = 'succeed',
  Failed = 'failed',
}

export const AZURE_OAUTH_STORAGE_KEY = 'ri_azure_oauth_result'

export const AZURE_OAUTH_REDIRECT_PATH = 'redisinsight://azure/oauth/callback'
