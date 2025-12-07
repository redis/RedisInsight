import { Injectable } from '@nestjs/common';
import { RecommendationProvider } from 'src/modules/database-recommendation/scanner/recommendation.provider';
import { FeatureService } from 'src/modules/feature/feature.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class RecommendationScanner {
  constructor(
    private readonly recommendationProvider: RecommendationProvider,
    private readonly featureService: FeatureService,
  ) {}

  async determineRecommendation(
    sessionMetadata: SessionMetadata,
    name: string,
    data: any,
  ) {
    if (
      !(await this.featureService.isFeatureEnabled(
        sessionMetadata,
        KnownFeatures.InsightsRecommendations,
      ))
    ) {
      return null;
    }

    const strategy = this.recommendationProvider.getStrategy(name);
    try {
      const recommendation = await strategy.isRecommendationReached(data);

      if (recommendation.isReached) {
        return { name, params: recommendation?.params };
      }
    } catch (err) {
      // ignore errors
      return null;
    }

    return null;
  }
}
