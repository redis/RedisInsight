import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndexConstraint } from './array-index.validation';

export class ArrayRangeDto {
  @ApiProperty({
    description: 'Inclusive range start index.',
    type: String,
  })
  @IsDefined()
  @Validate(IsArrayIndexConstraint)
  start: string;

  @ApiProperty({
    description: 'Inclusive range end index.',
    type: String,
  })
  @IsDefined()
  @Validate(IsArrayIndexConstraint)
  end: string;
}

export class DeleteArrayRangesDto extends KeyDto {
  @ApiProperty({
    description: 'Array index ranges to remove.',
    isArray: true,
    type: ArrayRangeDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ArrayRangeDto)
  ranges: ArrayRangeDto[];
}
