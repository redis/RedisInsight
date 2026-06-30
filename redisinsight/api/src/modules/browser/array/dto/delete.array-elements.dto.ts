import { ApiProperty } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndex } from 'src/common/decorators';
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';
import { ARRAY_RANGE_MAX_ELEMENTS } from 'src/modules/browser/array/constants';

export class DeleteArrayElementsDto extends KeyDto {
  @ApiProperty({
    description:
      'Indexes to delete (ARDEL). Each index is an unsigned 64-bit integer as ' +
      'string. Indexes pointing at an empty slot contribute 0 to the deleted ' +
      `count. At most ${ARRAY_RANGE_MAX_ELEMENTS.toLocaleString('en-US')} ` +
      'indexes per call — ARDEL is O(N) in the number of indexes, the same ' +
      'per-call cap as ARMGET.',
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
