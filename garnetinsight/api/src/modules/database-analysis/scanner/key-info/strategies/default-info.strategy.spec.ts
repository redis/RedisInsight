import { DefaultInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/default-info.strategy';

describe('DefaultInfoStrategy', () => {
  const strategy = new DefaultInfoStrategy();

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength()).toEqual(null);
    });
  });
});
