import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { HashFieldDto } from 'src/modules/browser/hash/dto';

export class HashScanResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    minimum: 0,
    description:
      'The new cursor to use in the next call.' +
      ' If the property has value of 0, then the iteration is completed.',
  })
  nextCursor: number;

  @ApiProperty({
    type: () => HashFieldDto,
    description: 'Array of members.',
    isArray: true,
  })
  fields: HashFieldDto[];
}

export class GetHashFieldsResponse extends HashScanResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of fields in the currently-selected hash.',
  })
  total: number;
}
