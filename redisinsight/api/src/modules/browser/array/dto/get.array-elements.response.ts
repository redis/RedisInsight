import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RedisString } from 'src/common/constants';
import { RedisStringType } from 'src/common/decorators';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class ArrayElementResponse {
  @ApiProperty({
    description: 'Array element index.',
    type: String,
  })
  index: string;

  @ApiProperty({
    description: 'Array element value.',
    type: String,
  })
  @RedisStringType()
  value: RedisString;
}

export class GetArrayElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of populated elements in the array.',
  })
  total: number;

  @ApiPropertyOptional({
    type: String,
    description: 'The logical array length (highest index + 1).',
  })
  logicalLength?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The next index to use for fetching the next page.',
  })
  nextIndex?: string;

  @ApiProperty({
    type: Boolean,
    description: 'True because ARSCAN supports index-range pagination.',
  })
  isPaginationSupported: boolean;

  @ApiProperty({
    description: 'Array of populated array elements.',
    isArray: true,
    type: ArrayElementResponse,
  })
  @Type(() => ArrayElementResponse)
  elements: ArrayElementResponse[];
}
