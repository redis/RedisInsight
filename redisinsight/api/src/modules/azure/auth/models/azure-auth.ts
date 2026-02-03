import { AccountInfo } from '@azure/msal-node';

export interface AzureTokenResult {
  token: string;
  expiresOn: Date;
  account: AccountInfo;
}

export interface AzureAuthStatusResponse {
  authenticated: boolean;
  accounts: Array<{
    id: string;
    username: string;
    name?: string;
  }>;
}
