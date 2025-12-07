import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum AiChatMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export class AiChatMessageContextRecord {
  @Expose()
  title: string;

  @Expose()
  category: string;
}

export class AiChatMessage {
  @ApiProperty({
    enum: AiChatMessageType,
  })
  @Expose()
  type: AiChatMessageType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  content: string;

  @ApiProperty({
    type: Object,
    example: {
      'https://redis.io/docs/about': {
        title: 'Introduction to Redis',
        category: 'oss',
      },
      'https://redis.io/docs/get-started': {
        title: 'Quick starts',
        category: 'oss',
      },
    },
  })
  @Expose()
  context: Record<string, AiChatMessageContextRecord>;
}
