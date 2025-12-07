import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';

export class DatabaseRecommendationsResponse {
  @ApiProperty({
    type: () => DatabaseRecommendation,
    example: [{ name: 'bigSet', read: false }],
    isArray: true,
    description: 'Ordered recommendations list',
  })
  @Type(() => DatabaseRecommendation)
  @Expose()
  recommendations: DatabaseRecommendation[];

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Number of unread recommendations',
  })
  @Expose()
  totalUnread: number;
}
