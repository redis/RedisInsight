import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ImportCloudDatabaseDto } from 'src/modules/cloud/autodiscovery/dto/import-cloud-database.dto';

export class ImportCloudDatabasesDto {
  @ApiProperty({
    description: 'Cloud databases list.',
    type: ImportCloudDatabaseDto,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ImportCloudDatabaseDto)
  databases: ImportCloudDatabaseDto[];
}
