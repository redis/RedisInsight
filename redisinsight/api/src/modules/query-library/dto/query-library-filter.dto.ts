import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryLibraryFilterDto {
  @ApiProperty({
    description: 'Filter by index name',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  indexName: string;

  @ApiPropertyOptional({
    description: 'Search by name, description, or query content',
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
