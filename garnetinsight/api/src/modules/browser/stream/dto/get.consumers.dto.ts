import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class ConsumerDto {
  @ApiProperty({
    type: String,
    description: "The consumer's name",
    example: 'consumer-2',
  })
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
  @ApiProperty({
    type: String,
    description: 'Consumer group name',
    example: 'group-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  groupName: RedisString;
}
