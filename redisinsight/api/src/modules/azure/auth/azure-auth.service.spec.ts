import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { PublicClientApplication } from '@azure/msal-node';
import { AzureAuthService } from './azure-auth.service';
import { AzureAuthStatus } from '../constants';

jest.mock('@azure/msal-node');

const MockedPublicClientApplication =
  PublicClientApplication as jest.MockedClass<typeof PublicClientApplication>;

const createMockAccount = () => ({
  homeAccountId: faker.string.uuid(),
  environment: 'login.microsoftonline.com',
  tenantId: faker.string.uuid(),
  username: faker.internet.email(),
  localAccountId: faker.string.uuid(),
  name: faker.person.fullName(),
});

describe('AzureAuthService', () => {
  let service: AzureAuthService;
  let mockPca: jest.Mocked<PublicClientApplication>;
  let mockTokenCache: {
    getAllAccounts: jest.Mock;
    removeAccount: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTokenCache = {
      getAllAccounts: jest.fn().mockResolvedValue([]),
      removeAccount: jest.fn().mockResolvedValue(undefined),
    };

    mockPca = {
      getAuthCodeUrl: jest.fn().mockResolvedValue('https://example.com'),
      acquireTokenByCode: jest.fn(),
      acquireTokenSilent: jest.fn(),
      getTokenCache: jest.fn().mockReturnValue(mockTokenCache),
    } as unknown as jest.Mocked<PublicClientApplication>;

    MockedPublicClientApplication.mockImplementation(() => mockPca);

    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureAuthService],
    }).compile();

    service = module.get<AzureAuthService>(AzureAuthService);
  });

  describe('handleCallback', () => {
    it('should return failed status for unknown state', async () => {
      const result = await service.handleCallback('auth-code', 'unknown-state');

      expect(result.status).toBe(AzureAuthStatus.Failed);
      expect(result.account).toBeUndefined();
    });

    it('should return failed status when token acquisition fails', async () => {
      mockPca.acquireTokenByCode.mockRejectedValue(new Error('Token error'));

      const { state } = await service.getAuthorizationUrl();
      const result = await service.handleCallback('auth-code', state);

      expect(result.status).toBe(AzureAuthStatus.Failed);
    });

    it('should clean up state after callback', async () => {
      mockPca.acquireTokenByCode.mockRejectedValue(new Error('Token error'));

      const { state } = await service.getAuthorizationUrl();
      await service.handleCallback('auth-code', state);

      // Second call with same state should fail (state was cleaned up)
      const result = await service.handleCallback('auth-code', state);
      expect(result.status).toBe(AzureAuthStatus.Failed);
    });
  });

  describe('getStatus', () => {
    it('should map accounts to response format', async () => {
      const mockAccounts = [createMockAccount(), createMockAccount()];
      mockTokenCache.getAllAccounts.mockResolvedValue(mockAccounts);

      const result = await service.getStatus();

      expect(result.authenticated).toBe(true);
      expect(result.accounts).toHaveLength(2);
      expect(result.accounts[0]).toEqual({
        id: mockAccounts[0].homeAccountId,
        username: mockAccounts[0].username,
        name: mockAccounts[0].name,
      });
    });

    it('should return not authenticated when no accounts', async () => {
      mockTokenCache.getAllAccounts.mockResolvedValue([]);

      const result = await service.getStatus();

      expect(result.authenticated).toBe(false);
      expect(result.accounts).toHaveLength(0);
    });

    it('should return empty accounts on error', async () => {
      mockTokenCache.getAllAccounts.mockRejectedValue(new Error('Cache error'));

      const result = await service.getStatus();

      expect(result.authenticated).toBe(false);
      expect(result.accounts).toHaveLength(0);
    });
  });

  describe('logout', () => {
    it('should not throw when account not found', async () => {
      mockTokenCache.getAllAccounts.mockResolvedValue([]);

      await expect(
        service.logout('non-existent-account-id'),
      ).resolves.not.toThrow();
    });

    it('should propagate cache errors', async () => {
      const mockAccount = createMockAccount();
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockTokenCache.removeAccount.mockRejectedValue(new Error('Remove error'));

      await expect(service.logout(mockAccount.homeAccountId)).rejects.toThrow(
        'Remove error',
      );
    });
  });

  describe('getRedisTokenByAccountId', () => {
    it('should return null when account not found', async () => {
      mockTokenCache.getAllAccounts.mockResolvedValue([]);

      const result = await service.getRedisTokenByAccountId('unknown-id');

      expect(result).toBeNull();
    });

    it('should return null when token acquisition fails', async () => {
      const mockAccount = createMockAccount();
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockRejectedValue(new Error('Silent error'));

      const result = await service.getRedisTokenByAccountId(
        mockAccount.homeAccountId,
      );

      expect(result).toBeNull();
    });

    it('should return null when result has no accessToken', async () => {
      const mockAccount = createMockAccount();
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: null,
        expiresOn: new Date(),
        account: mockAccount,
      } as any);

      const result = await service.getRedisTokenByAccountId(
        mockAccount.homeAccountId,
      );

      expect(result).toBeNull();
    });
  });

  describe('getManagementTokenByAccountId', () => {
    it('should return null when account not found', async () => {
      mockTokenCache.getAllAccounts.mockResolvedValue([]);

      const result = await service.getManagementTokenByAccountId('unknown-id');

      expect(result).toBeNull();
    });

    it('should return null when token acquisition fails', async () => {
      const mockAccount = createMockAccount();
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockRejectedValue(new Error('Silent error'));

      const result = await service.getManagementTokenByAccountId(
        mockAccount.homeAccountId,
      );

      expect(result).toBeNull();
    });
  });
});
