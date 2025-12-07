import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';

export class PushListElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of elements in the list after current operation.',
  })
  total: number;
}
