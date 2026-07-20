import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AZURE_TENANT_ID_REGEX } from '../../constants';
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

  @ApiPropertyOptional({
    description:
      'Azure tenant (GUID or domain) the databases were discovered under. ' +
      'Used so tokens are acquired against the correct tenant.',
    type: String,
  })
  @IsOptional()
  @Matches(AZURE_TENANT_ID_REGEX, {
    message: 'tenantId must be a valid GUID or domain.',
  })
  tenantId?: string;
}
