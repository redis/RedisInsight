import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { ArrayElementDto } from './array-element.dto';

export class AddArrayElementsDto extends KeyDto {
  @ApiProperty({
    description: 'Sparse array elements to set.',
    isArray: true,
    type: ArrayElementDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ArrayElementDto)
  elements: ArrayElementDto[];
}
