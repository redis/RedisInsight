import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HashFieldTtlDto } from 'src/modules/browser/hash/dto';

export class UpdateHashFieldsTtlDto extends KeyDto {
  @ApiProperty({
    description: 'Hash fields',
    isArray: true,
    type: HashFieldTtlDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => HashFieldTtlDto)
  fields: HashFieldTtlDto[];
}
