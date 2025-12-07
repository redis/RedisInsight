import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { ClientMetadata, DatabaseIndex } from 'src/common/models';
import { ClientMetadataParam } from 'src/common/decorators';
import { DbIndexValidationPipe } from 'src/common/pipes';
import { DatabaseOverviewKeyspace } from './constants/overview';

@ApiTags('Database Instances')
@Controller('databases')
@UsePipes(new ValidationPipe({ transform: true }))
export class DatabaseInfoController {
  constructor(private databaseInfoService: DatabaseInfoService) {}

  @Get(':id/info')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get Redis database config info',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis database info',
        type: RedisDatabaseInfoResponse,
      },
    ],
  })
  async getInfo(
    @ClientMetadataParam({
      databaseIdParam: 'id',
      ignoreDbIndex: true,
    })
    clientMetadata: ClientMetadata,
  ): Promise<RedisDatabaseInfoResponse> {
    return this.databaseInfoService.getInfo(clientMetadata);
  }

  @Get(':id/overview')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get Redis database overview',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis database overview',
        type: DatabaseOverview,
      },
    ],
  })
  @ApiQuery({
    name: 'keyspace',
    required: false,
    enum: DatabaseOverviewKeyspace,
  })
  async getDatabaseOverview(
    @ClientMetadataParam({
      databaseIdParam: 'id',
      ignoreDbIndex: false, // do not ignore db index to calculate current (selected) keys in db
    })
    clientMetadata: ClientMetadata,
    @Query()
    {
      keyspace = DatabaseOverviewKeyspace.Current,
    }: { keyspace: DatabaseOverviewKeyspace },
  ): Promise<DatabaseOverview> {
    return this.databaseInfoService.getOverview(clientMetadata, keyspace);
  }

  @Get(':id/db/:index')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Try to create connection to specified database index',
    statusCode: 200,
    responses: [
      {
        status: 200,
      },
    ],
  })
  async getDatabaseIndex(
    @Param('index', new DbIndexValidationPipe({ transform: true }))
    databaseIndexDto: DatabaseIndex,
    @ClientMetadataParam({
      databaseIdParam: 'id',
      ignoreDbIndex: false,
    })
    clientMetadata: ClientMetadata,
  ): Promise<void> {
    return this.databaseInfoService.getDatabaseIndex(
      clientMetadata,
      databaseIndexDto.db,
    );
  }
}
