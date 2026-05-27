import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { AddArrayElementDto } from './add.array-element.dto';

export class AddElementsToArrayDto extends KeyDto {
  @ApiProperty({
    description:
      'Array elements to add. Each element specifies an index and value.',
    isArray: true,
    type: AddArrayElementDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddArrayElementDto)
  elements: AddArrayElementDto[];
}
