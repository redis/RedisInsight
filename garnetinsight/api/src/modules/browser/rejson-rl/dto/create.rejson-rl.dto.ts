import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { SerializedJsonValidator } from 'src/validators';

export class CreateRejsonRlDto extends KeyDto {
  @ApiProperty({
    description: 'Valid json string',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Validate(SerializedJsonValidator)
  data: string;
}
