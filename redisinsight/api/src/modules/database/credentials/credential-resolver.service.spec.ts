import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { mockDatabase } from 'src/__mocks__';
import { CredentialResolver } from './credential-resolver.service';
import { CredentialStrategy } from './credential-strategy.interface';
import { CREDENTIAL_STRATEGY } from './constants';

const mockStrategy = (): CredentialStrategy => ({
  canHandle: jest.fn(),
  resolve: jest.fn(),
});

describe('CredentialResolver', () => {
  let resolver: CredentialResolver;
  let strategy1: CredentialStrategy;
  let strategy2: CredentialStrategy;

  describe('with multiple strategies', () => {
    beforeEach(async () => {
      strategy1 = mockStrategy();
      strategy2 = mockStrategy();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CredentialResolver,
          {
            provide: CREDENTIAL_STRATEGY,
            useValue: [strategy1, strategy2],
          },
        ],
      }).compile();

      resolver = module.get(CredentialResolver);
    });

    it('should use first strategy that can handle the database', async () => {
      const database = mockDatabase;
      const resolvedDatabase = { ...database, password: faker.string.uuid() };

      (strategy1.canHandle as jest.Mock).mockReturnValue(true);
      (strategy1.resolve as jest.Mock).mockResolvedValue(resolvedDatabase);

      const result = await resolver.resolve(database);

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

      const result = await resolver.resolve(database);

      expect(result).toEqual(resolvedDatabase);
      expect(strategy1.canHandle).toHaveBeenCalledWith(database);
      expect(strategy1.resolve).not.toHaveBeenCalled();
      expect(strategy2.canHandle).toHaveBeenCalledWith(database);
      expect(strategy2.resolve).toHaveBeenCalledWith(database);
    });

    it('should return database as-is when no strategy can handle', async () => {
      const database = mockDatabase;

      (strategy1.canHandle as jest.Mock).mockReturnValue(false);
      (strategy2.canHandle as jest.Mock).mockReturnValue(false);

      const result = await resolver.resolve(database);

      expect(result).toBe(database);
      expect(strategy1.resolve).not.toHaveBeenCalled();
      expect(strategy2.resolve).not.toHaveBeenCalled();
    });
  });

  describe('with no strategies', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [CredentialResolver],
      }).compile();

      resolver = module.get(CredentialResolver);
    });

    it('should return database as-is when no strategies registered', async () => {
      const database = mockDatabase;

      const result = await resolver.resolve(database);

      expect(result).toBe(database);
    });
  });

  describe('with single strategy (not array)', () => {
    beforeEach(async () => {
      strategy1 = mockStrategy();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CredentialResolver,
          {
            provide: CREDENTIAL_STRATEGY,
            useValue: strategy1,
          },
        ],
      }).compile();

      resolver = module.get(CredentialResolver);
    });

    it('should handle single strategy provided as non-array', async () => {
      const database = mockDatabase;
      const resolvedDatabase = { ...database, password: faker.string.uuid() };

      (strategy1.canHandle as jest.Mock).mockReturnValue(true);
      (strategy1.resolve as jest.Mock).mockResolvedValue(resolvedDatabase);

      const result = await resolver.resolve(database);

      expect(result).toEqual(resolvedDatabase);
      expect(strategy1.canHandle).toHaveBeenCalledWith(database);
      expect(strategy1.resolve).toHaveBeenCalledWith(database);
    });
  });
});
