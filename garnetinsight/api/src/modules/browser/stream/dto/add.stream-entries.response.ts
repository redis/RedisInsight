import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';

export class AddStreamEntriesResponse extends KeyResponse {
  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
  })
  entries: string[];
}
