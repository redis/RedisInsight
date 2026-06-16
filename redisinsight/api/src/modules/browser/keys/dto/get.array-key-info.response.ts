import { ApiProperty, PickType } from '@nestjs/swagger';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto/get.keys-info.response';

/**
 * Key-info response for the Array data type.
 *
 * `length` (ARLEN) and `count` (ARCOUNT) are returned as decimal strings
 * because an Array's index space is unsigned 64-bit and can exceed
 * Number.MAX_SAFE_INTEGER for sparse keys. Consumers must narrow on the
 * `array` key type before reading these fields and avoid silent numeric
 * coercion that would round large values.
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
