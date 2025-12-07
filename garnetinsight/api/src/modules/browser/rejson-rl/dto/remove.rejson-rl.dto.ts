import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveRejsonRlDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Path of the json field',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}
