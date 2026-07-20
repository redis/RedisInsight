import { ApiProperty } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndex } from 'src/common/decorators';

export class DeleteArrayRangeDto extends KeyDto {
  @ApiProperty({
    description:
      'Start index of the range to delete (inclusive). Unsigned 64-bit integer ' +
      'as string.',
    type: String,
    example: '0',
  })
  @IsArrayIndex()
  start: string;

  @ApiProperty({
    description:
      'End index of the range to delete (inclusive). Unsigned 64-bit integer as ' +
      'string. A reversed range (start > end) is valid and deletes the same ' +
      'inclusive window.',
    type: String,
    example: '99',
  })
  @IsArrayIndex()
  end: string;
}
