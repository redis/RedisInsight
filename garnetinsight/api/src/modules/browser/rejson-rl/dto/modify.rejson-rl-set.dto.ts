import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { SerializedJsonValidator } from 'src/validators';

export class ModifyRejsonRlSetDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Path of the json field',
  })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({
    description: 'Array of valid serialized jsons',
    type: String,
  })
  @Validate(SerializedJsonValidator)
  @IsNotEmpty()
  @IsString()
  data: string;
}
