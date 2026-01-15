import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AzureAuthService } from './azure-auth.service';
import { AzureAuthStatus } from '../models/azure-auth.models';
import { AzureDatabaseTokenService } from '../azure-database-token.service';
import {
  DEFAULT_SESSION_ID,
  DEFAULT_USER_ID,
  DEFAULT_ACCOUNT_ID,
} from 'src/common/constants';

@ApiTags('Azure')
@Controller('azure')
export class AzureAuthController {
  private readonly logger = new Logger(AzureAuthController.name);

  constructor(
    private readonly authService: AzureAuthService,
    private readonly databaseTokenService: AzureDatabaseTokenService,
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
      // Proactively refresh tokens for existing Azure databases
      await this.refreshDatabaseTokensAfterLogin(
        result.data?.user?.homeAccountId,
      );

      // Redirect to frontend with success
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
    databasesRefreshed?: number;
  }> {
    const result = await this.authService.handleCallback(
      body.code,
      body.state,
      DEFAULT_SESSION_ID,
    );

    if (result.status === AzureAuthStatus.Succeed) {
      // Proactively refresh tokens for existing Azure databases
      const refreshSummary = await this.refreshDatabaseTokensAfterLogin(
        result.data?.user?.homeAccountId,
      );

      return {
        status: 'success',
        databasesRefreshed: refreshSummary?.refreshed ?? 0,
      };
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

  /**
   * Refresh tokens for existing Azure databases after successful login
   */
  private async refreshDatabaseTokensAfterLogin(azureAccountId?: string) {
    if (!azureAccountId) {
      return null;
    }

    try {
      const sessionMetadata = {
        sessionId: DEFAULT_SESSION_ID,
        userId: DEFAULT_USER_ID,
        accountId: DEFAULT_ACCOUNT_ID,
      };

      const summary =
        await this.databaseTokenService.refreshDatabasesForAccount(
          sessionMetadata,
          azureAccountId,
        );

      if (summary.totalFound > 0) {
        this.logger.log(
          `Proactive token refresh: ${summary.refreshed}/${summary.totalFound} databases refreshed`,
        );
      }

      return summary;
    } catch (error: any) {
      this.logger.error(
        'Failed to refresh database tokens after login',
        error?.message,
      );
      return null;
    }
  }
}
