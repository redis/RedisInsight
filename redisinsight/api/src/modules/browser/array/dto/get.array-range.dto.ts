import { ApiProperty } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndex } from 'src/common/decorators';

export class GetArrayRangeDto extends KeyDto {
  @ApiProperty({
    description:
      'Start index of the range (inclusive). Unsigned 64-bit integer as string.',
    type: String,
    example: '0',
  })
  @IsArrayIndex()
  start: string;

  @ApiProperty({
    description:
      'End index of the range (inclusive). Unsigned 64-bit integer as string. ' +
      'Must be greater than or equal to start.',
    type: String,
    example: '99',
  })
  @IsArrayIndex()
  end: string;
}
