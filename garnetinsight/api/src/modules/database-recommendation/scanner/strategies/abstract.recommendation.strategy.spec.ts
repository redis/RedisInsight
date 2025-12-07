import { DefaultRecommendationStrategy } from 'src/modules/database-recommendation/scanner/strategies';

describe('AbstractRecommendationStrategy', () => {
  const strategy = new DefaultRecommendationStrategy();

  describe('isRecommendationReached', () => {
    it('should get is recommendation reached', async () => {
      expect(await strategy.isRecommendationReached()).toEqual({
        isReached: false,
      });
    });
  });
});
