import { ApiProperty, PickType } from '@nestjs/swagger';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto/get.keys-info.response';

/**
 * Key-info response for the Array data type. `length` (ARLEN) and `count`
 * (ARCOUNT) are decimal strings because the u64 index space exceeds
 * Number.MAX_SAFE_INTEGER.
 */
export class GetArrayKeyInfoResponse extends PickType(GetKeyInfoResponse, [
  'name',
  'type',
  'ttl',
  'size',
] as const) {
  @ApiProperty({
    type: String,
    description:
      'Logical length of the array (highest set index + 1, includes gaps).' +
      ' Unsigned 64-bit integer as a decimal string.',
    example: '7',
  })
  length: string;

  @ApiProperty({
    type: String,
    description:
      'Populated element count (excludes empty slots, ARCOUNT).' +
      ' Unsigned 64-bit integer as a decimal string.',
    example: '5',
  })
  count: string;
}
