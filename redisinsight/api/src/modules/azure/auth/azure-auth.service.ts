import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
} from '@azure/msal-node';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AZURE_AUTHORITY,
  AZURE_CLIENT_ID,
  AZURE_REDIS_SCOPE,
  AZURE_MANAGEMENT_SCOPE,
  AZURE_OAUTH_DEEPLINK_REDIRECT_PATH,
  AZURE_OAUTH_SCOPES,
  AZURE_OAUTH_WEB_CALLBACK_ENDPOINT,
  AzureAuthStatus,
  AzureOAuthRedirectType,
  AzureRedisTokenEvents,
} from '../constants';
import { get, Config } from 'src/utils';
import { AzureTokenResult, AzureAuthStatusResponse } from './models';
import { AzureOAuthPrompt } from './dto';

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
/**
 * Data stored for each pending auth request
 */
interface AuthRequestData {
  verifier: string;
  redirectUri: string;
  redirectType: AzureOAuthRedirectType;
  createdAt: number;
}

/**
 * Maximum age for auth requests before they're considered stale (10 minutes).
 * OAuth flows should complete well within this time.
 */
const AUTH_REQUEST_MAX_AGE_MS = 10 * 60 * 1000;

@Injectable()
export class AzureAuthService {
  private readonly logger = new Logger(AzureAuthService.name);

  private pca: PublicClientApplication | null = null;

  /**
   * Map of state -> auth request data (PKCE verifier + redirect URI)
   */
  private authRequests: Map<string, AuthRequestData> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Remove expired auth requests to prevent memory leaks from abandoned flows.
   */
  private cleanupExpiredAuthRequests(): void {
    const now = Date.now();
    this.authRequests.forEach((data, state) => {
      if (now - data.createdAt > AUTH_REQUEST_MAX_AGE_MS) {
        this.authRequests.delete(state);
        this.logger.debug(`Cleaned up expired auth request: ${state}`);
      }
    });
  }

  /**
   * Remove an auth request by state and return its redirect type.
   * Used for cleanup when OAuth errors occur before handleCallback is called.
   * @returns The redirect type if found, null otherwise
   */
  removeAuthRequest(state: string): AzureOAuthRedirectType | null {
    const authRequest = this.authRequests.get(state);
    if (authRequest) {
      this.authRequests.delete(state);
      return authRequest.redirectType;
    }
    return null;
  }

  /**
   * Get the redirect URI based on the redirect type.
   * For web flow, uses externalUrl config if set, otherwise constructs localhost URL.
   * This allows users to set RI_EXTERNAL_URL when running behind a proxy or custom port.
   */
  private getRedirectUri(
    redirectType: AzureOAuthRedirectType = AzureOAuthRedirectType.Deeplink,
  ): string {
    if (redirectType === AzureOAuthRedirectType.Web) {
      const serverConfig = get('server') as Config['server'];
      // Use external URL if configured (for Docker port mapping or reverse proxy)
      if (serverConfig.externalUrl) {
        const baseUrl = serverConfig.externalUrl.replace(/\/$/, ''); // Remove trailing slash
        return `${baseUrl}/api${AZURE_OAUTH_WEB_CALLBACK_ENDPOINT}`;
      }
      return `http://localhost:${serverConfig.port}/api${AZURE_OAUTH_WEB_CALLBACK_ENDPOINT}`;
    }
    return AZURE_OAUTH_DEEPLINK_REDIRECT_PATH;
  }

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
   * @param prompt - Optional prompt parameter to control login behavior.
   * @param redirectType - Type of redirect (deeplink for Electron, web for browser/Docker)
   * @see https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-authorization-code
   */
  async getAuthorizationUrl(
    prompt?: AzureOAuthPrompt,
    redirectType: AzureOAuthRedirectType = AzureOAuthRedirectType.Deeplink,
  ): Promise<{ url: string; state: string }> {
    const pca = this.getMsalClient();

    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = generateUuid();
    const redirectUri = this.getRedirectUri(redirectType);

    // Clean up any expired auth requests (abandoned flows) before adding new one
    this.cleanupExpiredAuthRequests();

    // Store auth request data keyed by unique state UUID
    this.authRequests.set(state, {
      verifier,
      redirectUri,
      redirectType,
      createdAt: Date.now(),
    });

    const authUrl = await pca.getAuthCodeUrl({
      scopes: AZURE_OAUTH_SCOPES,
      redirectUri,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      state,
      ...(prompt && { prompt }),
    });

    this.logger.debug(
      `Generated authorization URL with redirect type: ${redirectType}`,
    );
    return { url: authUrl, state };
  }

  /**
   * Handle OAuth callback - exchange authorization code for tokens.
   * Returns the result along with the redirect type used for this request.
   */
  async handleCallback(
    code: string,
    state: string,
  ): Promise<{
    status: AzureAuthStatus;
    account?: AccountInfo;
    error?: string;
    redirectType: AzureOAuthRedirectType;
  }> {
    const pca = this.getMsalClient();

    const authRequest = this.authRequests.get(state);
    if (!authRequest) {
      this.logger.warn(`No auth request found for state: ${state}`);
      return {
        status: AzureAuthStatus.Failed,
        error: 'Invalid or expired authentication state',
        // Default to Web since deeplink flows redirect to redisinsight:// and never reach HTTP callback
        redirectType: AzureOAuthRedirectType.Web,
      };
    }

    const { verifier, redirectUri, redirectType } = authRequest;

    // Clean up the auth request
    this.authRequests.delete(state);

    try {
      const result = await pca.acquireTokenByCode({
        code,
        scopes: AZURE_OAUTH_SCOPES,
        redirectUri,
        codeVerifier: verifier,
      });

      this.logger.log(
        `Authentication successful for account: ${result.account?.username}`,
      );

      return {
        status: AzureAuthStatus.Succeed,
        account: result.account,
        redirectType,
      };
    } catch (error: any) {
      this.logger.error(`Token acquisition failed: ${error.message}`);
      return {
        status: AzureAuthStatus.Failed,
        error: error.message || 'Token acquisition failed',
        redirectType,
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
    const tokenResult = await this.getTokenByAccountId(
      accountId,
      AZURE_REDIS_SCOPE,
    );

    if (tokenResult) {
      this.eventEmitter.emit(AzureRedisTokenEvents.Acquired, {
        accountId,
        tokenResult,
      });
    }

    return tokenResult;
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
