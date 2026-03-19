import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Res,
  UsePipes,
  ValidationPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AzureAuthService } from './azure-auth.service';
import { AzureAuthAnalytics } from './azure-auth.analytics';
import { AzureAuthStatus, AzureOAuthRedirectType } from '../constants';
import { AzureAuthLoginDto, AzureOAuthPrompt } from './dto';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { wrapHttpError } from 'src/common/utils';
import { generateCallbackHtml } from './azure-auth-callback.template';

@ApiTags('Azure Auth')
@Controller('azure/auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AzureAuthController {
  private readonly logger = new Logger(AzureAuthController.name);

  constructor(
    private readonly azureAuthService: AzureAuthService,
    private readonly analytics: AzureAuthAnalytics,
  ) {}

  @Get('login')
  @ApiOperation({
    summary: 'Get Azure OAuth authorization URL',
    description:
      'Returns a URL to redirect the user to Microsoft login for Azure Entra ID authentication.',
  })
  @ApiQuery({
    name: 'prompt',
    required: false,
    enum: AzureOAuthPrompt,
    description:
      'OAuth prompt parameter: "select_account" to show account picker, "login" to force re-auth, "consent" to force consent dialog',
  })
  @ApiQuery({
    name: 'redirectType',
    required: false,
    enum: AzureOAuthRedirectType,
    description:
      'Redirect type: "deeplink" for Electron app, "web" for browser/Docker deployments',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
  })
  async login(@Query() dto: AzureAuthLoginDto): Promise<{ url: string }> {
    this.logger.log(
      `Initiating Azure OAuth login with redirect type: ${dto.redirectType || 'deeplink'}`,
    );
    const { url } = await this.azureAuthService.getAuthorizationUrl(
      dto.prompt,
      dto.redirectType,
    );
    return { url };
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Handle OAuth callback',
    description:
      'Exchanges authorization code for tokens. For web redirects, returns HTML with postMessage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Callback handled successfully',
  })
  async callback(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Res({ passthrough: true }) res: Response,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
  ) {
    this.logger.log('Handling Azure OAuth callback');

    // Handle OAuth errors from Azure (user denial, consent issues, etc.)
    if (error) {
      this.logger.error(`Azure OAuth error: ${error}, ${errorDescription}`);
      this.analytics.sendAzureSignInFailed(
        sessionMetadata,
        new BadRequestException(errorDescription || error),
      );
      const errorResult = {
        status: AzureAuthStatus.Failed,
        error: errorDescription || error,
      };
      // Return HTML for web flow errors (most common case in Docker/web)
      res.type('text/html');
      return generateCallbackHtml({
        result: errorResult,
        isDevMode: process.env.NODE_ENV === 'development',
      });
    }

    if (!code || !state) {
      this.analytics.sendAzureSignInFailed(
        sessionMetadata,
        new BadRequestException('Missing code or state parameter'),
      );
      const errorResult = {
        status: AzureAuthStatus.Failed,
        error: 'Missing code or state parameter',
      };
      res.type('text/html');
      return generateCallbackHtml({
        result: errorResult,
        isDevMode: process.env.NODE_ENV === 'development',
      });
    }

    try {
      const result = await this.azureAuthService.handleCallback(code, state);
      const { redirectType, ...resultWithoutRedirectType } = result;

      if (result.status === AzureAuthStatus.Succeed) {
        this.analytics.sendAzureSignInSucceeded(sessionMetadata);
      } else {
        this.analytics.sendAzureSignInFailed(
          sessionMetadata,
          new BadRequestException(result.error || 'Authentication failed'),
        );
      }

      // For web redirects, return HTML page with postMessage
      if (redirectType === AzureOAuthRedirectType.Web) {
        const callbackResult = {
          status: result.status,
          account: result.account
            ? {
                id: result.account.homeAccountId,
                username: result.account.username,
                name: result.account.name,
              }
            : undefined,
          error: result.error,
        };

        res.type('text/html');
        return generateCallbackHtml({
          result: callbackResult,
          isDevMode: process.env.NODE_ENV === 'development',
        });
      }

      // For deeplink redirects, return JSON (for Electron IPC handling)
      return resultWithoutRedirectType;
    } catch (e) {
      this.logger.error('Azure OAuth callback failed', e);
      this.analytics.sendAzureSignInFailed(sessionMetadata, wrapHttpError(e));

      // Return HTML error page for web flows instead of throwing JSON error.
      // This ensures the popup can communicate the error to the main window via localStorage.
      // We default to web flow since deeplink flows redirect to redisinsight:// and don't reach HTTP callback.
      res.type('text/html');
      return generateCallbackHtml({
        result: {
          status: AzureAuthStatus.Failed,
          error: e instanceof Error ? e.message : 'Authentication failed',
        },
        isDevMode: process.env.NODE_ENV === 'development',
      });
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get authentication status',
    description:
      'Returns current auth status and list of authenticated accounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully',
  })
  async status() {
    return this.azureAuthService.getStatus();
  }

  @Post('logout/:accountId')
  @ApiOperation({
    summary: 'Logout an Azure account',
    description: 'Removes the account from the token cache.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'The account ID (homeAccountId) to logout',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(
    @Param('accountId') accountId: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(`Logging out Azure account: ${accountId}`);

    try {
      await this.azureAuthService.logout(accountId);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}
