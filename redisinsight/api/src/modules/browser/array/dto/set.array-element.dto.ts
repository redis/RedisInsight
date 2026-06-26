import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import {
  ApiRedisString,
  IsArrayIndex,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

/**
 * Sets a single element at an explicit index (ARSET key index value). Index
 * stays a numeric string per the unsigned-64-bit contract.
 */
export class SetArrayElementDto extends KeyDto {
  @ApiProperty({
    description:
      'Index of the element to set. Unsigned 64-bit integer as string.',
    type: String,
    example: '42',
  })
  @IsArrayIndex()
  index: string;

  @ApiRedisString('Value to store at the index')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
