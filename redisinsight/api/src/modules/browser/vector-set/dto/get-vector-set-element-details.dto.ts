import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class GetVectorSetElementDetailsDto extends KeyDto {
  @ApiProperty({
    description: 'Element name',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  element: string;
}
