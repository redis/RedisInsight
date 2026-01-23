import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
} from '@azure/msal-node';
import {
  AZURE_CLIENT_ID,
  AZURE_REDIS_SCOPE,
  AZURE_MANAGEMENT_SCOPE,
  AZURE_OAUTH_REDIRECT_PATH,
  AzureAuthStatus,
} from '../constants';

/**
 * Result of a token acquisition
 */
export interface AzureTokenResult {
  token: string;
  expiresOn: Date;
  account: AccountInfo;
}

/**
 * Azure authentication status response
 */
export interface AzureAuthStatusResponse {
  authenticated: boolean;
  accounts: Array<{
    id: string;
    username: string;
    name?: string;
  }>;
}

/**
 * PKCE (Proof Key for Code Exchange) utilities.
 *
 * Note: MSAL Node v3.x exported CryptoProvider for PKCE generation, but v5.x
 * removed it from the public API. We use Node's built-in crypto module instead,
 * following RFC 7636 (https://tools.ietf.org/html/rfc7636#section-4).
 */

/**
 * Generate a random string for PKCE verifier (43-128 characters).
 * Per RFC 7636, we use 32 random bytes encoded as base64url.
 */
const generateCodeVerifier = (): string =>
  crypto.randomBytes(32).toString('base64url');

/**
 * Generate code challenge from verifier using SHA-256.
 * Per RFC 7636 Section 4.2, this is the S256 method.
 */
const generateCodeChallenge = (verifier: string): string =>
  crypto.createHash('sha256').update(verifier).digest('base64url');

/**
 * Generate a random UUID for state parameter.
 */
const generateUuid = (): string => crypto.randomUUID();

/**
 * Service for handling Azure Entra ID authentication.
 * Uses MSAL (Microsoft Authentication Library) for OAuth 2.0 flows.
 */
@Injectable()
export class AzureAuthService {
  private readonly logger = new Logger(AzureAuthService.name);

  private pca: PublicClientApplication | null = null;

  /**
   * Map of state -> PKCE verifier for pending auth requests
   */
  private authRequests: Map<string, string> = new Map();

  /**
   * Initialize MSAL Public Client Application.
   * Called lazily on first use.
   */
  private initializeMsal(): PublicClientApplication {
    if (this.pca) {
      return this.pca;
    }

    const msalConfig: Configuration = {
      auth: {
        clientId: AZURE_CLIENT_ID,
        authority: 'https://login.microsoftonline.com/common',
      },
    };

    this.pca = new PublicClientApplication(msalConfig);

    this.logger.log('MSAL initialized successfully');
    return this.pca;
  }

  /**
   * Generate authorization URL for OAuth flow.
   * Returns URL to redirect user to Microsoft login.
   */
  async getAuthorizationUrl(): Promise<{ url: string; state: string }> {
    const pca = this.initializeMsal();

    // Generate PKCE codes
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = generateUuid();

    // Store verifier for later use in callback
    this.authRequests.set(state, verifier);

    const authUrl = await pca.getAuthCodeUrl({
      scopes: [AZURE_REDIS_SCOPE, AZURE_MANAGEMENT_SCOPE, 'offline_access'],
      redirectUri: AZURE_OAUTH_REDIRECT_PATH,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      state,
    });

    this.logger.log('Generated authorization URL');
    return { url: authUrl, state };
  }

  /**
   * Handle OAuth callback - exchange authorization code for tokens.
   */
  async handleCallback(
    code: string,
    state: string,
  ): Promise<{ status: AzureAuthStatus; account?: AccountInfo }> {
    const pca = this.initializeMsal();

    const verifier = this.authRequests.get(state);
    if (!verifier) {
      this.logger.warn(`No auth request found for state: ${state}`);
      return { status: AzureAuthStatus.Failed };
    }

    // Clean up the auth request
    this.authRequests.delete(state);

    try {
      const result = await pca.acquireTokenByCode({
        code,
        scopes: [AZURE_REDIS_SCOPE, AZURE_MANAGEMENT_SCOPE, 'offline_access'],
        redirectUri: AZURE_OAUTH_REDIRECT_PATH,
        codeVerifier: verifier,
      });

      this.logger.log(
        `Authentication successful for account: ${result.account?.username}`,
      );

      return {
        status: AzureAuthStatus.Succeed,
        account: result.account,
      };
    } catch (error: any) {
      this.logger.error(`Token acquisition failed: ${error.message}`);
      return { status: AzureAuthStatus.Failed };
    }
  }

  /**
   * Get current authentication status and list of accounts.
   */
  async getStatus(): Promise<AzureAuthStatusResponse> {
    try {
      const pca = this.initializeMsal();
      const cache = pca.getTokenCache();
      const accounts = await cache.getAllAccounts();

      return {
        authenticated: accounts.length > 0,
        accounts: accounts.map((account) => ({
          id: account.homeAccountId,
          username: account.username,
          name: account.name,
        })),
      };
    } catch (error: any) {
      this.logger.error(`Failed to get auth status: ${error.message}`);
      return {
        authenticated: false,
        accounts: [],
      };
    }
  }

  /**
   * Logout a specific account by removing it from the token cache.
   */
  async logout(accountId: string): Promise<void> {
    try {
      const pca = this.initializeMsal();
      const cache = pca.getTokenCache();
      const accounts = await cache.getAllAccounts();

      const account = accounts.find((a) => a.homeAccountId === accountId);
      if (account) {
        await cache.removeAccount(account);
        this.logger.log(`Logged out account: ${account.username}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to logout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a Redis access token for a specific account.
   * Uses silent token acquisition with cached refresh token.
   */
  async getRedisTokenByAccountId(
    accountId: string,
  ): Promise<AzureTokenResult | null> {
    try {
      const pca = this.initializeMsal();
      const cache = pca.getTokenCache();
      const accounts = await cache.getAllAccounts();

      const account = accounts.find((a) => a.homeAccountId === accountId);
      if (!account) {
        this.logger.warn(`Account not found: ${accountId}`);
        return null;
      }

      const result = await pca.acquireTokenSilent({
        account,
        scopes: [AZURE_REDIS_SCOPE],
      });

      if (!result?.accessToken || !result?.expiresOn) {
        return null;
      }

      return {
        token: result.accessToken,
        expiresOn: result.expiresOn,
        account: result.account,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to get Redis token for ${accountId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Get a Management API access token for a specific account.
   * Used for autodiscovery of Azure Redis resources.
   */
  async getManagementTokenByAccountId(
    accountId: string,
  ): Promise<AzureTokenResult | null> {
    try {
      const pca = this.initializeMsal();
      const cache = pca.getTokenCache();
      const accounts = await cache.getAllAccounts();

      const account = accounts.find((a) => a.homeAccountId === accountId);
      if (!account) {
        this.logger.warn(`Account not found: ${accountId}`);
        return null;
      }

      const result = await pca.acquireTokenSilent({
        account,
        scopes: [AZURE_MANAGEMENT_SCOPE],
      });

      if (!result?.accessToken || !result?.expiresOn) {
        return null;
      }

      return {
        token: result.accessToken,
        expiresOn: result.expiresOn,
        account: result.account,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to get Management token for ${accountId}: ${error.message}`,
      );
      return null;
    }
  }
}
