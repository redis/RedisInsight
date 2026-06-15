import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class GetArrayNextIndexResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Next index that ARINSERT would use. Unsigned 64-bit integer as string. ' +
      'Null when the array is exhausted and no further insertion is possible.',
    type: String,
    example: '7',
    nullable: true,
  })
  index: string | null;
}
