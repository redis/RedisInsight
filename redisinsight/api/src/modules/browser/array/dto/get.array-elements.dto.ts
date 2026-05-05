import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';
import {
  ARRAY_MAX_INDEX,
  IsArrayIndexConstraint,
} from './array-index.validation';

export class GetArrayElementsDto extends KeyDto {
  @ApiPropertyOptional({
    description: 'Inclusive start index for ARSCAN.',
    type: String,
    default: '0',
  })
  @IsOptional()
  @Validate(IsArrayIndexConstraint)
  start?: string = '0';

  @ApiPropertyOptional({
    description: 'Inclusive end index for ARSCAN.',
    type: String,
    default: ARRAY_MAX_INDEX,
  })
  @IsOptional()
  @Validate(IsArrayIndexConstraint)
  end?: string = ARRAY_MAX_INDEX;

  @ApiProperty({
    description: 'Maximum number of populated elements to return.',
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  count: number;
}
