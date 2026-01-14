export enum AzureAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export interface AzureUserInfo {
  oid: string;
  upn: string;
  name?: string;
  email?: string;
  /** MSAL account ID for token refresh (homeAccountId) */
  homeAccountId: string;
}

export interface AzureTokens {
  accessToken: string;
  refreshToken?: string;
  expiresOn: Date;
  idToken?: string;
}

export interface AzureSession {
  user: AzureUserInfo;
  tokens: AzureTokens;
}

export interface AzureAuthResponse {
  status: AzureAuthStatus;
  message?: string;
  data?: {
    user: AzureUserInfo;
    accessToken: string;
    expiresOn: Date;
  };
}
