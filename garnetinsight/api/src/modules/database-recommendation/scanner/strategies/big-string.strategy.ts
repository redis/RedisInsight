import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import {
  RedisDataType,
  GetKeyInfoResponse,
} from 'src/modules/browser/keys/dto';
import { BIG_STRINGS_RECOMMENDATION_MEMORY } from 'src/common/constants';

export class BigStringStrategy extends AbstractRecommendationStrategy {
  /**
   * Check big strings recommendation
   * @param key
   */

  async isRecommendationReached(
    key: GetKeyInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    const isBigString =
      key.type === RedisDataType.String &&
      key.size > BIG_STRINGS_RECOMMENDATION_MEMORY;

    return isBigString
      ? { isReached: true, params: { keys: [key?.name] } }
      : { isReached: false };
  }
}
