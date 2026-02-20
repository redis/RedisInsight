import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { SeedQueryLibraryItemDto } from './seed-query-library-item.dto';

export class SeedQueryLibraryDto {
  @ApiProperty({
    description: 'Array of sample queries to seed',
    type: () => SeedQueryLibraryItemDto,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SeedQueryLibraryItemDto)
  items: SeedQueryLibraryItemDto[];
}
