import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { GetConsumersDto } from './get.consumers.dto';

export class PendingEntryDto {
  @ApiProperty({
    type: String,
    description: 'Entry ID',
    example: '*',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Consumer name',
    example: 'consumer-1',
  })
  @RedisStringType()
  consumerName: RedisString;

  @ApiProperty({
    type: Number,
    description:
      'The number of milliseconds that elapsed since the last time ' +
      'this message was delivered to this consumer',
    example: 22442,
  })
  idle: number = 0;

  @ApiProperty({
    type: Number,
    description: 'The number of times this message was delivered',
    example: 2,
  })
  delivered: number = 0;
}

export class GetPendingEntriesDto extends IntersectionType(
  KeyDto,
  GetConsumersDto,
) {
  @ApiProperty({
    type: String,
    description: 'Consumer name',
    example: 'consumer-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  consumerName: RedisString;

  @ApiPropertyOptional({
    description: 'Specifying the start id',
    type: String,
    default: '-',
  })
  @IsString()
  start?: string = '-';

  @ApiPropertyOptional({
    description: 'Specifying the end id',
    type: String,
    default: '+',
  })
  @IsString()
  end?: string = '+';

  @ApiPropertyOptional({
    description: 'Specifying the number of pending messages to return.',
    type: Number,
    minimum: 1,
    default: 500,
  })
  @IsInt()
  @Min(1)
  count?: number = 500;
}
