import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchLongTermMemoryDto {
  @ApiPropertyOptional({
    description: 'Text to search for (hybrid vector + keyword search)',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Scope results to a user id',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter to memories of any of these users (overrides userId)',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter to memories in any of these namespaces',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  namespaces?: string[];

  @ApiPropertyOptional({
    description:
      'Scope results to memories extracted from any of these sessions',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  sessionIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter to memories of any of these types',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  memoryTypes?: string[];

  @ApiPropertyOptional({
    description: 'Filter to memories tagged with any of these topics',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiPropertyOptional({
    description:
      'Minimum normalized cosine similarity for vector results (0-1)',
    type: Number,
  })
  @IsOptional()
  @Expose()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityThreshold?: number;
}
