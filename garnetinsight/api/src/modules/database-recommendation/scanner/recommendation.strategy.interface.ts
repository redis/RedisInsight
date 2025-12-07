import { DatabaseRecommendationParams } from 'src/modules/database-recommendation/models';

export interface IDatabaseRecommendationStrategyData {
  isReached: boolean;
  params?: DatabaseRecommendationParams;
}
export interface IRecommendationStrategy {
  isRecommendationReached(
    data: any,
  ): Promise<IDatabaseRecommendationStrategyData>;
}
