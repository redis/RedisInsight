import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class ConsumerDto {
  @ApiRedisString("The consumer's name")
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: Number,
    description:
      'The number of pending messages for the client, ' +
      'which are messages that were delivered but are yet to be acknowledged',
    example: 2,
  })
  pending: number = 0;

  @ApiProperty({
    type: Number,
    description:
      'The number of milliseconds that have passed since the consumer last interacted with the server',
    example: 22442,
  })
  idle: number = 0;
}

export class GetConsumersDto extends KeyDto {
  @ApiRedisString('Consumer group name')
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  groupName: RedisString;
}
