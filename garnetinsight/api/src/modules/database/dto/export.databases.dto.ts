import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExportDatabasesDto {
  @ApiProperty({
    description: 'The unique IDs of the databases requested',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  ids: string[] = [];

  @ApiPropertyOptional({
    description: 'Export passwords and certificate bodies',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  withSecrets?: boolean = false;
}
