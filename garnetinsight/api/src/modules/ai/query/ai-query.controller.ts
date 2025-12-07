import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { AiQueryService } from 'src/modules/ai/query/ai-query.service';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';
import { Response } from 'express';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/expert/:id/messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiQueryController {
  private readonly logger = new Logger('AiQueryController');

  constructor(private readonly service: AiQueryService) {}

  @Post()
  @ApiEndpoint({
    description: 'Generate new query',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async streamQuestion(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
    @Body() dto: SendAiQueryMessageDto,
    @Res() res: Response,
  ) {
    await this.service.stream(sessionMetadata, databaseId, dto, res);
  }

  @Get()
  @ApiEndpoint({
    description: 'Generate new query',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async getHistory(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
  ) {
    return this.service.getHistory(sessionMetadata, databaseId);
  }

  @Delete()
  @ApiEndpoint({
    description: 'Generate new query',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async clearHistory(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
  ) {
    return this.service.clearHistory(sessionMetadata, databaseId);
  }
}
