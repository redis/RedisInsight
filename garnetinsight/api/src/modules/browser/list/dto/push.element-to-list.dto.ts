import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDefined, IsEnum } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export enum ListElementDestination {
  Tail = 'TAIL',
  Head = 'HEAD',
}

export class PushElementToListDto extends KeyDto {
  @ApiProperty({
    description: 'List element(s)',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  elements: RedisString[];

  @ApiPropertyOptional({
    description:
      'In order to append elements to the end of the list, ' +
      'use the TAIL value, to prepend use HEAD value. ' +
      'Default: TAIL (when not specified)',
    default: ListElementDestination.Tail,
    enum: ListElementDestination,
  })
  @IsEnum(ListElementDestination, {
    message: `destination must be a valid enum value. Valid values: ${Object.values(
      ListElementDestination,
    )}.`,
  })
  destination: ListElementDestination = ListElementDestination.Tail;
}
