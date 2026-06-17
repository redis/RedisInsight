import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class GetArrayCountResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Count of populated (non-empty) elements. Unsigned 64-bit integer as string.',
    type: String,
    example: '5',
  })
  count: string;
}
