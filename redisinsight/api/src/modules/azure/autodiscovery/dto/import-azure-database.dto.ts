import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AzureAuthType } from '../../constants';

export class ImportAzureDatabaseDto {
  @ApiProperty({
    description: 'Azure resource ID of the database',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiPropertyOptional({
    description: 'Authentication type (defaults to Entra ID)',
    enum: AzureAuthType,
    enumName: 'AzureAuthType',
    default: AzureAuthType.EntraId,
  })
  @IsOptional()
  @IsEnum(AzureAuthType)
  authType?: AzureAuthType;
}
