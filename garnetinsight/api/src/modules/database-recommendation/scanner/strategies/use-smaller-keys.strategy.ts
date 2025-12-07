import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { USE_SMALLER_KEYS_RECOMMENDATION_TOTAL } from 'src/common/constants';

export class UseSmallerKeysStrategy extends AbstractRecommendationStrategy {
  /**
   * Check use smaller keys recommendation
   * @param total
   */

  async isRecommendationReached(
    total: number,
  ): Promise<IDatabaseRecommendationStrategyData> {
    return { isReached: total > USE_SMALLER_KEYS_RECOMMENDATION_TOTAL };
  }
}
