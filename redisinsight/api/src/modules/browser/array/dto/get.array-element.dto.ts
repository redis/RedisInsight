import { ApiProperty } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndex } from 'src/common/decorators';

export class GetArrayElementDto extends KeyDto {
  @ApiProperty({
    description:
      'Index of the element to read. Unsigned 64-bit integer as string.',
    type: String,
    example: '42',
  })
  @IsArrayIndex()
  index: string;
}
