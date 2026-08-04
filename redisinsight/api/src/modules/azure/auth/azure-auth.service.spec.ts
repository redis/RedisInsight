import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { PublicClientApplication } from '@azure/msal-node';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AzureAuthService } from './azure-auth.service';
import {
  AzureAuthStatus,
  AzureOAuthRedirectType,
  AzureRedisTokenEvents,
} from '../constants';
import { AzureOAuthPrompt } from './dto';

jest.mock('@azure/msal-node');

const mockEventEmitter = {
  emit: jest.fn(),
};

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
      providers: [
        AzureAuthService,
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AzureAuthService>(AzureAuthService);
  });

  describe('getAuthorizationUrl', () => {
    it('should allow concurrent auth requests (multiple tabs or users)', async () => {
      const mockAccount = createMockAccount();
      mockPca.acquireTokenByCode.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        account: mockAccount,
      } as any);

      // Create first auth request
      const { state: firstState } = await service.getAuthorizationUrl();

      // Create second auth request (should NOT clear the first)
      const { state: secondState } = await service.getAuthorizationUrl();

      // Both states should still be valid
      const result1 = await service.handleCallback('auth-code-1', firstState);
      const result2 = await service.handleCallback('auth-code-2', secondState);

      expect(result1.status).toBe(AzureAuthStatus.Succeed);
      expect(result2.status).toBe(AzureAuthStatus.Succeed);
    });

    it('should clean up expired auth requests on new request', async () => {
      mockPca.acquireTokenByCode.mockRejectedValue(new Error('Token error'));

      // Create first auth request
      const { state: expiredState } = await service.getAuthorizationUrl();

      // Fast-forward time past expiration (10 minutes + 1 second)
      const originalDateNow = Date.now;
      const startTime = Date.now();
      Date.now = jest.fn(() => startTime + 10 * 60 * 1000 + 1000);

      // Create second auth request (should clean up expired first request)
      await service.getAuthorizationUrl();

      // Restore Date.now
      Date.now = originalDateNow;

      // First state should no longer be valid (expired and cleaned up)
      const result = await service.handleCallback('auth-code', expiredState);
      expect(result.status).toBe(AzureAuthStatus.Failed);
      expect(result.error).toBe('Invalid or expired authentication state');
    });

    it('should pass prompt parameter to MSAL when provided', async () => {
      await service.getAuthorizationUrl(AzureOAuthPrompt.SelectAccount);

      expect(mockPca.getAuthCodeUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'select_account',
        }),
      );
    });

    it('should not include prompt parameter when not provided', async () => {
      await service.getAuthorizationUrl();

      expect(mockPca.getAuthCodeUrl).toHaveBeenCalledWith(
        expect.not.objectContaining({
          prompt: expect.anything(),
        }),
      );
    });

    it('should pass per-tenant authority to MSAL when tenantId provided', async () => {
      const tenantId = faker.string.uuid();

      await service.getAuthorizationUrl(undefined, undefined, tenantId);

      expect(mockPca.getAuthCodeUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          authority: `https://login.microsoftonline.com/${tenantId}`,
        }),
      );
    });

    it('should not include authority parameter when tenantId not provided', async () => {
      await service.getAuthorizationUrl();

      expect(mockPca.getAuthCodeUrl).toHaveBeenCalledWith(
        expect.not.objectContaining({
          authority: expect.anything(),
        }),
      );
    });
  });

  describe('handleCallback', () => {
    it('should return failed status with error for unknown state', async () => {
      const result = await service.handleCallback('auth-code', 'unknown-state');

      expect(result.status).toBe(AzureAuthStatus.Failed);
      expect(result.error).toBe('Invalid or expired authentication state');
      expect(result.account).toBeUndefined();
    });

    it('should return failed status with error when token acquisition fails', async () => {
      mockPca.acquireTokenByCode.mockRejectedValue(new Error('Token error'));

      const { state } = await service.getAuthorizationUrl();
      const result = await service.handleCallback('auth-code', state);

      expect(result.status).toBe(AzureAuthStatus.Failed);
      expect(result.error).toBe('Token error');
    });

    it('should clean up state after callback', async () => {
      mockPca.acquireTokenByCode.mockRejectedValue(new Error('Token error'));

      const { state } = await service.getAuthorizationUrl();
      await service.handleCallback('auth-code', state);

      // Second call with same state should fail (state was cleaned up)
      const result = await service.handleCallback('auth-code', state);
      expect(result.status).toBe(AzureAuthStatus.Failed);
      expect(result.error).toBe('Invalid or expired authentication state');
    });

    it('should return success status with account on successful token acquisition', async () => {
      const mockAccount = createMockAccount();
      mockPca.acquireTokenByCode.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        account: mockAccount,
      } as any);

      const { state } = await service.getAuthorizationUrl();
      const result = await service.handleCallback('auth-code', state);

      expect(result.status).toBe(AzureAuthStatus.Succeed);
      expect(result.account).toEqual(mockAccount);
      expect(result.error).toBeUndefined();
    });

    it('should exchange the code against the tenant authority used at sign-in', async () => {
      const tenantId = faker.string.uuid();
      mockPca.acquireTokenByCode.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        account: createMockAccount(),
      } as any);

      const { state } = await service.getAuthorizationUrl(
        undefined,
        undefined,
        tenantId,
      );
      await service.handleCallback('auth-code', state);

      expect(mockPca.acquireTokenByCode).toHaveBeenCalledWith(
        expect.objectContaining({
          authority: `https://login.microsoftonline.com/${tenantId}`,
        }),
      );
    });

    it('should not pass authority to code exchange when no tenant was chosen', async () => {
      mockPca.acquireTokenByCode.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        account: createMockAccount(),
      } as any);

      const { state } = await service.getAuthorizationUrl();
      await service.handleCallback('auth-code', state);

      expect(mockPca.acquireTokenByCode).toHaveBeenCalledWith(
        expect.not.objectContaining({
          authority: expect.anything(),
        }),
      );
    });
  });

  describe('removeAuthRequest', () => {
    it('should return redirect type and remove state from map', async () => {
      const { state } = await service.getAuthorizationUrl();

      // Remove should return the redirect type
      const redirectType = service.removeAuthRequest(state);
      expect(redirectType).toBe(AzureOAuthRedirectType.Deeplink);

      // handleCallback should fail since state was removed
      const result = await service.handleCallback('auth-code', state);
      expect(result.status).toBe(AzureAuthStatus.Failed);
      expect(result.error).toBe('Invalid or expired authentication state');
    });

    it('should return null for unknown state', () => {
      const redirectType = service.removeAuthRequest('unknown-state');
      expect(redirectType).toBeNull();
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

    it('should return null when result has no account', async () => {
      const mockAccount = createMockAccount();
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: null,
      } as any);

      const result = await service.getRedisTokenByAccountId(
        mockAccount.homeAccountId,
      );

      expect(result).toBeNull();
    });

    it('should return token result on successful acquisition', async () => {
      const mockAccount = createMockAccount();
      const mockExpiresOn = new Date();
      const mockAccessToken = faker.string.alphanumeric(100);
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: mockAccessToken,
        expiresOn: mockExpiresOn,
        account: mockAccount,
      } as any);

      const result = await service.getRedisTokenByAccountId(
        mockAccount.homeAccountId,
      );

      expect(result).toEqual({
        token: mockAccessToken,
        expiresOn: mockExpiresOn,
        account: mockAccount,
      });
    });

    it('should emit token acquired event on successful acquisition', async () => {
      const tenantId = faker.string.uuid();
      const mockAccount = { ...createMockAccount(), tenantId };
      const mockExpiresOn = new Date();
      const mockAccessToken = faker.string.alphanumeric(100);
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: mockAccessToken,
        expiresOn: mockExpiresOn,
        account: mockAccount,
      } as any);

      await service.getRedisTokenByAccountId(
        mockAccount.homeAccountId,
        tenantId,
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AzureRedisTokenEvents.Acquired,
        {
          accountId: mockAccount.homeAccountId,
          tenantId,
          tokenResult: {
            token: mockAccessToken,
            expiresOn: mockExpiresOn,
            account: mockAccount,
          },
        },
      );
    });

    it('should not emit event when token acquisition fails', async () => {
      mockTokenCache.getAllAccounts.mockResolvedValue([]);

      await service.getRedisTokenByAccountId('unknown-id');

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should acquire silently against the tenant authority when tenantId provided', async () => {
      const tenantId = faker.string.uuid();
      const mockAccount = { ...createMockAccount(), tenantId };
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: mockAccount,
      } as any);

      await service.getRedisTokenByAccountId(
        mockAccount.homeAccountId,
        tenantId,
      );

      expect(mockPca.acquireTokenSilent).toHaveBeenCalledWith(
        expect.objectContaining({
          authority: `https://login.microsoftonline.com/${tenantId}`,
        }),
      );
    });

    it('should select the account matching the requested tenant when multiple realms are cached', async () => {
      const homeAccountId = faker.string.uuid();
      const tenantId = faker.string.uuid();
      // Same user signed into two tenants → two records share homeAccountId
      const homeRealmAccount = {
        ...createMockAccount(),
        homeAccountId,
        tenantId: faker.string.uuid(),
      };
      const targetRealmAccount = {
        ...createMockAccount(),
        homeAccountId,
        tenantId,
      };
      mockTokenCache.getAllAccounts.mockResolvedValue([
        homeRealmAccount,
        targetRealmAccount,
      ]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: targetRealmAccount,
      } as any);

      await service.getRedisTokenByAccountId(homeAccountId, tenantId);

      expect(mockPca.acquireTokenSilent).toHaveBeenCalledWith(
        expect.objectContaining({
          account: targetRealmAccount,
          authority: `https://login.microsoftonline.com/${tenantId}`,
        }),
      );
    });

    it('should not pass authority to silent acquisition when no tenantId', async () => {
      const mockAccount = createMockAccount();
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: mockAccount,
      } as any);

      await service.getRedisTokenByAccountId(mockAccount.homeAccountId);

      expect(mockPca.acquireTokenSilent).toHaveBeenCalledWith(
        expect.not.objectContaining({
          authority: expect.anything(),
        }),
      );
    });

    it('should not force a refresh when the requested realm is cached', async () => {
      const tenantId = faker.string.uuid();
      const mockAccount = { ...createMockAccount(), tenantId };
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: mockAccount,
      } as any);

      await service.getRedisTokenByAccountId(
        mockAccount.homeAccountId,
        tenantId,
      );

      expect(mockPca.acquireTokenSilent).toHaveBeenCalledWith(
        expect.not.objectContaining({
          forceRefresh: true,
        }),
      );
    });
  });

  describe('getRedisTokenByAccountId cross-tenant safety', () => {
    const homeTenantId = faker.string.uuid();
    const otherTenantId = faker.string.uuid();
    // MSAL keys AAD accounts as `<local account id>.<home tenant id>`
    const homeAccountId = `${faker.string.uuid()}.${homeTenantId}`;
    let homeRealmAccount: ReturnType<typeof createMockAccount>;

    beforeEach(() => {
      // Signed into the home tenant only: connecting to a database there leaves
      // a live token for that realm in the cache.
      homeRealmAccount = {
        ...createMockAccount(),
        homeAccountId,
        tenantId: homeTenantId,
      };
      mockTokenCache.getAllAccounts.mockResolvedValue([homeRealmAccount]);
    });

    it('should force a refresh when the requested tenant has no cached realm', async () => {
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: { ...homeRealmAccount, tenantId: otherTenantId },
      } as any);

      await service.getRedisTokenByAccountId(homeAccountId, otherTenantId);

      expect(mockPca.acquireTokenSilent).toHaveBeenCalledWith(
        expect.objectContaining({
          authority: `https://login.microsoftonline.com/${otherTenantId}`,
          forceRefresh: true,
        }),
      );
    });

    it('should reject a token issued for a realm other than the requested tenant', async () => {
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: homeRealmAccount,
      } as any);

      const result = await service.getRedisTokenByAccountId(
        homeAccountId,
        otherTenantId,
      );

      expect(result).toBeNull();
    });

    it('should not emit the token acquired event for a wrong-realm token', async () => {
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: homeRealmAccount,
      } as any);

      await service.getRedisTokenByAccountId(homeAccountId, otherTenantId);

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return the token when the realm matches the requested tenant', async () => {
      const otherRealmAccount = {
        ...homeRealmAccount,
        tenantId: otherTenantId,
        localAccountId: faker.string.uuid(),
      };
      const mockAccessToken = faker.string.alphanumeric(100);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: mockAccessToken,
        expiresOn: new Date(),
        account: otherRealmAccount,
      } as any);

      const result = await service.getRedisTokenByAccountId(
        homeAccountId,
        otherTenantId,
      );

      expect(result?.token).toEqual(mockAccessToken);
      expect(result?.account).toEqual(otherRealmAccount);
    });

    it('should not reject a home-realm token when no tenant is requested', async () => {
      const mockAccessToken = faker.string.alphanumeric(100);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: mockAccessToken,
        expiresOn: new Date(),
        account: homeRealmAccount,
      } as any);

      const result = await service.getRedisTokenByAccountId(homeAccountId);

      expect(result?.token).toEqual(mockAccessToken);
    });

    it('should prefer the home realm when no tenant is requested', async () => {
      // A database with no recorded tenantId, where the cache lists the most
      // recent sign-in ahead of the home realm.
      const otherRealmAccount = {
        ...homeRealmAccount,
        tenantId: otherTenantId,
        localAccountId: faker.string.uuid(),
      };
      mockTokenCache.getAllAccounts.mockResolvedValue([
        otherRealmAccount,
        homeRealmAccount,
      ]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: homeRealmAccount,
      } as any);

      await service.getRedisTokenByAccountId(homeAccountId);

      expect(mockPca.acquireTokenSilent).toHaveBeenCalledWith(
        expect.objectContaining({
          account: homeRealmAccount,
        }),
      );
    });

    it('should reject a wrong-realm management token as well', async () => {
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: homeRealmAccount,
      } as any);

      const result = await service.getManagementTokenByAccountId(
        homeAccountId,
        otherTenantId,
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

    it('should return token result on successful acquisition', async () => {
      const mockAccount = createMockAccount();
      const mockExpiresOn = new Date();
      const mockAccessToken = faker.string.alphanumeric(100);
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: mockAccessToken,
        expiresOn: mockExpiresOn,
        account: mockAccount,
      } as any);

      const result = await service.getManagementTokenByAccountId(
        mockAccount.homeAccountId,
      );

      expect(result).toEqual({
        token: mockAccessToken,
        expiresOn: mockExpiresOn,
        account: mockAccount,
      });
    });

    it('should acquire silently against the tenant authority when tenantId provided', async () => {
      const tenantId = faker.string.uuid();
      const mockAccount = { ...createMockAccount(), tenantId };
      mockTokenCache.getAllAccounts.mockResolvedValue([mockAccount]);
      mockPca.acquireTokenSilent.mockResolvedValue({
        accessToken: faker.string.alphanumeric(100),
        expiresOn: new Date(),
        account: mockAccount,
      } as any);

      await service.getManagementTokenByAccountId(
        mockAccount.homeAccountId,
        tenantId,
      );

      expect(mockPca.acquireTokenSilent).toHaveBeenCalledWith(
        expect.objectContaining({
          authority: `https://login.microsoftonline.com/${tenantId}`,
        }),
      );
    });
  });
});
