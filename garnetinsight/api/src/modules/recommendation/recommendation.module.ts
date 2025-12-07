import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationProvider } from './providers/recommendation.provider';

@Module({
  providers: [RecommendationService, RecommendationProvider],
  exports: [RecommendationService],
})
export class RecommendationModule {}
