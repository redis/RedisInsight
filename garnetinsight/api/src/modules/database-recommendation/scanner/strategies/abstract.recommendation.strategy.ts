import {
  IRecommendationStrategy,
  IDatabaseRecommendationStrategyData,
} from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { RedisClient } from 'src/modules/redis/client';

export abstract class AbstractRecommendationStrategy
  implements IRecommendationStrategy
{
  abstract isRecommendationReached(
    data: any,
    client?: RedisClient,
  ): Promise<IDatabaseRecommendationStrategyData>;
}
