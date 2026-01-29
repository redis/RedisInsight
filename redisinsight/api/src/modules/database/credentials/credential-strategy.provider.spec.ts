import { faker } from '@faker-js/faker';
import { mockDatabase } from 'src/__mocks__';
import {
  CredentialStrategyProvider,
  ICredentialStrategy,
} from './credential-strategy.provider';

const mockStrategy = (): ICredentialStrategy => ({
  canHandle: jest.fn(),
  resolve: jest.fn(),
});

describe('CredentialStrategyProvider', () => {
  let provider: CredentialStrategyProvider;
  let strategy1: ICredentialStrategy;
  let strategy2: ICredentialStrategy;

  beforeEach(() => {
    provider = new CredentialStrategyProvider();
    strategy1 = mockStrategy();
    strategy2 = mockStrategy();
  });

  describe('with multiple strategies', () => {
    beforeEach(() => {
      provider.setStrategies([strategy1, strategy2]);
    });

    it('should use first strategy that can handle the database', async () => {
      const database = mockDatabase;
      const resolvedDatabase = { ...database, password: faker.string.uuid() };

      (strategy1.canHandle as jest.Mock).mockReturnValue(true);
      (strategy1.resolve as jest.Mock).mockResolvedValue(resolvedDatabase);

      const result = await provider.resolve(database);

      expect(result).toEqual(resolvedDatabase);
      expect(strategy1.canHandle).toHaveBeenCalledWith(database);
      expect(strategy1.resolve).toHaveBeenCalledWith(database);
      expect(strategy2.canHandle).not.toHaveBeenCalled();
      expect(strategy2.resolve).not.toHaveBeenCalled();
    });

    it('should skip strategy that cannot handle and use next one', async () => {
      const database = mockDatabase;
      const resolvedDatabase = { ...database, password: faker.string.uuid() };

      (strategy1.canHandle as jest.Mock).mockReturnValue(false);
      (strategy2.canHandle as jest.Mock).mockReturnValue(true);
      (strategy2.resolve as jest.Mock).mockResolvedValue(resolvedDatabase);

      const result = await provider.resolve(database);

      expect(result).toEqual(resolvedDatabase);
      expect(strategy1.canHandle).toHaveBeenCalledWith(database);
      expect(strategy1.resolve).not.toHaveBeenCalled();
      expect(strategy2.canHandle).toHaveBeenCalledWith(database);
      expect(strategy2.resolve).toHaveBeenCalledWith(database);
    });

    it('should throw error when no strategy can handle', async () => {
      const database = mockDatabase;

      (strategy1.canHandle as jest.Mock).mockReturnValue(false);
      (strategy2.canHandle as jest.Mock).mockReturnValue(false);

      await expect(provider.resolve(database)).rejects.toThrow(
        `No credential strategy available to handle database ${database.id}`,
      );
      expect(strategy1.resolve).not.toHaveBeenCalled();
      expect(strategy2.resolve).not.toHaveBeenCalled();
    });
  });

  describe('with no strategies', () => {
    it('should throw error when no strategies registered', async () => {
      const database = mockDatabase;

      await expect(provider.resolve(database)).rejects.toThrow(
        `No credential strategy available to handle database ${database.id}`,
      );
    });
  });

  describe('getStrategy', () => {
    beforeEach(() => {
      provider.setStrategies([strategy1, strategy2]);
    });

    it('should return first strategy that can handle', () => {
      (strategy1.canHandle as jest.Mock).mockReturnValue(false);
      (strategy2.canHandle as jest.Mock).mockReturnValue(true);

      const result = provider.getStrategy(mockDatabase);

      expect(result).toBe(strategy2);
    });

    it('should return undefined when no strategy can handle', () => {
      (strategy1.canHandle as jest.Mock).mockReturnValue(false);
      (strategy2.canHandle as jest.Mock).mockReturnValue(false);

      const result = provider.getStrategy(mockDatabase);

      expect(result).toBeUndefined();
    });
  });
});
