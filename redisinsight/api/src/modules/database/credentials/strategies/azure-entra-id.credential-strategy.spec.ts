import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { mockDatabase } from 'src/__mocks__';
import { AzureAuthService } from 'src/modules/azure/auth/azure-auth.service';
import { AzureAuthType } from 'src/modules/azure/constants';
import { AzureEntraIdTokenExpiredException } from 'src/modules/azure/exceptions';
import { CloudProvider } from 'src/modules/database/models/provider-details';
import { Database } from 'src/modules/database/models/database';
import { AzureEntraIdCredentialStrategy } from './azure-entra-id.credential-strategy';

const mockAzureAuthService = {
  getRedisTokenByAccountId: jest.fn(),
};

const createMockAzureDatabase = (overrides = {}): Database =>
  Object.assign(new Database(), {
    ...mockDatabase,
    providerDetails: {
      provider: CloudProvider.Azure,
      authType: AzureAuthType.EntraId,
      azureAccountId: faker.string.uuid(),
    },
    ...overrides,
  });

const createMockTokenResult = () => ({
  token: faker.string.alphanumeric(100),
  expiresOn: new Date(),
  account: {
    homeAccountId: faker.string.uuid(),
    localAccountId: faker.string.uuid(),
    username: faker.internet.email(),
    name: faker.person.fullName(),
    environment: 'login.microsoftonline.com',
    tenantId: faker.string.uuid(),
  },
});

describe('AzureEntraIdCredentialStrategy', () => {
  let strategy: AzureEntraIdCredentialStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureEntraIdCredentialStrategy,
        {
          provide: AzureAuthService,
          useValue: mockAzureAuthService,
        },
      ],
    }).compile();

    strategy = module.get(AzureEntraIdCredentialStrategy);
  });

  describe('isAzureProviderDetails', () => {
    it('should return true for valid Azure provider details', () => {
      const details = {
        provider: CloudProvider.Azure,
        authType: AzureAuthType.EntraId,
      };

      expect(
        AzureEntraIdCredentialStrategy.isAzureProviderDetails(details),
      ).toBe(true);
    });

    it('should return false for null', () => {
      expect(AzureEntraIdCredentialStrategy.isAzureProviderDetails(null)).toBe(
        false,
      );
    });

    it('should return false for undefined', () => {
      expect(
        AzureEntraIdCredentialStrategy.isAzureProviderDetails(undefined),
      ).toBe(false);
    });

    it('should return false for details without provider', () => {
      const details = { authType: AzureAuthType.EntraId } as any;

      expect(
        AzureEntraIdCredentialStrategy.isAzureProviderDetails(details),
      ).toBe(false);
    });

    it('should return false for details without authType', () => {
      const details = { provider: CloudProvider.Azure } as any;

      expect(
        AzureEntraIdCredentialStrategy.isAzureProviderDetails(details),
      ).toBe(false);
    });
  });

  describe('isAzureEntraIdAuth', () => {
    it('should return true for Azure Entra ID auth', () => {
      const details = {
        provider: CloudProvider.Azure,
        authType: AzureAuthType.EntraId,
      };

      expect(AzureEntraIdCredentialStrategy.isAzureEntraIdAuth(details)).toBe(
        true,
      );
    });

    it('should return false for Azure Access Key auth', () => {
      const details = {
        provider: CloudProvider.Azure,
        authType: AzureAuthType.AccessKey,
      };

      expect(AzureEntraIdCredentialStrategy.isAzureEntraIdAuth(details)).toBe(
        false,
      );
    });

    it('should return false for null', () => {
      expect(AzureEntraIdCredentialStrategy.isAzureEntraIdAuth(null)).toBe(
        false,
      );
    });

    it('should return false for undefined', () => {
      expect(AzureEntraIdCredentialStrategy.isAzureEntraIdAuth(undefined)).toBe(
        false,
      );
    });
  });

  describe('canHandle', () => {
    it('should return true for database with Azure Entra ID auth', () => {
      const database = createMockAzureDatabase();

      expect(strategy.canHandle(database)).toBe(true);
    });

    it('should return false for database without providerDetails', () => {
      expect(strategy.canHandle(mockDatabase)).toBe(false);
    });

    it('should return false for database with Azure access key auth', () => {
      const database = createMockAzureDatabase({
        providerDetails: {
          provider: CloudProvider.Azure,
          authType: AzureAuthType.AccessKey,
        },
      });

      expect(strategy.canHandle(database)).toBe(false);
    });
  });

  describe('resolve', () => {
    it('should throw BadRequestException when azureAccountId is missing', async () => {
      const database = createMockAzureDatabase({
        providerDetails: {
          provider: CloudProvider.Azure,
          authType: AzureAuthType.EntraId,
          azureAccountId: undefined,
        },
      });

      await expect(strategy.resolve(database)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw AzureEntraIdTokenExpiredException when token acquisition fails', async () => {
      const database = createMockAzureDatabase();
      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(null);

      await expect(strategy.resolve(database)).rejects.toThrow(
        AzureEntraIdTokenExpiredException,
      );
    });

    it('should return database with credentials from token result', async () => {
      const database = createMockAzureDatabase();
      const tokenResult = createMockTokenResult();
      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(
        tokenResult,
      );

      const result = await strategy.resolve(database);

      expect(result.username).toBe(tokenResult.account.localAccountId);
      expect(result.password).toBe(tokenResult.token);
      expect(
        mockAzureAuthService.getRedisTokenByAccountId,
      ).toHaveBeenCalledWith(database.providerDetails?.azureAccountId);
    });

    it('should preserve other database properties', async () => {
      const database = createMockAzureDatabase();
      const tokenResult = createMockTokenResult();
      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(
        tokenResult,
      );

      const result = await strategy.resolve(database);

      expect(result.id).toBe(database.id);
      expect(result.host).toBe(database.host);
      expect(result.port).toBe(database.port);
      expect(result.name).toBe(database.name);
    });

    it('should set tokenExpiresOn in providerDetails', async () => {
      const database = createMockAzureDatabase();
      const tokenResult = createMockTokenResult();
      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(
        tokenResult,
      );

      const result = await strategy.resolve(database);

      expect(result.providerDetails?.tokenExpiresOn).toEqual(
        tokenResult.expiresOn,
      );
    });
  });
});
