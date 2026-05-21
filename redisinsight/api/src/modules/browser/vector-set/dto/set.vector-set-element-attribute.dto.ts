import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsJSON, IsString } from 'class-validator';
import { VectorSetElementKeyDto } from './vector-set-element-key.dto';

export class SetVectorSetElementAttributeDto extends VectorSetElementKeyDto {
  @ApiProperty({
    type: String,
    description:
      'Attributes JSON string to set on the element. Must be valid JSON.',
  })
  @IsDefined()
  @IsString()
  @IsJSON()
  attributes: string;
}
