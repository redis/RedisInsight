import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ImportAzureDatabaseDto } from './import-azure-database.dto';

export class ImportAzureDatabasesDto {
  @ApiProperty({
    description: 'Azure account ID (homeAccountId)',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'Azure databases list',
    type: ImportAzureDatabaseDto,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ImportAzureDatabaseDto)
  databases: ImportAzureDatabaseDto[];
}
