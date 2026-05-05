import { ApiProperty } from '@nestjs/swagger';
import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';
import { MessageDto } from './message.dto';

export class MessagesResponse {
  @ApiProperty({
    description: 'Array of messages.',
    type: [MessageDto],
  })
  messages: IMessage[];

  @ApiProperty({
    description: 'Number of messages.',
    type: Number,
  })
  count: number;
}
