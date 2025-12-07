import { AvoidLogicalDatabasesStrategy } from 'src/modules/database-recommendation/scanner/strategies';

describe('AvoidLogicalDatabasesStrategy', () => {
  let strategy: AvoidLogicalDatabasesStrategy;

  beforeEach(async () => {
    strategy = new AvoidLogicalDatabasesStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when database index was not changed', async () => {
      expect(
        await strategy.isRecommendationReached({
          db: 2,
          prevDb: 2,
        }),
      ).toEqual({ isReached: false });
    });

    it('should return true when database index was changed', async () => {
      expect(
        await strategy.isRecommendationReached({
          db: 2,
          prevDb: 0,
        }),
      ).toEqual({ isReached: true });
    });
  });
});
