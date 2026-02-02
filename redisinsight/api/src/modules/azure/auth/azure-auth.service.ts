import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
} from '@azure/msal-node';
import {
  AZURE_AUTHORITY,
  AZURE_CLIENT_ID,
  AZURE_REDIS_SCOPE,
  AZURE_MANAGEMENT_SCOPE,
  AZURE_OAUTH_REDIRECT_PATH,
  AZURE_OAUTH_SCOPES,
  AzureAuthStatus,
} from '../constants';
import { AzureTokenResult, AzureAuthStatusResponse } from './models';

/**
 * PKCE (Proof Key for Code Exchange) utilities.
 *
 * Note: MSAL Node <5.x exported CryptoProvider for PKCE generation, but v5.x
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

  private getMsalClient(): PublicClientApplication {
    if (this.pca) {
      return this.pca;
    }

    const msalConfig: Configuration = {
      auth: {
        clientId: AZURE_CLIENT_ID,
        authority: AZURE_AUTHORITY,
      },
    };

    this.pca = new PublicClientApplication(msalConfig);

    this.logger.debug('MSAL client initialized');
    return this.pca;
  }

  /**
   * Generate authorization URL for OAuth flow.
   * Returns URL to redirect user to Microsoft login.
   */
  async getAuthorizationUrl(): Promise<{ url: string; state: string }> {
    const pca = this.getMsalClient();

    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = generateUuid();

    this.authRequests.clear();
    this.authRequests.set(state, verifier);

    const authUrl = await pca.getAuthCodeUrl({
      scopes: AZURE_OAUTH_SCOPES,
      redirectUri: AZURE_OAUTH_REDIRECT_PATH,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      state,
    });

    this.logger.debug('Generated authorization URL');
    return { url: authUrl, state };
  }

  /**
   * Handle OAuth callback - exchange authorization code for tokens.
   */
  async handleCallback(
    code: string,
    state: string,
  ): Promise<{
    status: AzureAuthStatus;
    account?: AccountInfo;
    error?: string;
  }> {
    const pca = this.getMsalClient();

    const verifier = this.authRequests.get(state);
    if (!verifier) {
      this.logger.warn(`No auth request found for state: ${state}`);
      return {
        status: AzureAuthStatus.Failed,
        error: 'Invalid or expired authentication state',
      };
    }

    // Clean up the auth request
    this.authRequests.delete(state);

    try {
      const result = await pca.acquireTokenByCode({
        code,
        scopes: AZURE_OAUTH_SCOPES,
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
      return {
        status: AzureAuthStatus.Failed,
        error: error.message || 'Token acquisition failed',
      };
    }
  }

  async getStatus(): Promise<AzureAuthStatusResponse> {
    try {
      const pca = this.getMsalClient();
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
      const pca = this.getMsalClient();
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
   * Get an access token for Azure Cache for Redis.
   *
   * This token is used to authenticate directly with Azure Redis databases
   * using Entra ID (Azure AD) authentication instead of access keys.
   *
   * @see https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-azure-active-directory-for-authentication
   */
  async getRedisTokenByAccountId(
    accountId: string,
  ): Promise<AzureTokenResult | null> {
    return this.getTokenByAccountId(accountId, AZURE_REDIS_SCOPE);
  }

  /**
   * Get an access token for Azure Resource Manager (ARM) API.
   *
   * This token is used to call Azure Management APIs for autodiscovery:
   * - List subscriptions the user has access to
   * - List Azure Cache for Redis instances in each subscription
   * - Get connection details (host, port, SSL settings)
   *
   * Note: Azure AD doesn't allow requesting tokens for multiple resources
   * (redis.azure.com AND management.azure.com) in a single OAuth request.
   * We request the Redis scope during login and acquire this scope silently
   * when needed for autodiscovery.
   *
   * @see https://learn.microsoft.com/en-us/rest/api/redis/
   */
  async getManagementTokenByAccountId(
    accountId: string,
  ): Promise<AzureTokenResult | null> {
    return this.getTokenByAccountId(accountId, AZURE_MANAGEMENT_SCOPE);
  }

  /**
   * Get an access token for a specific account and scope.
   * Uses silent token acquisition with cached refresh token.
   */
  private async getTokenByAccountId(
    accountId: string,
    scope: string,
  ): Promise<AzureTokenResult | null> {
    try {
      const pca = this.getMsalClient();
      const cache = pca.getTokenCache();
      const accounts = await cache.getAllAccounts();

      const account = accounts.find((a) => a.homeAccountId === accountId);
      if (!account) {
        this.logger.warn(`Account not found: ${accountId}`);
        return null;
      }

      const result = await pca.acquireTokenSilent({
        account,
        scopes: [scope],
      });

      if (!result?.accessToken || !result?.expiresOn || !result?.account) {
        return null;
      }

      return {
        token: result.accessToken,
        expiresOn: result.expiresOn,
        account: result.account,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to get token for ${accountId}: ${error.message}`,
      );
      return null;
    }
  }
}
