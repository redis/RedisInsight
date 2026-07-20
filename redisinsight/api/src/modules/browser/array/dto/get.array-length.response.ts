import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class GetArrayLengthResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Logical length of the array (highest set index + 1, includes gaps). ' +
      'Unsigned 64-bit integer as string.',
    type: String,
    example: '7',
  })
  length: string;
}
