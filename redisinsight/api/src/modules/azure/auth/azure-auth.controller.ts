import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AzureAuthService } from './azure-auth.service';
import { AzureAuthAnalytics } from './azure-auth.analytics';
import { AzureAuthStatus } from '../constants';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { wrapHttpError } from 'src/common/utils';

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
    description:
      'OAuth prompt parameter: "select_account" to show account picker, "login" to force re-auth',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
  })
  async login(@Query('prompt') prompt?: string): Promise<{ url: string }> {
    this.logger.log('Initiating Azure OAuth login');
    const { url } = await this.azureAuthService.getAuthorizationUrl(prompt);
    return { url };
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Handle OAuth callback',
    description: 'Exchanges authorization code for tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Callback handled successfully',
  })
  async callback(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
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
      return {
        status: AzureAuthStatus.Failed,
        error: errorDescription || error,
      };
    }

    if (!code || !state) {
      this.analytics.sendAzureSignInFailed(
        sessionMetadata,
        new BadRequestException('Missing code or state parameter'),
      );
      return {
        status: AzureAuthStatus.Failed,
        error: 'Missing code or state parameter',
      };
    }

    try {
      const result = await this.azureAuthService.handleCallback(code, state);

      if (result.status === AzureAuthStatus.Succeed) {
        this.analytics.sendAzureSignInSucceeded(sessionMetadata);
      } else {
        this.analytics.sendAzureSignInFailed(
          sessionMetadata,
          new BadRequestException(result.error || 'Authentication failed'),
        );
      }

      return result;
    } catch (e) {
      this.logger.error('Azure OAuth callback failed', e);
      this.analytics.sendAzureSignInFailed(sessionMetadata, wrapHttpError(e));
      throw e;
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
