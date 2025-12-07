import { ApiProperty } from '@nestjs/swagger';

export class DeleteDatabaseRecommendationResponse {
  @ApiProperty({
    description: 'Number of affected recommendations',
    type: Number,
  })
  affected: number;
}
