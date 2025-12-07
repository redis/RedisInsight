import { ApiProperty } from '@nestjs/swagger';
import { IsNotIn } from 'class-validator';

export class CreatePluginStateDto {
  @ApiProperty({
    type: String,
    example: 'any',
    description: 'State can be anything except "undefined"',
  })
  @IsNotIn([undefined], {
    message: 'state should be defined',
  })
  state: any;
}
