import {
  Body,
  Query,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { Response } from 'express';
import { ActionStatus, SessionMetadata } from 'src/common/models';
import { BuildType } from 'src/modules/server/models/server';
import config from 'src/utils/config';
import { CloudAccountInfo } from 'src/modules/cloud/user/models';
import { CloudSubscription } from 'src/modules/cloud/subscription/models';
import { CloudDatabase } from 'src/modules/cloud/database/models';
import {
  DiscoverCloudDatabasesDto,
  ImportCloudDatabaseResponse,
  ImportCloudDatabasesDto,
} from 'src/modules/cloud/autodiscovery/dto';
import { RequestSessionMetadata } from 'src/common/decorators';
import { MeCloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/me.cloud-autodiscovery.service';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';

const cloudConf = config.get('cloud');

@ApiTags('Cloud Autodiscovery')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(new TimeoutInterceptor(undefined, cloudConf.discoveryTimeout))
@Controller('cloud/me/autodiscovery')
export class MeCloudAutodiscoveryController {
  constructor(private service: MeCloudAutodiscoveryService) {}

  @Get('account')
  @ApiEndpoint({
    description: 'Get current account',
    statusCode: 200,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 200,
        description: 'Account Details.',
        type: CloudAccountInfo,
      },
    ],
  })
  async getAccount(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Query() utm: CloudRequestUtm,
  ): Promise<CloudAccountInfo> {
    return await this.service.getAccount(sessionMetadata, utm);
  }

  @Get('subscriptions')
  @ApiEndpoint({
    description: 'Get information about current account’s subscriptions.',
    statusCode: 200,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 200,
        description: 'Redis cloud subscription list.',
        type: CloudSubscription,
        isArray: true,
      },
    ],
  })
  async discoverSubscriptions(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Query() utm: CloudRequestUtm,
  ): Promise<CloudSubscription[]> {
    return await this.service.discoverSubscriptions(sessionMetadata, utm);
  }

  @Post('get-databases')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiEndpoint({
    description: 'Get databases belonging to subscriptions',
    statusCode: 200,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 200,
        description: 'Databases list.',
        type: CloudDatabase,
        isArray: true,
      },
    ],
  })
  async discoverDatabases(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: DiscoverCloudDatabasesDto,
    @Query() utm: CloudRequestUtm,
  ): Promise<CloudDatabase[]> {
    return await this.service.discoverDatabases(sessionMetadata, dto, utm);
  }

  @Post('databases')
  @ApiEndpoint({
    description: 'Add databases from Redis Enterprise Cloud Pro account.',
    statusCode: 201,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 201,
        description: 'Added databases list.',
        type: ImportCloudDatabaseResponse,
        isArray: true,
      },
    ],
  })
  async addDiscoveredDatabases(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: ImportCloudDatabasesDto,
    @Res() res: Response,
    @Query() utm: CloudRequestUtm,
  ): Promise<Response> {
    const result = await this.service.addRedisCloudDatabases(
      sessionMetadata,
      dto.databases,
      utm,
    );
    const hasSuccessResult = result.some(
      (addResponse: ImportCloudDatabaseResponse) =>
        addResponse.status === ActionStatus.Success,
    );
    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }
    return res.json(result);
  }
}
