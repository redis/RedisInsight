import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RecommendationVoteDto {
  @ApiProperty({
    description: 'Recommendation name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User vote',
    type: String,
  })
  @IsString()
  vote: string;
}
