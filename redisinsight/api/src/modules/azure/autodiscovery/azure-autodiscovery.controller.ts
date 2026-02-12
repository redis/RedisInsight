import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Res,
  HttpStatus,
  HttpException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AzureAutodiscoveryService } from './azure-autodiscovery.service';
import { AzureAutodiscoveryAnalytics } from './azure-autodiscovery.analytics';
import { AzureAuthService } from '../auth/azure-auth.service';
import { AZURE_SUBSCRIPTION_ID_REGEX } from '../constants';
import { AzureSubscription, AzureRedisDatabase } from '../models';
import { ImportAzureDatabasesDto, ImportAzureDatabaseResponse } from './dto';
import { ActionStatus, SessionMetadata } from 'src/common/models';
import { RequestSessionMetadata } from 'src/common/decorators';
import { wrapHttpError } from 'src/common/utils';

@ApiTags('Azure')
@Controller('azure')
@UsePipes(new ValidationPipe({ transform: true }))
export class AzureAutodiscoveryController {
  constructor(
    private readonly autodiscoveryService: AzureAutodiscoveryService,
    private readonly authService: AzureAuthService,
    private readonly analytics: AzureAutodiscoveryAnalytics,
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
  @ApiResponse({
    status: 200,
    description: 'Returns list of subscriptions',
    type: AzureSubscription,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listSubscriptions(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Query('accountId') accountId: string,
  ): Promise<AzureSubscription[]> {
    try {
      await this.ensureAuthenticated(accountId);
      const subscriptions =
        await this.autodiscoveryService.listSubscriptions(accountId);
      this.analytics.sendAzureSubscriptionsDiscoverySucceeded(
        sessionMetadata,
        subscriptions,
      );
      return subscriptions;
    } catch (e) {
      this.analytics.sendAzureSubscriptionsDiscoveryFailed(
        sessionMetadata,
        wrapHttpError(e),
      );
      throw e;
    }
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
    type: AzureRedisDatabase,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID format' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async listDatabasesInSubscription(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Query('accountId') accountId: string,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<AzureRedisDatabase[]> {
    try {
      this.validateSubscriptionId(subscriptionId);
      await this.ensureAuthenticated(accountId);
      const databases =
        await this.autodiscoveryService.listDatabasesInSubscription(
          accountId,
          subscriptionId,
        );
      this.analytics.sendAzureDatabasesDiscoverySucceeded(
        sessionMetadata,
        databases,
      );
      return databases;
    } catch (e) {
      this.analytics.sendAzureDatabasesDiscoveryFailed(
        sessionMetadata,
        wrapHttpError(e),
      );
      throw e;
    }
  }

  @Post('autodiscovery/databases')
  @ApiOperation({ summary: 'Add Azure databases from autodiscovery' })
  @ApiResponse({
    status: 201,
    description: 'Added databases list',
    type: ImportAzureDatabaseResponse,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async addDiscoveredDatabases(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: ImportAzureDatabasesDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.ensureAuthenticated(dto.accountId);

    const result = await this.autodiscoveryService.addDatabases(
      sessionMetadata,
      dto.accountId,
      dto.databases,
    );

    const hasSuccessResult = result.some(
      (addResponse: ImportAzureDatabaseResponse) =>
        addResponse.status === ActionStatus.Success,
    );

    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }

    return res.status(201).json(result);
  }
}
