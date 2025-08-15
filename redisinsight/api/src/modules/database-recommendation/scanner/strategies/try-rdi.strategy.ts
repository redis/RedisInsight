import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { RedisClientConnectionType } from 'src/modules/redis/client';

export class TryRdiStrategyStrategy extends AbstractRecommendationStrategy {
  /**
   * Check try rdi recommendation
   * @param data
   */

  async isRecommendationReached(data: {
    provider: HostingProvider;
    connectionType: RedisClientConnectionType;
  }): Promise<IDatabaseRecommendationStrategyData> {
    const isRedisSoftwareOrCluster =
      data.provider === HostingProvider.REDIS_SOFTWARE ||
      data.connectionType === RedisClientConnectionType.CLUSTER;

    return { isReached: isRedisSoftwareOrCluster };
  }
}
