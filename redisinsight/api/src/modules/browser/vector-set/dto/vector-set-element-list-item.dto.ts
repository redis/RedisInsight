import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class VectorSetElementListItemDto {
  @ApiProperty({
    type: String,
    description: 'Vector set element name.',
  })
  @RedisStringType()
  name: RedisString;

  @ApiPropertyOptional({
    type: String,
    description:
      'Attributes string stored on the element (typically JSON). ' +
      'Omitted when the element has no attributes.',
  })
  attributes?: string;
}
