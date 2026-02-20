import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryLibraryFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by index name',
    type: String,
  })
  @IsString()
  @IsOptional()
  indexName?: string;

  @ApiPropertyOptional({
    description: 'Search by name, description, or query content',
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
