import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { QueryLibraryType } from './query-library-type.enum';

export class QueryLibraryItem {
  @ApiProperty({
    description: 'Query library item id',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Database id',
    type: String,
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Index name the query is associated with',
    type: String,
    example: 'idx:bikes_vss',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  indexName: string;

  @ApiProperty({
    description: 'Query type',
    enum: QueryLibraryType,
  })
  @IsEnum(QueryLibraryType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      QueryLibraryType,
    )}.`,
  })
  @Expose()
  type: QueryLibraryType;

  @ApiProperty({
    description: 'Display name for the query',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the query',
    type: String,
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'The query string',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  query: string;

  @ApiProperty({
    description: 'Date of creation',
    type: Date,
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Date of last update',
    type: Date,
  })
  @Expose()
  updatedAt: Date;
}
