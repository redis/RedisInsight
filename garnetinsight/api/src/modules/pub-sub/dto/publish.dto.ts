import { IsDefined, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishDto {
  @ApiProperty({
    type: String,
    description: 'Message to send',
    example: '{"hello":"world"}',
  })
  @IsDefined()
  @IsString()
  message: string;

  @ApiProperty({
    type: String,
    description: 'Chanel name',
    example: 'channel-1',
  })
  @IsDefined()
  @IsString()
  channel: string;
}
