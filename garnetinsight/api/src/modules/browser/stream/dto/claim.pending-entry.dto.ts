import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmpty,
  Min,
  NotEquals,
  ValidateIf,
} from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class ClaimPendingEntryDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Consumer group name',
    example: 'group-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  groupName: RedisString;

  @ApiProperty({
    type: String,
    description: 'Consumer name',
    example: 'consumer-1',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  consumerName: RedisString;

  @ApiProperty({
    description:
      'Claim only if its idle time is greater the minimum idle time ',
    type: Number,
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  minIdleTime: number = 0;

  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  entries: string[];

  @ApiPropertyOptional({
    description:
      'Set the idle time (last time it was delivered) of the message',
    type: Number,
    minimum: 0,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  idle?: number;

  @ApiPropertyOptional({
    description:
      'This is the same as IDLE but instead of a relative amount of milliseconds, ' +
      'it sets the idle time to a specific Unix time (in milliseconds)',
    type: Number,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  time?: number;

  @ApiPropertyOptional({
    description:
      'Set the retry counter to the specified value. ' +
      'This counter is incremented every time a message is delivered again. ' +
      'Normally XCLAIM does not alter this counter, which is just served to clients when the XPENDING command ' +
      'is called: this way clients can detect anomalies, like messages that are never processed ' +
      'for some reason after a big number of delivery attempts',
    type: Number,
    minimum: 0,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  retryCount?: number;

  @ApiPropertyOptional({
    description:
      'Creates the pending message entry in the PEL even if certain specified IDs are not already ' +
      'in the PEL assigned to a different client',
    type: Boolean,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsBoolean()
  force?: boolean;
}
