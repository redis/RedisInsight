import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import * as semverCompare from 'node-version-compare';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { REDIS_VERSION_RECOMMENDATION_VERSION } from 'src/common/constants';

export class RedisVersionStrategy extends AbstractRecommendationStrategy {
  /**
   * Check redis version recommendation
   * @param info
   */
  async isRecommendationReached(
    info: RedisDatabaseInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    return {
      isReached:
        semverCompare(info.version, REDIS_VERSION_RECOMMENDATION_VERSION) < 0,
    };
  }
}
