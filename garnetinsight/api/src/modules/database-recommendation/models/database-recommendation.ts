import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { DatabaseRecommendationParams } from 'src/modules/database-recommendation/models';

export enum Vote {
  DoubleLike = 'very useful',
  Like = 'useful',
  Dislike = 'not useful',
}

export class DatabaseRecommendation {
  @ApiProperty({
    description: 'Recommendation id',
    type: String,
    example: 'id',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Recommendation name',
    type: String,
    example: 'luaScript',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Database ID to which recommendation belongs',
    type: String,
  })
  @Expose()
  databaseId: string;

  @ApiPropertyOptional({
    description: 'Determines if recommendation was shown to user',
    type: Boolean,
    example: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean({ always: true })
  read?: boolean;

  @ApiPropertyOptional({
    description: 'Should this recommendation shown to user',
    type: Boolean,
    example: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @ApiPropertyOptional({
    description: 'Recommendation vote',
    default: Vote.Like,
    enum: Vote,
  })
  @IsEnum(Vote)
  @IsOptional()
  @Expose()
  vote?: Vote = null;

  @ApiPropertyOptional({
    description: 'Should this recommendation hidden',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Expose()
  hide?: boolean;

  @ApiPropertyOptional({
    description: 'Additional recommendation params',
    type: Object,
  })
  @IsOptional()
  @Expose()
  params?: DatabaseRecommendationParams;
}
