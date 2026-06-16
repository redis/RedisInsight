import { ApiProperty } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndex } from 'src/common/decorators';
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';
import { ARRAY_RANGE_MAX_ELEMENTS } from 'src/modules/browser/array/constants';

export class GetArrayMultiElementsDto extends KeyDto {
  @ApiProperty({
    description:
      'Indexes to read. Each index is an unsigned 64-bit integer as string. ' +
      `At most ${ARRAY_RANGE_MAX_ELEMENTS.toLocaleString('en-US')} indexes ` +
      'per call — ARMGET is O(N) in the number of indexes, so the same ' +
      'per-call cap as ARGETRANGE/ARSCAN applies.',
    type: String,
    isArray: true,
    example: ['0', '5', '42'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(ARRAY_RANGE_MAX_ELEMENTS)
  @IsArrayIndex({ each: true })
  indexes: string[];
}
