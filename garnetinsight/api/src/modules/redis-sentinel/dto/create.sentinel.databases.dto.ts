import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { CreateSentinelDatabaseDto } from 'src/modules/redis-sentinel/dto/create.sentinel.database.dto';

export class CreateSentinelDatabasesDto extends OmitType(CreateDatabaseDto, [
  'name',
] as const) {
  @ApiProperty({
    description: 'The Sentinel master group list.',
    type: CreateSentinelDatabaseDto,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CreateSentinelDatabaseDto)
  masters: CreateSentinelDatabaseDto[];
}
