import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class DeleteListElementsResponse {
  @ApiProperty({
    type: String,
    isArray: true,
    description: 'Removed elements from list',
  })
  @RedisStringType({ each: true })
  elements: RedisString[];
}
