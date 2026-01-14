import { Injectable, Logger } from '@nestjs/common';
import {
  PublicClientApplication,
  Configuration,
  LogLevel,
  CryptoProvider,
  AuthorizationCodeRequest,
} from '@azure/msal-node';
import { AZURE_CONFIG, TOKEN_REFRESH_BUFFER_MS } from '../constants';
import {
  AzureAuthStatus,
  AzureAuthResponse,
  AzureSession,
  AzureUserInfo,
} from '../models/azure-auth.models';

interface PendingAuthRequest {
  verifier: string;
  state: string;
  createdAt: Date;
}

@Injectable()
export class AzureAuthService {
  private readonly logger = new Logger(AzureAuthService.name);

  private msalClient: PublicClientApplication | null = null;

  private pendingAuthRequests: Map<string, PendingAuthRequest> = new Map();

  private sessions: Map<string, AzureSession> = new Map();

  private tokenCache: string | null = null;

  private getMsalConfig(): Configuration {
    return {
      auth: {
        clientId: AZURE_CONFIG.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${AZURE_CONFIG.TENANT_ID}`,
      },
      system: {
        loggerOptions: {
          logLevel: LogLevel.Warning,
          loggerCallback: (level, message) => {
            if (level === LogLevel.Error) {
              this.logger.error(message);
            } else if (level === LogLevel.Warning) {
              this.logger.warn(message);
            }
          },
        },
      },
    };
  }

  private async getMsalClient(): Promise<PublicClientApplication> {
    if (this.msalClient) {
      return this.msalClient;
    }

    this.msalClient = new PublicClientApplication(this.getMsalConfig());

    // Restore token cache if available
    if (this.tokenCache) {
      this.msalClient.getTokenCache().deserialize(this.tokenCache);
    }

    return this.msalClient;
  }

  private async persistCache(): Promise<void> {
    if (this.msalClient) {
      this.tokenCache = this.msalClient.getTokenCache().serialize();
    }
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  async getAuthorizationUrl(sessionId: string): Promise<string> {
    const pca = await this.getMsalClient();
    const cryptoProvider = new CryptoProvider();

    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();
    const state = cryptoProvider.createNewGuid();

    // Store pending request
    this.pendingAuthRequests.set(state, {
      verifier,
      state,
      createdAt: new Date(),
    });

    const authUrl = await pca.getAuthCodeUrl({
      scopes: [...AZURE_CONFIG.MANAGEMENT_SCOPES],
      redirectUri: AZURE_CONFIG.REDIRECT_URI,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      state,
      prompt: 'select_account',
    });

    this.logger.log(`Generated auth URL for session ${sessionId}`);
    return authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(
    code: string,
    state: string,
    sessionId: string,
  ): Promise<AzureAuthResponse> {
    const pendingRequest = this.pendingAuthRequests.get(state);

    if (!pendingRequest) {
      this.logger.error('No pending auth request found for state');
      return {
        status: AzureAuthStatus.Failed,
        message: 'Invalid or expired auth request',
      };
    }

    try {
      const pca = await this.getMsalClient();

      const tokenRequest: AuthorizationCodeRequest = {
        code,
        scopes: [...AZURE_CONFIG.MANAGEMENT_SCOPES],
        redirectUri: AZURE_CONFIG.REDIRECT_URI,
        codeVerifier: pendingRequest.verifier,
      };

      const response = await pca.acquireTokenByCode(tokenRequest);

      // Clean up pending request
      this.pendingAuthRequests.delete(state);

      // Persist cache
      await this.persistCache();

      // Extract user info from claims
      const claims = response.idTokenClaims as Record<string, any>;
      const user: AzureUserInfo = {
        oid:
          claims?.oid || claims?.sub || response.account?.localAccountId || '',
        upn: claims?.preferred_username || response.account?.username || '',
        name: claims?.name,
        email: claims?.email,
        homeAccountId: response.account?.homeAccountId || '',
      };

      // Store session
      this.sessions.set(sessionId, {
        user,
        tokens: {
          accessToken: response.accessToken,
          refreshToken: '', // MSAL handles refresh internally via cache
          expiresOn: response.expiresOn || new Date(),
          idToken: response.idToken,
        },
      });

      this.logger.log(`Successfully authenticated user ${user.upn}`);

      return {
        status: AzureAuthStatus.Succeed,
        data: {
          user,
          accessToken: response.accessToken,
          expiresOn: response.expiresOn || new Date(),
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to exchange code for tokens', error?.message);
      this.pendingAuthRequests.delete(state);

      return {
        status: AzureAuthStatus.Failed,
        message: error?.message || 'Failed to authenticate',
      };
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(sessionId: string): Promise<string | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn(`No session found for ${sessionId}`);
      return null;
    }

    const now = new Date();
    const expiresOn = new Date(session.tokens.expiresOn);
    const bufferTime = new Date(expiresOn.getTime() - TOKEN_REFRESH_BUFFER_MS);

    // Token is still valid
    if (now < bufferTime) {
      return session.tokens.accessToken;
    }

    // Need to refresh
    this.logger.log('Token expired or expiring soon, refreshing...');

    try {
      const pca = await this.getMsalClient();
      const accounts = await pca.getTokenCache().getAllAccounts();

      if (accounts.length === 0) {
        this.logger.warn('No accounts in cache for token refresh');
        return null;
      }

      const response = await pca.acquireTokenSilent({
        account: accounts[0],
        scopes: [...AZURE_CONFIG.MANAGEMENT_SCOPES],
      });

      await this.persistCache();

      // Update session
      session.tokens.accessToken = response.accessToken;
      session.tokens.expiresOn = response.expiresOn || new Date();

      this.logger.log('Token refreshed successfully');
      return response.accessToken;
    } catch (error: any) {
      this.logger.error('Failed to refresh token', error?.message);
      return null;
    }
  }

  /**
   * Get a Redis-scoped token for Entra ID auth.
   * Uses session to find account if accountId not provided.
   */
  async getRedisToken(sessionId: string): Promise<{
    token: string;
    expiresOn: Date;
  } | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn(`No session found for ${sessionId}`);
      return null;
    }

    return this.getRedisTokenByAccountId(session.user.homeAccountId);
  }

  /**
   * Get a Redis-scoped token for a specific Azure account.
   * Used for proactive token refresh.
   */
  async getRedisTokenByAccountId(
    accountId: string,
  ): Promise<{ token: string; expiresOn: Date } | null> {
    if (!accountId) {
      this.logger.warn('No account ID provided for Redis token');
      return null;
    }

    try {
      const pca = await this.getMsalClient();
      const accounts = await pca.getTokenCache().getAllAccounts();

      // Find the specific account
      const account = accounts.find((a) => a.homeAccountId === accountId);

      if (!account) {
        this.logger.warn(`Account ${accountId} not found in MSAL cache`);
        return null;
      }

      const response = await pca.acquireTokenSilent({
        account,
        scopes: [...AZURE_CONFIG.REDIS_SCOPES],
      });

      await this.persistCache();

      this.logger.log(`Redis token acquired for account ${accountId}`);
      return {
        token: response.accessToken,
        expiresOn: response.expiresOn || new Date(),
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to acquire Redis token for account ${accountId}`,
        error?.message,
      );
      return null;
    }
  }

  /**
   * Get current session info
   */
  getSession(sessionId: string): AzureSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Logout and clear session
   */
  async logout(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);

    try {
      const pca = await this.getMsalClient();
      const accounts = await pca.getTokenCache().getAllAccounts();

      for (const account of accounts) {
        await pca.getTokenCache().removeAccount(account);
      }

      this.tokenCache = null;
      this.msalClient = null;

      this.logger.log(`Logged out session ${sessionId}`);
    } catch (error: any) {
      this.logger.error('Error during logout', error?.message);
    }
  }
}
