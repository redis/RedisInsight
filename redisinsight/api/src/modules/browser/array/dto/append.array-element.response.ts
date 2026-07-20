import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class AppendArrayElementResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Index the value was appended at (the array length before the append). ' +
      'Unsigned 64-bit integer as string.',
    type: String,
    example: '7',
  })
  index: string;
}
