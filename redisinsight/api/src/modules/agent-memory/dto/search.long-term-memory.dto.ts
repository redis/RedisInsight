import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

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
    description:
      'Filter to memories in any of these namespaces (overrides namespace)',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  namespaces?: string[];

  @ApiPropertyOptional({
    description: 'Scope results to a namespace',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  namespace?: string;

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
    description: 'Filter to memories tagged with any of these entities',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  entities?: string[];

  @ApiPropertyOptional({
    description: 'Let the server LLM-rewrite the query before searching',
    type: Boolean,
  })
  @IsOptional()
  @Expose()
  @IsBoolean()
  optimizeQuery?: boolean;
}
