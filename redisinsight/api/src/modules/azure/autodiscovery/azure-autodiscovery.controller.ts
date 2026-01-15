import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AzureAutodiscoveryService } from './azure-autodiscovery.service';
import { AzureAuthService } from '../auth/azure-auth.service';
import {
  AzureSubscription,
  AzureRedisDatabase,
  AzureConnectionDetails,
} from '../models/azure-resource.models';

const DEFAULT_SESSION_ID = 'default';

@ApiTags('Azure')
@Controller('azure')
export class AzureAutodiscoveryController {
  constructor(
    private readonly autodiscoveryService: AzureAutodiscoveryService,
    private readonly authService: AzureAuthService,
  ) {}

  private async ensureAuthenticated(): Promise<void> {
    let isLoggedIn = this.authService.isLoggedIn(DEFAULT_SESSION_ID);

    // Try to recover session from MSAL cache
    if (!isLoggedIn) {
      isLoggedIn = await this.authService.tryRecoverSession(DEFAULT_SESSION_ID);
    }

    if (!isLoggedIn) {
      throw new HttpException(
        'Not authenticated with Azure',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List Azure subscriptions' })
  @ApiResponse({ status: 200, description: 'Returns list of subscriptions' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listSubscriptions(): Promise<AzureSubscription[]> {
    await this.ensureAuthenticated();
    return this.autodiscoveryService.listSubscriptions();
  }

  @Get('databases')
  @ApiOperation({ summary: 'List all Azure Redis databases' })
  @ApiResponse({ status: 200, description: 'Returns list of databases' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listDatabases(): Promise<AzureRedisDatabase[]> {
    await this.ensureAuthenticated();
    return this.autodiscoveryService.listDatabases();
  }

  @Post('subscriptions/databases')
  @ApiOperation({ summary: 'List Redis databases in a specific subscription' })
  @ApiBody({ description: 'Subscription object' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of databases in subscription',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listDatabasesInSubscription(
    @Body() subscription: AzureSubscription,
  ): Promise<AzureRedisDatabase[]> {
    await this.ensureAuthenticated();
    return this.autodiscoveryService.listDatabasesInSubscription(subscription);
  }

  @Post('databases/connection-details')
  @ApiOperation({ summary: 'Get connection details for a database' })
  @ApiBody({ description: 'Database object' })
  @ApiResponse({ status: 200, description: 'Returns connection details' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Failed to get connection details' })
  async getConnectionDetails(
    @Body() database: AzureRedisDatabase,
  ): Promise<AzureConnectionDetails> {
    await this.ensureAuthenticated();

    const details =
      await this.autodiscoveryService.getConnectionDetails(database);

    if (!details) {
      throw new HttpException(
        'Failed to get connection details',
        HttpStatus.NOT_FOUND,
      );
    }

    return details;
  }
}
