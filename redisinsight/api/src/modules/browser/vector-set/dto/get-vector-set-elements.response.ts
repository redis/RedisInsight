import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class VectorSetElementResponse {
  @ApiProperty({
    description: 'Element name',
    type: String,
  })
  @RedisStringType()
  name: RedisString;
}

export class GetVectorSetElementsResponse extends KeyDto {
  @ApiProperty({
    description: 'Total number of elements in the vector set',
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Array of element names',
    type: () => VectorSetElementResponse,
    isArray: true,
  })
  elements: VectorSetElementResponse[];
}
