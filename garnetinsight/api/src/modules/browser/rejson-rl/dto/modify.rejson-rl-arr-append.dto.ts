import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, Validate } from 'class-validator';
import { SerializedJsonValidator } from 'src/validators';

export class ModifyRejsonRlArrAppendDto extends KeyDto {
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
    isArray: true,
  })
  @IsArray()
  @Validate(SerializedJsonValidator, {
    each: true,
  })
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  data: string[];
}
