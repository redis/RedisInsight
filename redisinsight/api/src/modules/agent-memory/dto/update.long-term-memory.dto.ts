import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateLongTermMemoryDto {
  @ApiPropertyOptional({ description: 'Updated memory text', type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @Length(1, 50000)
  text?: string;

  @ApiPropertyOptional({ description: 'Updated memory type', type: String })
  @IsOptional()
  @Expose()
  @IsString()
  memoryType?: string;

  @ApiPropertyOptional({
    description: 'Updated topic tags',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @Length(1, 100, { each: true })
  topics?: string[];

  @ApiPropertyOptional({
    description: 'Updated namespace (empty string clears it)',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  @Length(0, 64)
  namespace?: string;

  @ApiPropertyOptional({ description: 'Updated owner (user) id', type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @Length(1, 64)
  userId?: string;

  @ApiPropertyOptional({
    description: 'Updated session id (empty string clears it)',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  @Length(0, 64)
  sessionId?: string;
}
