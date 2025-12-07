import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HashFieldDto } from 'src/modules/browser/hash/dto';

export class AddFieldsToHashDto extends KeyDto {
  @ApiProperty({
    description: 'Hash fields',
    isArray: true,
    type: HashFieldDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => HashFieldDto)
  fields: HashFieldDto[];
}
