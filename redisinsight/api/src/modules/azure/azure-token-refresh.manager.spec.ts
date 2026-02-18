import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AzureTokenRefreshManager } from './azure-token-refresh.manager';
import { AzureAuthService } from './auth/azure-auth.service';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import { TOKEN_REFRESH_BUFFER_MS } from './constants';

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

const createMockClient = (tokenExpiresOn?: Date) => ({
  id: faker.string.uuid(),
  call: jest.fn().mockResolvedValue('OK'),
  database: {
    providerDetails: {
      azureAccountId: faker.string.uuid(),
      tokenExpiresOn,
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

    it('should clear existing timer when scheduling for same account with different expiry', () => {
      const azureAccountId = faker.string.uuid();
      const expiresOn1 = new Date(Date.now() + 60 * 60 * 1000);
      const expiresOn2 = new Date(Date.now() + 2 * 60 * 60 * 1000);

      manager.scheduleRefresh(azureAccountId, expiresOn1);
      manager.scheduleRefresh(azureAccountId, expiresOn2);

      expect(jest.getTimerCount()).toBe(1);
    });

    it('should skip scheduling when timer already exists for same expiry time', () => {
      const azureAccountId = faker.string.uuid();
      const expiresOn = new Date(Date.now() + 60 * 60 * 1000);

      manager.scheduleRefresh(azureAccountId, expiresOn);
      manager.scheduleRefresh(azureAccountId, expiresOn);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      // Should still be just 1 timer (not cleared and rescheduled)
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

    describe('race condition handling', () => {
      it('should handle rapid successive calls with same expiry (duplicate events)', () => {
        const azureAccountId = faker.string.uuid();
        const expiresOn = new Date(Date.now() + 60 * 60 * 1000);

        // Simulate multiple token events arriving rapidly (e.g., from concurrent requests)
        manager.scheduleRefresh(azureAccountId, expiresOn);
        manager.scheduleRefresh(azureAccountId, expiresOn);
        manager.scheduleRefresh(azureAccountId, expiresOn);
        manager.scheduleRefresh(azureAccountId, expiresOn);
        manager.scheduleRefresh(azureAccountId, expiresOn);

        // Should only have 1 timer, not 5
        expect(jest.getTimerCount()).toBe(1);
      });

      it('should handle client reconnection while timer is pending', async () => {
        const azureAccountId = faker.string.uuid();
        const mockClient = createMockClient();
        const initialExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        const newExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        const newTokenResult = {
          ...createMockTokenResult(),
          expiresOn: newExpiry,
        };

        mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
          mockClient,
        ]);

        // Initial timer scheduled
        manager.scheduleRefresh(azureAccountId, initialExpiry);
        expect(jest.getTimerCount()).toBe(1);

        // Client reconnects 10 minutes later, gets new token with different expiry
        await jest.advanceTimersByTimeAsync(10 * 60 * 1000);

        // New token event arrives - should replace old timer
        await manager.handleTokenAcquired({
          accountId: azureAccountId,
          tokenResult: newTokenResult,
        });

        // Should still only have 1 timer (old one cleared, new one set)
        expect(jest.getTimerCount()).toBe(1);

        // Verify old timer doesn't fire (it was cleared)
        mockAzureAuthService.getRedisTokenByAccountId.mockClear();
        await jest.advanceTimersByTimeAsync(50 * 60 * 1000); // Original would have fired

        // Should not have called refresh yet (new timer has longer delay)
        expect(
          mockAzureAuthService.getRedisTokenByAccountId,
        ).not.toHaveBeenCalled();
      });

      it('should atomically replace timer entry (no deletion window)', () => {
        const azureAccountId = faker.string.uuid();
        const expiresOn1 = new Date(Date.now() + 60 * 60 * 1000);
        const expiresOn2 = new Date(Date.now() + 2 * 60 * 60 * 1000);

        manager.scheduleRefresh(azureAccountId, expiresOn1);

        // Access internal timers map to verify behavior
        const timersMap = (
          manager as unknown as { timers: Map<string, unknown> }
        ).timers;
        expect(timersMap.has(azureAccountId)).toBe(true);

        // Schedule with new expiry - should overwrite, not delete then set
        manager.scheduleRefresh(azureAccountId, expiresOn2);

        // Entry should still exist (was overwritten atomically)
        expect(timersMap.has(azureAccountId)).toBe(true);
        expect(jest.getTimerCount()).toBe(1);
      });
    });
  });

  describe('handleTokenAcquired', () => {
    it('should schedule refresh when token acquired event is received', async () => {
      const accountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([]);

      await manager.handleTokenAcquired({ accountId, tokenResult });

      expect(jest.getTimerCount()).toBe(1);
    });

    it('should immediately re-authenticate clients with different token', async () => {
      const accountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const clientWithOldToken = createMockClient(
        new Date(Date.now() - 60 * 60 * 1000),
      );

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        clientWithOldToken,
      ]);

      await manager.handleTokenAcquired({ accountId, tokenResult });

      expect(clientWithOldToken.call).toHaveBeenCalledWith([
        'AUTH',
        tokenResult.account.localAccountId,
        tokenResult.token,
      ]);
    });

    it('should skip immediate re-auth for clients with current token', async () => {
      const accountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const clientWithCurrentToken = createMockClient(tokenResult.expiresOn);

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        clientWithCurrentToken,
      ]);

      await manager.handleTokenAcquired({ accountId, tokenResult });

      expect(clientWithCurrentToken.call).not.toHaveBeenCalled();
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

  describe('refreshToken (timer callback)', () => {
    it('should refresh token when timer fires (re-auth happens via event)', async () => {
      const azureAccountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const mockClient = createMockClient();

      // Simulate event flow: when getRedisTokenByAccountId succeeds,
      // AzureAuthService emits event -> handleTokenAcquired is called
      mockAzureAuthService.getRedisTokenByAccountId.mockImplementation(
        async () => {
          // Simulate event triggering handleTokenAcquired
          await manager.handleTokenAcquired({
            accountId: azureAccountId,
            tokenResult,
          });
          return tokenResult;
        },
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

    it('should not re-authenticate when token refresh fails', async () => {
      const azureAccountId = faker.string.uuid();
      const mockClient = createMockClient();

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        mockClient,
      ]);
      mockAzureAuthService.getRedisTokenByAccountId.mockResolvedValue(null);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      expect(
        mockRedisClientStorage.getClientsByDatabaseField,
      ).toHaveBeenCalled();
      expect(mockAzureAuthService.getRedisTokenByAccountId).toHaveBeenCalled();
      // No re-auth should happen, no retry timer scheduled
      expect(mockClient.call).not.toHaveBeenCalled();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should stop refresh cycle when no clients are using the account', async () => {
      const azureAccountId = faker.string.uuid();

      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([]);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      // Should check for clients first
      expect(
        mockRedisClientStorage.getClientsByDatabaseField,
      ).toHaveBeenCalled();
      // Should NOT call getRedisTokenByAccountId since no clients exist
      expect(
        mockAzureAuthService.getRedisTokenByAccountId,
      ).not.toHaveBeenCalled();
      // Should NOT schedule another timer
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should continue re-authenticating other clients if one fails', async () => {
      const azureAccountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const mockClient1 = createMockClient();
      const mockClient2 = createMockClient();

      mockClient1.call.mockRejectedValue(new Error('Auth failed'));

      mockAzureAuthService.getRedisTokenByAccountId.mockImplementation(
        async () => {
          await manager.handleTokenAcquired({
            accountId: azureAccountId,
            tokenResult,
          });
          return tokenResult;
        },
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

    it('should skip re-auth for clients that already have current token', async () => {
      const azureAccountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const clientWithCurrentToken = createMockClient(tokenResult.expiresOn);
      const clientWithOldToken = createMockClient(
        new Date(Date.now() - 60 * 60 * 1000),
      );

      mockAzureAuthService.getRedisTokenByAccountId.mockImplementation(
        async () => {
          await manager.handleTokenAcquired({
            accountId: azureAccountId,
            tokenResult,
          });
          return tokenResult;
        },
      );
      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        clientWithCurrentToken,
        clientWithOldToken,
      ]);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      // Client with current token should NOT be re-authenticated
      expect(clientWithCurrentToken.call).not.toHaveBeenCalled();
      // Client with old token should be re-authenticated
      expect(clientWithOldToken.call).toHaveBeenCalledWith([
        'AUTH',
        tokenResult.account.localAccountId,
        tokenResult.token,
      ]);
    });

    it('should update tokenExpiresOn after successful re-auth', async () => {
      const azureAccountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const mockClient = createMockClient();

      mockAzureAuthService.getRedisTokenByAccountId.mockImplementation(
        async () => {
          await manager.handleTokenAcquired({
            accountId: azureAccountId,
            tokenResult,
          });
          return tokenResult;
        },
      );
      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        mockClient,
      ]);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      expect(mockClient.database.providerDetails.tokenExpiresOn).toBe(
        tokenResult.expiresOn,
      );
    });

    it('should skip all re-auth when all clients have current token', async () => {
      const azureAccountId = faker.string.uuid();
      const tokenResult = createMockTokenResult();
      const client1 = createMockClient(tokenResult.expiresOn);
      const client2 = createMockClient(tokenResult.expiresOn);

      mockAzureAuthService.getRedisTokenByAccountId.mockImplementation(
        async () => {
          await manager.handleTokenAcquired({
            accountId: azureAccountId,
            tokenResult,
          });
          return tokenResult;
        },
      );
      mockRedisClientStorage.getClientsByDatabaseField.mockReturnValue([
        client1,
        client2,
      ]);

      const expiresOn = new Date(Date.now() + TOKEN_REFRESH_BUFFER_MS + 1000);
      manager.scheduleRefresh(azureAccountId, expiresOn);

      await jest.advanceTimersByTimeAsync(1000);

      expect(client1.call).not.toHaveBeenCalled();
      expect(client2.call).not.toHaveBeenCalled();
    });
  });
});
