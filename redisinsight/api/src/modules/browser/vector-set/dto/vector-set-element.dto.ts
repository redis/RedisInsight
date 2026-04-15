import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class VectorSetElementDto {
  @ApiProperty({
    type: String,
    description: 'Element name value.',
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiPropertyOptional({
    description: 'Vector embedding values.',
    type: [Number],
    isArray: true,
  })
  vector?: number[];

  @ApiPropertyOptional({
    description: 'JSON attributes associated with the element.',
    type: String,
  })
  attributes?: string;
}
