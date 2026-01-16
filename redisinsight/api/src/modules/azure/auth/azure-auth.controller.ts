import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AzureAuthService } from './azure-auth.service';
import { AzureAuthStatus } from '../models/azure-auth.models';
import {
  DEFAULT_SESSION_ID,
  DEFAULT_USER_ID,
  DEFAULT_ACCOUNT_ID,
} from 'src/common/constants';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import {
  isAzureEntraIdAuth,
  AzureProviderDetails,
} from 'src/modules/database/models/provider-details';
import { TOKEN_REFRESH_BUFFER_SECONDS } from '../constants';
import { isJwtExpired, getJwtExpiration } from './utils/jwt.utils';

@ApiTags('Azure')
@Controller('azure')
export class AzureAuthController {
  private readonly logger = new Logger(AzureAuthController.name);

  constructor(
    private readonly authService: AzureAuthService,
    private readonly databaseRepository: DatabaseRepository,
  ) {}

  @Get('auth/login')
  @ApiOperation({ summary: 'Get Azure OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'Returns authorization URL' })
  async getLoginUrl(): Promise<{ url: string }> {
    const url = await this.authService.getAuthorizationUrl(DEFAULT_SESSION_ID);
    return { url };
  }

  @Get('oauth/callback')
  @ApiOperation({ summary: 'OAuth callback endpoint' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ): Promise<void> {
    if (error) {
      // Redirect to frontend with error
      res.redirect(
        `/?azure_error=${encodeURIComponent(errorDescription || error)}`,
      );
      return;
    }

    const result = await this.authService.handleCallback(
      code,
      state,
      DEFAULT_SESSION_ID,
    );

    if (result.status === AzureAuthStatus.Succeed) {
      // Redirect to frontend with success
      // Token refresh happens lazily when user connects to a database
      res.redirect('/?azure_auth=success');
    } else {
      res.redirect(
        `/?azure_error=${encodeURIComponent(result.message || 'Authentication failed')}`,
      );
    }
  }

  @Post('auth/callback')
  @ApiOperation({ summary: 'OAuth callback endpoint (for Electron deep link)' })
  @ApiBody({ description: 'OAuth callback data with code and state' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Authentication failed' })
  async handleCallbackPost(
    @Body() body: { code: string; state?: string },
  ): Promise<{
    status: string;
    message?: string;
  }> {
    const result = await this.authService.handleCallback(
      body.code,
      body.state,
      DEFAULT_SESSION_ID,
    );

    if (result.status === AzureAuthStatus.Succeed) {
      // Token refresh happens lazily when user connects to a database
      return { status: 'success' };
    }
    return { status: 'failed', message: result.message };
  }

  @Get('auth/status')
  @ApiOperation({ summary: 'Check Azure authentication status' })
  @ApiResponse({
    status: 200,
    description: 'Returns auth status and user info',
  })
  async getAuthStatus(): Promise<{
    isLoggedIn: boolean;
    user?: { oid: string; upn: string; name?: string };
  }> {
    let isLoggedIn = this.authService.isLoggedIn(DEFAULT_SESSION_ID);

    // Try to recover session from MSAL cache if not logged in
    if (!isLoggedIn) {
      isLoggedIn = await this.authService.tryRecoverSession(DEFAULT_SESSION_ID);
    }

    if (!isLoggedIn) {
      return { isLoggedIn: false };
    }

    const session = this.authService.getSession(DEFAULT_SESSION_ID);
    return {
      isLoggedIn: true,
      user: session?.user,
    };
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout from Azure' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(): Promise<{ status: string }> {
    await this.authService.logout(DEFAULT_SESSION_ID);
    return { status: 'success' };
  }

  @Get('auth/token')
  @ApiOperation({ summary: 'Get a valid access token' })
  @ApiResponse({ status: 200, description: 'Returns access token' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getToken(@Res() res: Response): Promise<void> {
    const token =
      await this.authService.getValidAccessToken(DEFAULT_SESSION_ID);

    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Not authenticated or session expired',
      });
      return;
    }

    res.json({ accessToken: token });
  }

  @Get('auth/redis-token')
  @ApiOperation({ summary: 'Get a Redis-scoped token for Entra ID auth' })
  @ApiResponse({ status: 200, description: 'Returns Redis token' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getRedisToken(@Res() res: Response): Promise<void> {
    const token = await this.authService.getRedisToken(DEFAULT_SESSION_ID);

    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Not authenticated or failed to acquire Redis token',
      });
      return;
    }

    res.json({ accessToken: token });
  }

  @Get('auth/ensure-database-token/:databaseId')
  @ApiOperation({
    summary: 'Ensure Azure token is valid for a specific database',
    description:
      'Checks if the database uses Azure Entra ID auth and refreshes the token if needed. ' +
      'Call this before connecting to an Azure Entra ID database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid or was refreshed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Database not found or not an Azure Entra ID database',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or wrong Azure account',
  })
  async ensureDatabaseToken(
    @Param('databaseId') databaseId: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.warn(
      `[AzureTokenRefresh] Called for databaseId: ${databaseId}`,
    );

    const sessionMetadata = {
      sessionId: DEFAULT_SESSION_ID,
      userId: DEFAULT_USER_ID,
      accountId: DEFAULT_ACCOUNT_ID,
    };

    // Get the database
    let database;
    try {
      database = await this.databaseRepository.get(sessionMetadata, databaseId);
      this.logger.warn(
        `[AzureTokenRefresh] Database: ${database.name} (${database.host}:${database.port})`,
      );
    } catch (error) {
      this.logger.warn(`[AzureTokenRefresh] Database not found: ${databaseId}`);
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Database not found',
      });
      return;
    }

    const providerDetails = database.providerDetails as
      | AzureProviderDetails
      | undefined;

    this.logger.warn(
      `[AzureTokenRefresh] authType=${providerDetails?.authType}, ` +
        `hasAccountId=${!!providerDetails?.azureAccountId}, ` +
        `tokenExpiresAt=${providerDetails?.tokenExpiresAt || 'not set'}`,
    );

    // Check if it's an Azure Entra ID database
    if (!isAzureEntraIdAuth(providerDetails)) {
      this.logger.warn(`[AzureTokenRefresh] Not an Azure Entra ID database`);
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Database is not configured for Azure Entra ID authentication',
      });
      return;
    }

