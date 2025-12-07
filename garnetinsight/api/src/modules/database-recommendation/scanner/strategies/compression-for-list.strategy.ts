import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import {
  RedisDataType,
  GetKeyInfoResponse,
} from 'src/modules/browser/keys/dto';
import { COMPRESSION_FOR_LIST_RECOMMENDATION_LENGTH } from 'src/common/constants';

export class CompressionForListStrategy extends AbstractRecommendationStrategy {
  /**
   * Check compression for list recommendation
   * @param key
   */

  async isRecommendationReached(
    key: GetKeyInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    const isBigList =
      key.type === RedisDataType.List &&
      key.length > COMPRESSION_FOR_LIST_RECOMMENDATION_LENGTH;

    return isBigList
      ? { isReached: true, params: { keys: [key?.name] } }
      : { isReached: false };
  }
}
