import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
import { VectorSetElementKeyDto } from './vector-set-element-key.dto';

export class SetVectorSetElementAttributeDto extends VectorSetElementKeyDto {
  @ApiProperty({
    type: String,
    description: 'Attributes string to set on the element.',
  })
  @IsDefined()
  @IsString()
  attributes: string;
}
