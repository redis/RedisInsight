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
import { Response } from 'express';
import { AiAgentService } from './ai-agent.service';
import { SendAiAgentMessageDto } from './dto/send.ai-agent.message.dto';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/agent/:id/messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiAgentController {
  private readonly logger = new Logger('AiAgentController');

  constructor(private readonly service: AiAgentService) {}

  @Post()
  @ApiEndpoint({
    description: 'Send a message to the AI agent',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async streamMessage(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
    @Body() dto: SendAiAgentMessageDto,
    @Res() res: Response,
  ) {
    await this.service.stream(sessionMetadata, databaseId, dto, res);
  }

  @Get()
  @ApiEndpoint({
    description: 'Get AI agent chat history',
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
    description: 'Clear AI agent chat history',
    statusCode: 200,
  })
  async clearHistory(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
  ) {
    return this.service.clearHistory(sessionMetadata, databaseId);
  }
}
