import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';

export class UploadCustomTutorialDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'ZIP archive with tutorial static files',
  })
  @IsOptional()
  @IsFile()
  @HasMimeType(['application/zip'])
  @MaxFileSize(10 * 1024 * 1024)
  file?: MemoryStoredFile;

  @ApiPropertyOptional({
    type: 'string',
    description: 'External link to zip archive',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  link?: string;
}
