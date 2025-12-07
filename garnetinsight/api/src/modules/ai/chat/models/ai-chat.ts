import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AiChatMessage } from 'src/modules/ai/chat/models/ai-chat.message';

export class AiChat {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    isArray: true,
    type: () => AiChatMessage,
  })
  @Type(() => AiChatMessage)
  @Expose()
  messages: AiChatMessage[];
}
