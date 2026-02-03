import { Test, TestingModule } from '@nestjs/testing';
import { mockDatabase } from 'src/__mocks__';
import { AzureAuthService } from 'src/modules/azure/auth/azure-auth.service';
import { AzureAuthType } from 'src/modules/azure/constants';
import { CloudProvider } from 'src/modules/database/models/provider-details';
import { Database } from 'src/modules/database/models/database';
import { LocalCredentialStrategyProvider } from './local.credential-strategy.provider';
import { DefaultCredentialStrategy } from './strategies/default.credential-strategy';
import { AzureEntraIdCredentialStrategy } from './strategies/azure-entra-id.credential-strategy';

const mockAzureAuthService = {
  getRedisTokenByAccountId: jest.fn(),
};

describe('LocalCredentialStrategyProvider', () => {
  let provider: LocalCredentialStrategyProvider;
  let defaultStrategy: DefaultCredentialStrategy;
  let azureStrategy: AzureEntraIdCredentialStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCredentialStrategyProvider,
        DefaultCredentialStrategy,
        AzureEntraIdCredentialStrategy,
        {
          provide: AzureAuthService,
          useValue: mockAzureAuthService,
        },
      ],
    }).compile();

    provider = module.get(LocalCredentialStrategyProvider);
    defaultStrategy = module.get(DefaultCredentialStrategy);
    azureStrategy = module.get(AzureEntraIdCredentialStrategy);
  });

  describe('resolve', () => {
    it('should resolve database using default strategy', async () => {
      const result = await provider.resolve(mockDatabase);

      expect(result).toEqual(mockDatabase);
    });

    it('should call default strategy resolve for regular database', async () => {
      const resolveSpy = jest.spyOn(defaultStrategy, 'resolve');

      await provider.resolve(mockDatabase);

      expect(resolveSpy).toHaveBeenCalledWith(mockDatabase);
    });

    it('should use Azure strategy for database with Entra ID auth', async () => {
      const mockAzureDatabase = Object.assign(new Database(), {
        ...mockDatabase,
        providerDetails: {
          provider: CloudProvider.Azure,
          authType: AzureAuthType.EntraId,
          azureAccountId: 'test-account-id',
        },
      });

      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: {
          homeAccountId: 'test-account-id',
          localAccountId: 'test-local-account-id',
          username: 'test@example.com',
        },
      });

      const resolveSpy = jest.spyOn(azureStrategy, 'resolve');

      await provider.resolve(mockAzureDatabase);

      expect(resolveSpy).toHaveBeenCalledWith(mockAzureDatabase);
    });
  });

  describe('getStrategy', () => {
    it('should return default strategy for regular database', () => {
      const result = provider.getStrategy(mockDatabase);

      expect(result).toBe(defaultStrategy);
    });

    it('should return Azure strategy for database with Entra ID auth', () => {
      const mockAzureDatabase = Object.assign(new Database(), {
        ...mockDatabase,
        providerDetails: {
          provider: CloudProvider.Azure,
          authType: AzureAuthType.EntraId,
          azureAccountId: 'test-account-id',
        },
      });

      const result = provider.getStrategy(mockAzureDatabase);

      expect(result).toBe(azureStrategy);
    });

    it('should return default strategy for Azure database with access key auth', () => {
      const mockAzureDatabase = Object.assign(new Database(), {
        ...mockDatabase,
        providerDetails: {
          provider: CloudProvider.Azure,
          authType: AzureAuthType.AccessKey,
        },
      });

      const result = provider.getStrategy(mockAzureDatabase);

      expect(result).toBe(defaultStrategy);
    });
  });
});
