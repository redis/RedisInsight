import { mockDatabase } from 'src/__mocks__';
import { DefaultCredentialStrategy } from './default.credential-strategy';

describe('DefaultCredentialStrategy', () => {
  let strategy: DefaultCredentialStrategy;

  beforeEach(() => {
    strategy = new DefaultCredentialStrategy();
  });

  describe('canHandle', () => {
    it('should always return true', () => {
      expect(strategy.canHandle(mockDatabase)).toBe(true);
    });

    it('should return true for any database', () => {
      const databases = [
        mockDatabase,
        { ...mockDatabase, id: 'different-id' },
        { ...mockDatabase, name: 'different-name' },
      ];

      databases.forEach((db) => {
        expect(strategy.canHandle(db)).toBe(true);
      });
    });
  });

  describe('resolve', () => {
    it('should return database as-is', async () => {
      const result = await strategy.resolve(mockDatabase);

      expect(result).toBe(mockDatabase);
    });

    it('should not modify the database', async () => {
      const originalDatabase = { ...mockDatabase };

      const result = await strategy.resolve(mockDatabase);

      expect(result).toEqual(originalDatabase);
    });
  });
});
