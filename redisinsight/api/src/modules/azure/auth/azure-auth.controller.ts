import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AzureAuthService } from './azure-auth.service';
import { AzureAuthStatus } from '../constants';

@ApiTags('Azure Auth')
@Controller('azure/auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AzureAuthController {
  private readonly logger = new Logger(AzureAuthController.name);

  constructor(private readonly azureAuthService: AzureAuthService) {}

  @Get('login')
  @ApiOperation({
    summary: 'Get Azure OAuth authorization URL',
    description:
      'Returns a URL to redirect the user to Microsoft login for Azure Entra ID authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
  })
  async login(): Promise<{ url: string }> {
    this.logger.log('Initiating Azure OAuth login');
    const { url } = await this.azureAuthService.getAuthorizationUrl();
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
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
  ): Promise<{ status: AzureAuthStatus; message?: string }> {
    this.logger.log('Handling Azure OAuth callback');

    // Handle OAuth errors from Azure (user denial, consent issues, etc.)
    if (error) {
      this.logger.error(`Azure OAuth error: ${error}, ${errorDescription}`);
      return {
        status: AzureAuthStatus.Failed,
        message: errorDescription || error,
      };
    }

    if (!code || !state) {
      return {
        status: AzureAuthStatus.Failed,
        message: 'Missing code or state parameter',
      };
    }

    const result = await this.azureAuthService.handleCallback(code, state);

    return {
      status: result.status,
      message:
        result.status === AzureAuthStatus.Succeed
          ? `Authenticated as ${result.account?.username}`
          : 'Authentication failed',
    };
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
