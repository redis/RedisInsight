import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Key of the tag.',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-zA-Z0-9\-_\.@:+ ]+$/)
  key: string;

  @ApiProperty({
    description: 'Value of the tag.',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 128)
  @Matches(/^[a-zA-Z0-9\-_\.@:+ ]+$/)
  value: string;
}
