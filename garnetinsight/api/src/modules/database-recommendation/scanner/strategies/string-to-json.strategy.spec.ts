import { StringToJsonStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockKeyName = 'name';

describe('StringToJsonStrategy', () => {
  let strategy: StringToJsonStrategy;

  beforeEach(async () => {
    strategy = new StringToJsonStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when string value not object or array', async () => {
      expect(
        await strategy.isRecommendationReached({
          value: Buffer.from('value'),
          keyName: mockKeyName,
        }),
      ).toEqual({ isReached: false });
    });

    it('should return true when string value is object or array', async () => {
      expect(
        await strategy.isRecommendationReached({
          value: Buffer.from('[1,2]'),
          keyName: mockKeyName,
        }),
      ).toEqual({ isReached: true, params: { keys: [mockKeyName] } });
      expect(
        await strategy.isRecommendationReached({
          value: Buffer.from('{"foo": "bar"}'),
          keyName: mockKeyName,
        }),
      ).toEqual({ isReached: true, params: { keys: [mockKeyName] } });
    });
  });
});
