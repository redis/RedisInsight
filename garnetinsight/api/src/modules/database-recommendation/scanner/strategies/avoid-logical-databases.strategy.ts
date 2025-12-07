import { AbstractRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies/abstract.recommendation.strategy';
import { IDatabaseRecommendationStrategyData } from 'src/modules/database-recommendation/scanner/recommendation.strategy.interface';

export class AvoidLogicalDatabasesStrategy extends AbstractRecommendationStrategy {
  /**
   * Check avoid use logical databases recommendation
   * @param databases
   */

  async isRecommendationReached({
    prevDb,
    db,
  }: {
    prevDb: number;
    db: number;
  }): Promise<IDatabaseRecommendationStrategyData> {
    return { isReached: prevDb !== db };
  }
}
