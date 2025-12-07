import { AvoidLuaScriptsStrategy } from 'src/modules/database-recommendation/scanner/strategies';

describe('AvoidLuaScriptsStrategy', () => {
  let strategy: AvoidLuaScriptsStrategy;

  beforeEach(() => {
    strategy = new AvoidLuaScriptsStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when number_of_cached_scripts less then 10', async () => {
      expect(
        await strategy.isRecommendationReached({
          version: '1',
          cashedScripts: 1,
        }),
      ).toEqual({ isReached: false });
    });

    it('should return true when number_of_cached_scripts more then 10', async () => {
      expect(
        await strategy.isRecommendationReached({
          version: '1',
          cashedScripts: 11,
        }),
      ).toEqual({ isReached: true });
    });
  });
});
