import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import {
  RedisDataType,
  GetKeyInfoResponse,
} from 'src/modules/browser/keys/dto';
import { BIG_SETS_RECOMMENDATION_LENGTH } from 'src/common/constants';

export class BigSetStrategy extends AbstractRecommendationStrategy {
  /**
   * Check big set recommendation
   * @param key
   */

  async isRecommendationReached(
    key: GetKeyInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    return key?.type === RedisDataType.Set &&
      key?.length > BIG_SETS_RECOMMENDATION_LENGTH
      ? { isReached: true, params: { keys: [key?.name] } }
      : { isReached: false };
  }
}
