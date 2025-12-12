import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class UpdateVectorSetElementAttributesDto extends KeyDto {
  @ApiProperty({
    description: 'Element name',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  element: string;

  @ApiProperty({
    description: 'JSON attributes to set (empty object to clear)',
    type: Object,
  })
  @IsDefined()
  @IsObject()
  attributes: Record<string, any>;
}
