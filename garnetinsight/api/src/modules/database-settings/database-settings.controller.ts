import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { SessionMetadata } from 'src/common/models';
import { RequestSessionMetadata } from 'src/common/decorators';
import { CreateOrUpdateDatabaseSettingDto } from 'src/modules/database-settings/dto/database-setting.dto';
import { DatabaseSettingsService } from 'src/modules/database-settings/database-settings.service';
import { DatabaseSettings } from 'src/modules/database-settings/models/database-settings';

@UseInterceptors(BrowserSerializeInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Database: Database settings')
@Controller('/')
export class DatabaseSettingsController {
  constructor(private readonly service: DatabaseSettingsService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database settings',
    responses: [
      {
        status: 200,
        type: DatabaseSettings,
      },
    ],
  })
  @Get('')
  async get(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('dbInstance') databaseId: string,
  ): Promise<DatabaseSettings> {
    return this.service.get(sessionMetadata, databaseId);
  }

  @ApiEndpoint({
    statusCode: 200,
    description: 'Update database settings',
    responses: [
      {
        status: 200,
        type: DatabaseSettings,
      },
    ],
  })
  @Post('')
  @ApiBody({ type: CreateOrUpdateDatabaseSettingDto })
  async create(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('dbInstance') databaseId: string,
    @Body() dto: CreateOrUpdateDatabaseSettingDto,
  ): Promise<DatabaseSettings> {
    return this.service.createOrUpdate(sessionMetadata, databaseId, dto);
  }

  @Delete('')
  @ApiRedisParams()
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete database settings',
  })
  async delete(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('dbInstance') databaseId: string,
  ): Promise<void> {
    await this.service.delete(sessionMetadata, databaseId);
  }
}
