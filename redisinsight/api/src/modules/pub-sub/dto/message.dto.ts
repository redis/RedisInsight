import { ApiProperty } from '@nestjs/swagger';
import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';

export class MessageDto implements IMessage {
  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Channel name',
    type: String,
  })
  channel: string;

  @ApiProperty({
    description: 'Timestamp',
    type: Number,
  })
  time: number;
}
