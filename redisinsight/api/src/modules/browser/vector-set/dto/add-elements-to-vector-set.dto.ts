import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { VectorSetElementDto } from './vector-set-element.dto';

export class AddElementsToVectorSetDto extends KeyDto {
  @ApiProperty({
    description: 'Vector set elements',
    isArray: true,
    type: VectorSetElementDto,
  })
  @IsDefined()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VectorSetElementDto)
  elements: VectorSetElementDto[];
}
