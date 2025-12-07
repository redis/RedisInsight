import { Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { ConvAiProvider } from 'src/modules/ai/chat/providers/conv-ai.provider';
import { plainToInstance } from 'class-transformer';
import { AiChat } from 'src/modules/ai/chat/models';
import { SendAiChatMessageDto } from 'src/modules/ai/chat/dto/send.ai-chat.message.dto';

@Injectable()
export class AiChatService {
  constructor(private readonly convAiProvider: ConvAiProvider) {}

  async create(sessionMetadata: SessionMetadata): Promise<Partial<AiChat>> {
    const id = await this.convAiProvider.auth(sessionMetadata);
    return plainToInstance(AiChat, { id });
  }

  async postMessage(
    sessionMetadata: SessionMetadata,
    chatId: string,
    dto: SendAiChatMessageDto,
  ) {
    return this.convAiProvider.postMessage(
      sessionMetadata,
      chatId,
      dto.content,
    );
  }

  async getHistory(
    sessionMetadata: SessionMetadata,
    chatId: string,
  ): Promise<AiChat> {
    return plainToInstance(AiChat, {
      id: chatId,
      messages: await this.convAiProvider.getHistory(sessionMetadata, chatId),
    });
  }

  async delete(
    sessionMetadata: SessionMetadata,
    chatId: string,
  ): Promise<void> {
    return this.convAiProvider.reset(sessionMetadata, chatId);
  }
}
