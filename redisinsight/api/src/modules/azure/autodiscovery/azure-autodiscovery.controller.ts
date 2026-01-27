import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AzureAutodiscoveryService } from './azure-autodiscovery.service';
import { AzureAuthService } from '../auth/azure-auth.service';
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
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listDatabasesInSubscription(
    @Query('accountId') accountId: string,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    await this.ensureAuthenticated(accountId);
    return this.autodiscoveryService.listDatabasesInSubscription(
      accountId,
      subscriptionId,
    );
  }

  @Post('databases/connection-details')
  @ApiOperation({ summary: 'Get connection details for a database' })
  @ApiQuery({
    name: 'accountId',
    description: 'Azure account ID (homeAccountId)',
  })
  @ApiBody({ description: 'Database object' })
  @ApiResponse({ status: 200, description: 'Returns connection details' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Failed to get connection details' })
  async getConnectionDetails(
    @Query('accountId') accountId: string,
    @Body() database: AzureRedisDatabase,
  ): Promise<AzureConnectionDetails> {
    await this.ensureAuthenticated(accountId);

    const details = await this.autodiscoveryService.getConnectionDetails(
      accountId,
      database,
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
