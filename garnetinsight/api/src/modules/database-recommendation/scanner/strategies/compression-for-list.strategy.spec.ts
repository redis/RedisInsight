import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { CompressionForListStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockListInfo: GetKeyInfoResponse = {
  name: Buffer.from('string1'),
  type: 'list',
  ttl: -1,
  size: 1,
  length: 100,
};

const mockBigListInfo: GetKeyInfoResponse = {
  name: Buffer.from('string2'),
  type: 'list',
  ttl: -1,
  size: 5_100_000,
  length: 1_001,
};

const mockHashInfo: GetKeyInfoResponse = {
  name: Buffer.from('string3'),
  type: 'hash',
  ttl: -1,
  size: 1,
  length: 100_001,
};

describe('CompressionForListStrategy', () => {
  let strategy: CompressionForListStrategy;

  beforeEach(async () => {
    strategy = new CompressionForListStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when list length < 1 000', async () => {
      expect(await strategy.isRecommendationReached(mockListInfo)).toEqual({
        isReached: false,
      });
    });

    it('should return true when list length > 1 000', async () => {
      expect(await strategy.isRecommendationReached(mockBigListInfo)).toEqual({
        isReached: true,
        params: { keys: [mockBigListInfo.name] },
      });
    });

    it('should return false when not list key', async () => {
      expect(await strategy.isRecommendationReached(mockHashInfo)).toEqual({
        isReached: false,
      });
    });
  });
});
