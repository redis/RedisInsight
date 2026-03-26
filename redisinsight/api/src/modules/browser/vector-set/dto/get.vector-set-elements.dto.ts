import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetVectorSetElementsDto extends KeyDto {
  @ApiPropertyOptional({
    description:
      'Specifying the starting element for lexicographical range. ' +
      'Use "-" for the minimum (start from beginning).',
    type: String,
    default: '-',
  })
  @IsOptional()
  @IsString()
  start?: string = '-';

  @ApiPropertyOptional({
    description:
      'Specifying the ending element for lexicographical range. ' +
      'Use "+" for the maximum (end at last element).',
    type: String,
    default: '+',
  })
  @IsOptional()
  @IsString()
  end?: string = '+';

  @ApiProperty({
    description: 'Specifying the number of elements to return.',
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  count: number;
}