    const { azureAccountId } = providerDetails;

    // Check if user is logged in with the correct Azure account
    if (!azureAccountId) {
      this.logger.warn(`[AzureTokenRefresh] Database missing azureAccountId`);
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Database is missing Azure account information',
      });
      return;
    }

    const loggedInAccountId =
      this.authService.getLoggedInAccountId(DEFAULT_SESSION_ID);
    const isMatchingUser = this.authService.isAccountLoggedIn(
      DEFAULT_SESSION_ID,
      azureAccountId,
    );

    this.logger.warn(
      `[AzureTokenRefresh] Account match: ${isMatchingUser} ` +
        `(logged in: ${loggedInAccountId ? 'yes' : 'no'})`,
    );

    if (!isMatchingUser) {
      this.logger.warn(`[AzureTokenRefresh] FAILED - Account mismatch`);
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Please sign in with the correct Azure account',
        requiredAccountId: azureAccountId,
      });
      return;
    }

    // Check if token needs refresh by decoding expiration from JWT
    // The password field contains the Azure access token (JWT)
    const currentToken = database.password;
    const tokenExpiration = currentToken
      ? getJwtExpiration(currentToken)
      : null;
    const needsRefresh =
      !currentToken || isJwtExpired(currentToken, TOKEN_REFRESH_BUFFER_SECONDS);

    if (tokenExpiration) {
      const expiresInMs = tokenExpiration.getTime() - Date.now();
      const expiresInMinutes = Math.round(expiresInMs / 1000 / 60);
      this.logger.warn(
        `[AzureTokenRefresh] Token expires in ${expiresInMinutes} min, needsRefresh=${needsRefresh}`,
      );
    } else {
      this.logger.warn(
        `[AzureTokenRefresh] Could not decode token expiration, needsRefresh=${needsRefresh}`,
      );
    }

    if (!needsRefresh) {
      this.logger.warn(`[AzureTokenRefresh] Token valid, no refresh needed`);
      res.json({
        status: 'valid',
        message: 'Token is still valid',
        expiresAt: tokenExpiration?.toISOString(),
      });
      return;
    }

    // Token expired or expiring soon - refresh it
    this.logger.warn(`[AzureTokenRefresh] Refreshing token...`);

    try {
      const tokenResult =
        await this.authService.getRedisTokenByAccountId(azureAccountId);

      if (!tokenResult) {
        this.logger.warn(`[AzureTokenRefresh] FAILED - Re-auth needed`);
        res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Failed to refresh token - please re-authenticate',
        });
        return;
      }

      this.logger.warn(
        `[AzureTokenRefresh] Got token, expires: ${tokenResult.expiresOn.toISOString()}`,
      );

      // Update database with new token (expiration is decoded from JWT, no need to store it)
      await this.databaseRepository.update(sessionMetadata, databaseId, {
        password: tokenResult.token,
      });

      this.logger.warn(`[AzureTokenRefresh] SUCCESS - Token refreshed`);

      res.json({
        status: 'refreshed',
        message: 'Token was refreshed successfully',
        expiresAt: tokenResult.expiresOn.toISOString(),
      });
    } catch (error: any) {
      this.logger.error(
        `[AzureTokenRefresh] ERROR: ${error?.message}`,
        error?.stack,
      );
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to refresh token',
        details: error?.message,
      });
    }
  }
}
