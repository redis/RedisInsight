import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndex } from 'src/common/decorators';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetArrayScanDto extends KeyDto {
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
      'When start > end, pairs are returned in reverse index order.',
    type: String,
    example: '99',
  })
  @IsArrayIndex()
  end: string;

  @ApiPropertyOptional({
    description:
      'Maximum number of populated elements to return. ' +
      'Maps to the ARSCAN LIMIT option.',
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
