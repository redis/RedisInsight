import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';
import { getUTF8FromBuffer } from 'src/utils/cli-helper';
import { checkTimestamp } from 'src/utils';

export class RTSStrategy extends AbstractRecommendationStrategy {
  /**
   * Check rts recommendation
   * @param data
   */

  async isRecommendationReached(
    data,
  ): Promise<IDatabaseRecommendationStrategyData> {
    const timestampMemberNames = data?.members.some(({ name }) =>
      checkTimestamp(getUTF8FromBuffer(name as Buffer)),
    );
    const timestampMemberScores = data?.members.some(({ score }) =>
      checkTimestamp(String(score)),
    );

    return timestampMemberNames || timestampMemberScores
      ? { isReached: true, params: { keys: [data?.keyName] } }
      : { isReached: false };
  }
}
