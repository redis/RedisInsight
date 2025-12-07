import { maxBy } from 'lodash';
import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { BIG_AMOUNT_OF_CONNECTED_CLIENTS_RECOMMENDATION_CLIENTS } from 'src/common/constants';

export class BigAmountConnectedClientsStrategy extends AbstractRecommendationStrategy {
  /**
   * Check big amount of connected clients recommendation
   * @param info
   */

  async isRecommendationReached(
    info: RedisDatabaseInfoResponse,
  ): Promise<IDatabaseRecommendationStrategyData> {
    const nodeInfo = info.nodes?.length
      ? maxBy(info.nodes, 'connectedClients')
      : info;
    return {
      isReached:
        nodeInfo?.connectedClients >
        BIG_AMOUNT_OF_CONNECTED_CLIENTS_RECOMMENDATION_CLIENTS,
    };
  }
}
