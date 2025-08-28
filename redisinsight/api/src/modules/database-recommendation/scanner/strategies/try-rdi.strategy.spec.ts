import { TryRdiStrategyStrategy } from 'src/modules/database-recommendation/scanner/strategies';
import { RedisClientConnectionType } from 'src/modules/redis/client';
import { HostingProvider } from 'src/modules/database/entities/database.entity';

const mockClusterConnectionType = RedisClientConnectionType.CLUSTER;
const mockNotClusterConnectionType = RedisClientConnectionType.STANDALONE;

const mockREProvider = HostingProvider.REDIS_SOFTWARE;
const mockNotREProvider = HostingProvider.REDIS_CLOUD;

describe('TryRdiStrategyStrategy', () => {
  let strategy: TryRdiStrategyStrategy;

  beforeEach(async () => {
    strategy = new TryRdiStrategyStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return true when connectionType is cluster', async () => {
      expect(
        await strategy.isRecommendationReached({
          connectionType: mockClusterConnectionType,
          provider: mockNotREProvider,
        }),
      ).toEqual({ isReached: true });
    });

    it('should return true when provider is Redis Enterprise', async () => {
      expect(
        await strategy.isRecommendationReached({
          connectionType: mockNotClusterConnectionType,
          provider: mockREProvider,
        }),
      ).toEqual({ isReached: true });
    });

    it('should return true when provider is Redis Enterprise and connectionType is cluster', async () => {
      expect(
        await strategy.isRecommendationReached({
          connectionType: mockClusterConnectionType,
          provider: mockREProvider,
        }),
      ).toEqual({ isReached: true });
    });

    it('should return false when provider is not Redis Enterprise and connectionType is not cluster', async () => {
      expect(
        await strategy.isRecommendationReached({
          connectionType: mockNotClusterConnectionType,
          provider: mockNotREProvider,
        }),
      ).toEqual({ isReached: false });
    });
  });
});
