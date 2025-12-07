import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { BigStringStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockStringInfo: GetKeyInfoResponse = {
  name: Buffer.from('string1'),
  type: 'string',
  ttl: -1,
  size: 1,
  length: 100_000,
};

const mockBigStringInfo: GetKeyInfoResponse = {
  name: Buffer.from('string2'),
  type: 'string',
  ttl: -1,
  size: 5_100_000,
  length: 100_001,
};

const mockHashInfo: GetKeyInfoResponse = {
  name: Buffer.from('string3'),
  type: 'hash',
  ttl: -1,
  size: 1,
  length: 100_001,
};

describe('BigStringStrategy', () => {
  let strategy: BigStringStrategy;

  beforeEach(async () => {
    strategy = new BigStringStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when string size < 5 000 000', async () => {
      expect(await strategy.isRecommendationReached(mockStringInfo)).toEqual({
        isReached: false,
      });
    });

    it('should return true when string size > 5 000 000', async () => {
      expect(await strategy.isRecommendationReached(mockBigStringInfo)).toEqual(
        { isReached: true, params: { keys: [mockBigStringInfo.name] } },
      );
    });

    it('should return false when not string key', async () => {
      expect(await strategy.isRecommendationReached(mockHashInfo)).toEqual({
        isReached: false,
      });
    });
  });
});
