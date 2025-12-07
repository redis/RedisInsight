import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { BIG_HASHES_RECOMMENDATION_LENGTH } from 'src/common/constants';

export class ShardHashStrategy extends AbstractRecommendationStrategy {
  /**
   * Check shard big hashes to small hashes recommendation
   * @param data
   */

  async isRecommendationReached(
    data,
  ): Promise<IDatabaseRecommendationStrategyData> {
    return data.total > BIG_HASHES_RECOMMENDATION_LENGTH
      ? { isReached: true, params: { keys: [data.keyName] } }
      : { isReached: false };
  }
}
