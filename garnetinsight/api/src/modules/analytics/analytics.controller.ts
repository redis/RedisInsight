import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { SendEventDto } from 'src/modules/analytics/dto/analytics.dto';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';

@ApiTags('Analytics')
@Controller('analytics')
@UsePipes(new ValidationPipe({ transform: true }))
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Post('send-event')
  @ApiEndpoint({
    description: 'Send telemetry event',
    statusCode: 204,
    responses: [
      {
        status: 204,
      },
    ],
  })
  async sendEvent(
    @Body() dto: SendEventDto,
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<void> {
    return this.service.sendEvent(sessionMetadata, dto);
  }

  @Post('send-page')
  @ApiEndpoint({
    description: 'Send telemetry page',
    statusCode: 204,
    responses: [
      {
        status: 204,
      },
    ],
  })
  async sendPage(
    @Body() dto: SendEventDto,
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<void> {
    return this.service.sendPage(sessionMetadata, dto);
  }
}
