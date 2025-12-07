import { Module } from '@nestjs/common';
import { AiChatController } from 'src/modules/ai/chat/ai-chat.controller';
import { AiChatService } from 'src/modules/ai/chat/ai-chat.service';
import { ConvAiProvider } from 'src/modules/ai/chat/providers/conv-ai.provider';

@Module({
  controllers: [AiChatController],
  providers: [ConvAiProvider, AiChatService],
})
export class AiChatModule {}
