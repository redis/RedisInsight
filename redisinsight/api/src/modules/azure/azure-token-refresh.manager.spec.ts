import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AzureTokenRefreshManager } from './azure-token-refresh.manager';
import { AzureAuthService } from './auth/azure-auth.service';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import {
  TOKEN_REFRESH_BUFFER_MS,
  TOKEN_REFRESH_RETRY_DELAY_MS,
} from './constants';

const createMockAccount = () => ({
  homeAccountId: faker.string.uuid(),
  environment: 'login.microsoftonline.com',
  tenantId: faker.string.uuid(),
  username: faker.internet.email(),
  localAccountId: faker.string.uuid(),
  name: faker.person.fullName(),
});

const createMockTokenResult = () => {
  const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  return {
    token: faker.string.alphanumeric(100),
    expiresOn,
    account: createMockAccount(),
  };
};

const createMockClient = () => ({
  id: faker.string.uuid(),
  call: jest.fn().mockResolvedValue('OK'),
  database: {
    providerDetails: {
      azureAccountId: faker.string.uuid(),
    },
  },
});

describe('AzureTokenRefreshManager', () => {
  let manager: AzureTokenRefreshManager;
  let mockAzureAuthService: { getRedisTokenByAccountId: jest.Mock };
  let mockRedisClientStorage: { getClientsByDatabaseField: jest.Mock };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockAzureAuthService = {
      getRedisTokenByAccountId: jest.fn(),
    };

    mockRedisClientStorage = {
      getClientsByDatabaseField: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureTokenRefreshManager,
        {
          provide: AzureAuthService,
          useValue: mockAzureAuthService,
        },
        {
          provide: RedisClientStorage,
          useValue: mockRedisClientStorage,
        },
      ],
    }).compile();

    manager = module.get<AzureTokenRefreshManager>(AzureTokenRefreshManager);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('scheduleRefresh', () => {
    it('should schedule a timer based on token expiry minus buffer', () => {
      const azureAccountId = faker.string.uuid();
      const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      manager.scheduleRefresh(azureAccountId, expiresOn);

      expect(jest.getTimerCount()).toBe(1);
    });

    it('should clear existing timer when scheduling for same account', () => {
      const azureAccountId = faker.string.uuid();
      const expiresOn1 = new Date(Date.now() + 60 * 60 * 1000);
      const expiresOn2 = new Date(Date.now() + 2 * 60 * 60 * 1000);

      manager.scheduleRefresh(azureAccountId, expiresOn1);
      manager.scheduleRefresh(azureAccountId, expiresOn2);

      expect(jest.getTimerCount()).toBe(1);
    });

    it('should allow multiple timers for different accounts', () => {
      const accountId1 = faker.string.uuid();
      const accountId2 = faker.string.uuid();
      const expiresOn = new Date(Date.now() + 60 * 60 * 1000);

      manager.scheduleRefresh(accountId1, expiresOn);
      manager.scheduleRefresh(accountId2, expiresOn);

      expect(jest.getTimerCount()).toBe(2);
    });
  });

  describe('clearTimer', () => {
    it('should clear timer for specific account', () => {
      const azureAccountId = faker.string.uuid();
      const expiresOn = new Date(Date.now() + 60 * 60 * 1000);

      manager.scheduleRefresh(azureAccountId, expiresOn);
      expect(jest.getTimerCount()).toBe(1);

      manager.clearTimer(azureAccountId);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should not throw when clearing non-existent timer', () => {
      expect(() => manager.clearTimer(faker.string.uuid())).not.toThrow();
    });
  });

  describe('clearAllTimers', () => {
    it('should clear all timers', () => {
      const expiresOn = new Date(Date.now() + 60 * 60 * 1000);

      manager.scheduleRefresh(faker.string.uuid(), expiresOn);
      manager.scheduleRefresh(faker.string.uuid(), expiresOn);
      manager.scheduleRefresh(faker.string.uuid(), expiresOn);
      expect(jest.getTimerCount()).toBe(3);

      manager.clearAllTimers();
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear all timers on module destroy', () => {
      const expiresOn = new Date(Date.now() + 60 * 60 * 1000);

      manager.scheduleRefresh(faker.string.uuid(), expiresOn);
      manager.scheduleRefresh(faker.string.uuid(), expiresOn);
      expect(jest.getTimerCount()).toBe(2);

      manager.onModuleDestroy();
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('refreshTokenAndReauth (timer callback)', () => {
    it('should refresh token and re-authenticate clients when timer fires', async () => {
      const azureAccountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const mockClient = createMockClient();

      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(
        tokenResult,
      );
      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        mockClient,
      ]);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      expect(
        mockAzureAuthService.getRedisTokenByAccountId,
      ).toHaveBeenCalledWith(azureAccountId);
      expect(
        mockRedisClientStorage.getClientsByDatabaseField,
      ).toHaveBeenCalledWith('providerDetails.azureAccountId', azureAccountId);
      expect(mockClient.call).toHaveBeenCalledWith([
        'AUTH',
        tokenResult.account.localAccountId,
        tokenResult.token,
      ]);
    });

    it('should schedule retry when token refresh fails with active clients', async () => {
      const azureAccountId = faker.string.uuid();
      const mockClient = createMockClient();

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        mockClient,
      ]);
      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(null);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      expect(mockRedisClientStorage.getClientsByDatabaseField).toHaveBeenCalled();
      expect(mockAzureAuthService.getRedisTokenByAccountId).toHaveBeenCalled();
      // Should have scheduled a retry timer
      expect(jest.getTimerCount()).toBe(1);
    });

    it('should retry token refresh after delay when initial refresh fails', async () => {
      const azureAccountId = faker.string.uuid();
      const mockClient = createMockClient();
      const tokenResult = createMockTokenResult();

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        mockClient,
      ]);
      // First call fails, second succeeds
      mockAzureAuthService.getRedisTokenByAccountId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(tokenResult);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      // First timer fires - token refresh fails
      await jest.advanceTimersByTimeAsync(1000);
      expect(mockAzureAuthService.getRedisTokenByAccountId).toHaveBeenCalledTimes(1);
      expect(mockClient.call).not.toHaveBeenCalled();

      // Retry timer fires - token refresh succeeds
      await jest.advanceTimersByTimeAsync(TOKEN_REFRESH_RETRY_DELAY_MS);
      expect(mockAzureAuthService.getRedisTokenByAccountId).toHaveBeenCalledTimes(2);
      expect(mockClient.call).toHaveBeenCalled();
    });

    it('should stop refresh cycle when no clients are using the account', async () => {
      const azureAccountId = faker.string.uuid();

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([]);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      // Should check for clients first
      expect(mockRedisClientStorage.getClientsByDatabaseField).toHaveBeenCalled();
      // Should NOT call getRedisTokenByAccountId since no clients exist
      expect(mockAzureAuthService.getRedisTokenByAccountId).not.toHaveBeenCalled();
      // Should NOT schedule another timer
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should continue re-authenticating other clients if one fails', async () => {
      const azureAccountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const mockClient1 = createMockClient();
      const mockClient2 = createMockClient();

      mockClient1.call.mockRejectedValue(new Error('Auth failed'));

      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(
        tokenResult,
      );
      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        mockClient1,
        mockClient2,
      ]);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      expect(mockClient1.call).toHaveBeenCalled();
      expect(mockClient2.call).toHaveBeenCalled();
    });
  });
});
