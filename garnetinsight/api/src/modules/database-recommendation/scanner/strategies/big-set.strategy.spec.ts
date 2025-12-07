import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { BigSetStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockSetInfo: GetKeyInfoResponse = {
  name: Buffer.from('string1'),
  type: 'set',
  ttl: -1,
  size: 1,
  length: 1_000,
};

const mockBigSetInfo: GetKeyInfoResponse = {
  name: Buffer.from('string2'),
  type: 'set',
  ttl: -1,
  size: 1,
  length: 1_001,
};

const mockHashInfo: GetKeyInfoResponse = {
  name: Buffer.from('string3'),
  type: 'hash',
  ttl: -1,
  size: 1,
  length: 100_001,
};

describe('BigSetStrategy', () => {
  let strategy: BigSetStrategy;

  beforeEach(async () => {
    strategy = new BigSetStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when set length < 1 000', async () => {
      expect(await strategy.isRecommendationReached(mockSetInfo)).toEqual({
        isReached: false,
      });
    });

    it('should return false when not set key', async () => {
      expect(await strategy.isRecommendationReached(mockHashInfo)).toEqual({
        isReached: false,
      });
    });

    it('should return true when set length > 1 000', async () => {
      expect(await strategy.isRecommendationReached(mockBigSetInfo)).toEqual({
        isReached: true,
        params: { keys: [mockBigSetInfo.name] },
      });
    });
  });
});
