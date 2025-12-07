import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';

export class DeleteDatabaseRecommendationDto {
  @ApiProperty({
    description: 'The unique IDs of the database recommendation requested',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  ids: string[];
}
