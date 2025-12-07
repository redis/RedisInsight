import { UseSmallerKeysStrategy } from 'src/modules/database-recommendation/scanner/strategies';

describe('UseSmallerKeysStrategy', () => {
  let strategy: UseSmallerKeysStrategy;

  beforeEach(async () => {
    strategy = new UseSmallerKeysStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when database total less than 1_000_000', async () => {
      expect(await strategy.isRecommendationReached(1)).toEqual({
        isReached: false,
      });
    });

    it('should return false when database total more than 1_000_000', async () => {
      expect(await strategy.isRecommendationReached(1_000_001)).toEqual({
        isReached: true,
      });
    });
  });
});
