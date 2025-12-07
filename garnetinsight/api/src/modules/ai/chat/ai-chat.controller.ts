import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags, PickType } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { AiChatService } from 'src/modules/ai/chat/ai-chat.service';
import { AiChat } from 'src/modules/ai/chat/models';
import { SendAiChatMessageDto } from 'src/modules/ai/chat/dto/send.ai-chat.message.dto';
import { Response } from 'express';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/assistant/chats')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiChatController {
  constructor(private readonly service: AiChatService) {}

  @Post('/')
  @ApiEndpoint({
    description: 'Create a new chat',
    statusCode: 200,
    responses: [{ type: PickType(AiChat, ['id']) }],
  })
  async create(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<Partial<AiChat>> {
    return this.service.create(sessionMetadata);
  }

  @Get('/:id')
  @ApiEndpoint({
    description: 'Get chat history',
    statusCode: 200,
    responses: [{ type: AiChat }],
  })
  async getHistory(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') id: string,
  ) {
    return this.service.getHistory(sessionMetadata, id);
  }

  @Post('/:id/messages')
  @ApiEndpoint({
    description: 'Post a message',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async postMessage(
    @Res() res: Response,
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') id: string,
    @Body() dto: SendAiChatMessageDto,
  ) {
    const stream = await this.service.postMessage(sessionMetadata, id, dto);
    stream.pipe(res);
  }

  @Delete('/:id')
  @ApiEndpoint({
    description: 'Reset chat',
    statusCode: 200,
  })
  async delete(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(sessionMetadata, id);
  }
}
