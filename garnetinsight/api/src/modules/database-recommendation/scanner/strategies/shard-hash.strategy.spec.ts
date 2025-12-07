import { ShardHashStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockKeyName = 'name';

describe('ShardHashStrategy', () => {
  let strategy: ShardHashStrategy;

  beforeEach(async () => {
    strategy = new ShardHashStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when hash length < 5_000', async () => {
      expect(
        await strategy.isRecommendationReached({
          total: 5_000,
          keyName: mockKeyName,
        }),
      ).toEqual({ isReached: false });
    });

    it('should return true when hash length > 5_000', async () => {
      expect(
        await strategy.isRecommendationReached({
          total: 5_001,
          keyName: mockKeyName,
        }),
      ).toEqual({ isReached: true, params: { keys: [mockKeyName] } });
    });
  });
});
