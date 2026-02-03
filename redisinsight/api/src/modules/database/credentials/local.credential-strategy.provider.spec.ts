import { Test, TestingModule } from '@nestjs/testing';
import { mockDatabase } from 'src/__mocks__';
import { LocalCredentialStrategyProvider } from './local.credential-strategy.provider';
import { DefaultCredentialStrategy } from './strategies/default.credential-strategy';

describe('LocalCredentialStrategyProvider', () => {
  let provider: LocalCredentialStrategyProvider;
  let defaultStrategy: DefaultCredentialStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalCredentialStrategyProvider, DefaultCredentialStrategy],
    }).compile();

    provider = module.get(LocalCredentialStrategyProvider);
    defaultStrategy = module.get(DefaultCredentialStrategy);
  });

  describe('resolve', () => {
    it('should resolve database using default strategy', async () => {
      const result = await provider.resolve(mockDatabase);

      expect(result).toEqual(mockDatabase);
    });

    it('should call default strategy resolve', async () => {
      const resolveSpy = jest.spyOn(defaultStrategy, 'resolve');

      await provider.resolve(mockDatabase);

      expect(resolveSpy).toHaveBeenCalledWith(mockDatabase);
    });
  });

  describe('getStrategy', () => {
    it('should return default strategy for any database', () => {
      const result = provider.getStrategy(mockDatabase);

      expect(result).toBe(defaultStrategy);
    });
  });
});
