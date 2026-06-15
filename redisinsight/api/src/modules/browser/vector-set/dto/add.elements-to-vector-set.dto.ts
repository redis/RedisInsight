import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { AddVectorSetElementDto } from './add.vector-set-element.dto';

export class AddElementsToVectorSetDto extends KeyDto {
  @ApiProperty({
    description: 'Vector set elements to add.',
    isArray: true,
    type: AddVectorSetElementDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => AddVectorSetElementDto)
  elements: AddVectorSetElementDto[];
}
