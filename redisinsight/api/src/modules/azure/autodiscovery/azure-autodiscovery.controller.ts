import {
  Controller,
  Get,
  Query,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AzureAutodiscoveryService } from './azure-autodiscovery.service';
import { AzureAuthService } from '../auth/azure-auth.service';
import { AZURE_SUBSCRIPTION_ID_REGEX } from '../constants';
import {
  AzureSubscription,
  AzureRedisDatabase,
  AzureConnectionDetails,
} from '../models';

@ApiTags('Azure')
@Controller('azure')
export class AzureAutodiscoveryController {
  constructor(
    private readonly autodiscoveryService: AzureAutodiscoveryService,
    private readonly authService: AzureAuthService,
  ) {}

  private validateSubscriptionId(subscriptionId: string): void {
    if (!subscriptionId || !AZURE_SUBSCRIPTION_ID_REGEX.test(subscriptionId)) {
      throw new HttpException(
        'Invalid subscription ID format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async ensureAuthenticated(accountId: string): Promise<void> {
    const status = await this.authService.getStatus();

    if (!status.authenticated) {
      throw new HttpException(
        'Not authenticated with Azure',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accountExists = status.accounts.some((acc) => acc.id === accountId);
    if (!accountExists) {
      throw new HttpException(
        'Invalid Azure account ID',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List Azure subscriptions' })
  @ApiQuery({
    name: 'accountId',
    description: 'Azure account ID (homeAccountId)',
  })
  @ApiResponse({ status: 200, description: 'Returns list of subscriptions' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listSubscriptions(
    @Query('accountId') accountId: string,
  ): Promise<AzureSubscription[]> {
    await this.ensureAuthenticated(accountId);
    return this.autodiscoveryService.listSubscriptions(accountId);
  }

  @Get('subscriptions/:subscriptionId/databases')
  @ApiOperation({ summary: 'List Redis databases in a specific subscription' })
  @ApiQuery({
    name: 'accountId',
    description: 'Azure account ID (homeAccountId)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of databases in subscription',
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID format' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listDatabasesInSubscription(
    @Query('accountId') accountId: string,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    this.validateSubscriptionId(subscriptionId);
    await this.ensureAuthenticated(accountId);
    return this.autodiscoveryService.listDatabasesInSubscription(
      accountId,
      subscriptionId,
    );
  }

  @Get('databases/connection-details')
  @ApiOperation({ summary: 'Get connection details for a database' })
  @ApiQuery({
    name: 'accountId',
    description: 'Azure account ID (homeAccountId)',
  })
  @ApiQuery({
    name: 'databaseId',
    description: 'Azure resource ID of the database',
  })
  @ApiResponse({ status: 200, description: 'Returns connection details' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Failed to get connection details' })
  async getConnectionDetails(
    @Query('accountId') accountId: string,
    @Query('databaseId') databaseId: string,
  ): Promise<AzureConnectionDetails> {
    await this.ensureAuthenticated(accountId);

    const details = await this.autodiscoveryService.getConnectionDetails(
      accountId,
      databaseId,
    );

    if (!details) {
      throw new HttpException(
        'Failed to get connection details',
        HttpStatus.NOT_FOUND,
      );
    }

    return details;
  }
}
