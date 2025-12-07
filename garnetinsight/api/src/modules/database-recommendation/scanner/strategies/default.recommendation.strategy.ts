import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';

export class DefaultRecommendationStrategy extends AbstractRecommendationStrategy {
  async isRecommendationReached(): Promise<IDatabaseRecommendationStrategyData> {
    return { isReached: false };
  }
}
