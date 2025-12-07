import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SlowLogService } from 'src/modules/slow-log/slow-log.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { SlowLog, SlowLogConfig } from 'src/modules/slow-log/models';
import { UpdateSlowLogConfigDto } from 'src/modules/slow-log/dto/update-slow-log-config.dto';
import { GetSlowLogsDto } from 'src/modules/slow-log/dto/get-slow-logs.dto';
import { ClientMetadataParam } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';

@ApiTags('Slow Logs')
@Controller('slow-logs')
@UsePipes(new ValidationPipe({ transform: true }))
export class SlowLogController {
  constructor(private service: SlowLogService) {}

  @ApiEndpoint({
    description: 'List of slow logs',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: SlowLog,
        isArray: true,
      },
    ],
  })
  @Get('')
  async getSlowLogs(
    @ClientMetadataParam({
      ignoreDbIndex: true,
    })
    clientMetadata: ClientMetadata,
    @Query() getSlowLogsDto: GetSlowLogsDto,
  ): Promise<any> {
    return this.service.getSlowLogs(clientMetadata, getSlowLogsDto);
  }

  @ApiEndpoint({
    description: 'Clear slow logs',
    statusCode: 200,
  })
  @Delete('')
  async resetSlowLogs(
    @ClientMetadataParam({
      ignoreDbIndex: true,
    })
    clientMetadata: ClientMetadata,
  ): Promise<void> {
    return this.service.reset(clientMetadata);
  }

  @ApiEndpoint({
    description: 'Get slowlog config',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: SlowLogConfig,
      },
    ],
  })
  @Get('config')
  async getConfig(
    @ClientMetadataParam({
      ignoreDbIndex: true,
    })
    clientMetadata: ClientMetadata,
  ): Promise<SlowLogConfig> {
    return this.service.getConfig(clientMetadata);
  }

  @ApiEndpoint({
    description: 'Update slowlog config',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: SlowLogConfig,
      },
    ],
  })
  @Patch('config')
  async updateConfig(
    @ClientMetadataParam({
      ignoreDbIndex: true,
    })
    clientMetadata: ClientMetadata,
    @Body() dto: UpdateSlowLogConfigDto,
  ): Promise<SlowLogConfig> {
    return this.service.updateConfig(clientMetadata, dto);
  }
}
