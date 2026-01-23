import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Res,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AzureAuthService } from './azure-auth.service';
import { AzureAuthStatus } from '../models/azure-auth.models';
import { DEFAULT_SESSION_ID } from 'src/common/constants';
import { AzureTokenRefreshManager } from '../azure-token-refresh.manager';

@ApiTags('Azure')
@Controller('azure')
export class AzureAuthController {
  private readonly logger = new Logger(AzureAuthController.name);

  constructor(
    private readonly authService: AzureAuthService,
    private readonly tokenRefreshManager: AzureTokenRefreshManager,
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

  @Post('auth/force-refresh/:databaseId')
  @ApiOperation({
    summary: '[DEBUG] Force token refresh for a database',
    description:
      'Triggers immediate token refresh regardless of expiration time. For testing only.',
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 400, description: 'No active timer for database' })
  async forceTokenRefresh(
    @Param('databaseId') databaseId: string,
  ): Promise<{ status: string; message: string }> {
    this.logger.log(`Force refresh requested for ${databaseId}`);

    try {
      await this.tokenRefreshManager.forceRefresh(databaseId);
      return {
        status: 'success',
        message: `Token refresh triggered for database ${databaseId}`,
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Failed to trigger refresh',
      };
    }
  }
}
