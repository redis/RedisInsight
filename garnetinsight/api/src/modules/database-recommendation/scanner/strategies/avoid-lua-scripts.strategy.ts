import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { LUA_SCRIPT_RECOMMENDATION_COUNT } from 'src/common/constants';

export class AvoidLuaScriptsStrategy extends AbstractRecommendationStrategy {
  /**
   * Check lua script recommendation
   * @param info
   */

  async isRecommendationReached(
    info: RedisDatabaseInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    return { isReached: info.cashedScripts > LUA_SCRIPT_RECOMMENDATION_COUNT };
  }
}
