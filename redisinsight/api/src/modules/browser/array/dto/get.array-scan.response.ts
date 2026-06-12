import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { Type } from 'class-transformer';

export class ArrayElement {
  @ApiProperty({
    description:
      'Index of the populated element. Unsigned 64-bit integer as string.',
    type: String,
  })
  index: string;

  @ApiProperty({
    description: 'Value stored at this index.',
    type: String,
  })
  @RedisStringType()
  value: RedisString;
}

export class GetArrayScanResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Populated elements within the requested range. Empty slots are skipped.',
    type: () => ArrayElement,
    isArray: true,
  })
  @Type(() => ArrayElement)
  elements: ArrayElement[];
}
