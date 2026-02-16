import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { AzureAutodiscoveryService } from './azure-autodiscovery.service';
import { AzureAutodiscoveryAnalytics } from './azure-autodiscovery.analytics';
import { AzureAuthService } from '../auth/azure-auth.service';
import { DatabaseService } from 'src/modules/database/database.service';
import {
  AzureRedisType,
  AzureAuthType,
  AzureSubscriptionState,
  AzureProvisioningState,
} from '../constants';
import { AzureRedisDatabase } from '../models';
import { ActionStatus } from 'src/common/models';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { CloudProvider } from 'src/modules/database/models/provider-details';
import ERROR_MESSAGES from 'src/constants/error-messages';

jest.mock('axios');

const mockDatabaseService = {
  create: jest.fn(),
};

const mockAnalytics = {
  sendAzureDatabaseAdded: jest.fn(),
  sendAzureDatabaseAddFailed: jest.fn(),
};

const mockedAxios = axios as jest.Mocked<typeof axios>;

const createMockAccount = () => ({
  homeAccountId: faker.string.uuid(),
  localAccountId: faker.string.uuid(),
  environment: 'login.microsoftonline.com',
  tenantId: faker.string.uuid(),
  username: faker.internet.email(),
  name: faker.person.fullName(),
});

const createMockSubscription = () => ({
  subscriptionId: faker.string.uuid(),
  displayName: faker.company.name(),
  state: AzureSubscriptionState.Enabled,
});

const createMockStandardRedis = (subscriptionId: string) => {
  const name = faker.word.noun();
  const resourceGroup = faker.word.noun();
  return {
    id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Cache/redis/${name}`,
    name,
    location: faker.location.city(),
    properties: {
      hostName: `${name}.redis.cache.windows.net`,
      port: 6379,
      sslPort: 6380,
      provisioningState: AzureProvisioningState.Succeeded,
      sku: { name: 'Basic', family: 'C', capacity: 0 },
    },
  };
};

const createMockEnterpriseCluster = (subscriptionId: string) => {
  const name = faker.word.noun();
  const resourceGroup = faker.word.noun();
  return {
    id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Cache/redisEnterprise/${name}`,
    name,
    location: 'East US',
    sku: { name: 'Enterprise_E10' },
  };
};

const createMockEnterpriseDatabase = (
  subscriptionId: string,
  resourceGroup: string,
  clusterName: string,
) => ({
  id: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Cache/redisEnterprise/${clusterName}/databases/default`,
  name: 'default',
  properties: {
    port: 10000,
    provisioningState: AzureProvisioningState.Succeeded,
  },
});

const createMockDatabase = (
  type: AzureRedisType = AzureRedisType.Standard,
): AzureRedisDatabase => {
  const subscriptionId = faker.string.uuid();
  const resourceGroup = faker.word.noun();
  const name = faker.word.noun();
  const provider =
    type === AzureRedisType.Standard
      ? 'Microsoft.Cache/redis'
      : 'Microsoft.Cache/redisEnterprise';
  const id = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/${provider}/${name}`;

  return {
    id,
    name,
    subscriptionId,
    resourceGroup,
    location: faker.location.city(),
    type,
    host: faker.internet.domainName(),
    port: type === AzureRedisType.Standard ? 6379 : 10000,
    sslPort: type === AzureRedisType.Standard ? 6380 : undefined,
    provisioningState: AzureProvisioningState.Succeeded,
  };
};

// Helper to create raw API response that maps to the database
const createStandardRedisApiResponse = (database: AzureRedisDatabase) => ({
  id: database.id,
  name: database.name,
  location: database.location,
  properties: {
    hostName: database.host,
    port: database.port,
    sslPort: database.sslPort,
    provisioningState: database.provisioningState,
    sku: database.sku,
  },
});

describe('AzureAutodiscoveryService', () => {
  let service: AzureAutodiscoveryService;
  let mockAuthService: jest.Mocked<AzureAuthService>;
  let mockAxiosInstance: {
    get: jest.Mock;
    post: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    mockAuthService = {
      getManagementTokenByAccountId: jest.fn(),
      getRedisTokenByAccountId: jest.fn(),
    } as unknown as jest.Mocked<AzureAuthService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureAutodiscoveryService,
        { provide: AzureAuthService, useValue: mockAuthService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: AzureAutodiscoveryAnalytics, useValue: mockAnalytics },
      ],
    }).compile();

    service = module.get<AzureAutodiscoveryService>(AzureAutodiscoveryService);
  });

  describe('listSubscriptions', () => {
    it('should throw error when no token available', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue(null);

      await expect(service.listSubscriptions('account-id')).rejects.toThrow(
        'Failed to get authenticated client',
      );
    });

    it('should return subscriptions on success', async () => {
      const mockSubs = [createMockSubscription(), createMockSubscription()];
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get.mockResolvedValue({ data: { value: mockSubs } });

      const result = await service.listSubscriptions('account-id');

      expect(result).toHaveLength(2);
      expect(result[0].subscriptionId).toBe(mockSubs[0].subscriptionId);
      expect(result[0].displayName).toBe(mockSubs[0].displayName);
    });

    it('should throw error on API error', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get.mockRejectedValue(new Error('API error'));

      await expect(service.listSubscriptions('account-id')).rejects.toThrow(
        'API error',
      );
    });

    it('should handle paginated responses', async () => {
      const mockSubsPage1 = [
        createMockSubscription(),
        createMockSubscription(),
      ];
      const mockSubsPage2 = [createMockSubscription()];
      const nextLink =
        'https://management.azure.com/subscriptions?$skiptoken=abc123';

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: mockSubsPage1, nextLink } })
        .mockResolvedValueOnce({ data: { value: mockSubsPage2 } });

      const result = await service.listSubscriptions('account-id');

      expect(result).toHaveLength(3);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(2, nextLink);
    });
  });

  describe('listDatabasesInSubscription', () => {
    const subscriptionId = faker.string.uuid();

    it('should throw error when subscription ID is invalid', async () => {
      await expect(
        service.listDatabasesInSubscription('account-id', 'invalid-sub-id'),
      ).rejects.toThrow('Invalid subscription ID format');
      expect(
        mockAuthService.getManagementTokenByAccountId,
      ).not.toHaveBeenCalled();
    });

    it('should throw error when no token available', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue(null);

      await expect(
        service.listDatabasesInSubscription('account-id', subscriptionId),
      ).rejects.toThrow('Failed to get authenticated client');
    });

    it('should return standard Redis databases', async () => {
      const mockRedis = createMockStandardRedis(subscriptionId);
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [mockRedis] } })
        .mockResolvedValueOnce({ data: { value: [] } });

      const result = await service.listDatabasesInSubscription(
        'account-id',
        subscriptionId,
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(AzureRedisType.Standard);
      expect(result[0].name).toBe(mockRedis.name);
    });

    it('should return enterprise Redis databases', async () => {
      const mockCluster = createMockEnterpriseCluster(subscriptionId);
      const resourceGroup = mockCluster.id.match(
        /resourceGroups\/([^/]+)/i,
      )?.[1];
      const mockDb = createMockEnterpriseDatabase(
        subscriptionId,
        resourceGroup!,
        mockCluster.name,
      );

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [mockCluster] } })
        .mockResolvedValueOnce({ data: { value: [mockDb] } });

      const result = await service.listDatabasesInSubscription(
        'account-id',
        subscriptionId,
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(AzureRedisType.Enterprise);
      expect(result[0].name).toBe(`${mockCluster.name}/default`);
    });

    it('should throw error on API error', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get.mockRejectedValue(new Error('API error'));

      await expect(
        service.listDatabasesInSubscription('account-id', subscriptionId),
      ).rejects.toThrow('API error');
    });
  });

  describe('getConnectionDetails', () => {
    it('should throw error when no token available', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue(null);
      const database = createMockDatabase();

      await expect(
        service.getConnectionDetails('account-id', database.id),
      ).rejects.toThrow('Failed to get authenticated client');
    });

    it('should return Entra ID connection details when Redis token available', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);
      const mockAccount = createMockAccount();
      const apiResponse = createStandardRedisApiResponse(database);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      // Mock get calls for listDatabasesInSubscription (standard + enterprise)
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [apiResponse] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'redis-token',
        expiresOn: new Date(),
        account: mockAccount,
      });

      const result = await service.getConnectionDetails(
        'account-id',
        database.id,
      );

      expect(result).not.toBeNull();
      expect(result!.authType).toBe(AzureAuthType.EntraId);
      expect(result!.username).toBe(mockAccount.localAccountId);
      expect(result!.azureAccountId).toBe('account-id');
      expect(result!.port).toBe(database.sslPort);
    });

    it('should return null when Entra ID token is not available', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);
      const apiResponse = createStandardRedisApiResponse(database);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      // Mock get calls for listDatabasesInSubscription (standard + enterprise)
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [apiResponse] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      // Entra ID token not available
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue(null);

      const result = await service.getConnectionDetails(
        'account-id',
        database.id,
      );

      expect(result).toBeNull();
    });

    it('should return null when database is not found', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      // Mock get calls to return empty lists (database not found)
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [] } });

      const result = await service.getConnectionDetails(
        'account-id',
        database.id,
      );

      expect(result).toBeNull();
    });

    it('should return null when resource ID format is invalid', async () => {
      const invalidDatabaseId = 'invalid-resource-id';

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });

      const result = await service.getConnectionDetails(
        'account-id',
        invalidDatabaseId,
      );

      expect(result).toBeNull();
    });

    it('should find database with case-insensitive resource ID comparison', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);
      const mockAccount = createMockAccount();
      const apiResponse = createStandardRedisApiResponse(database);
      // Use different casing for the resource ID
      const differentCaseId = database.id.toUpperCase();

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [apiResponse] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'redis-token',
        expiresOn: new Date(),
        account: mockAccount,
      });

      const result = await service.getConnectionDetails(
        'account-id',
        differentCaseId,
      );

      expect(result).not.toBeNull();
      expect(result!.authType).toBe(AzureAuthType.EntraId);
    });
  });

  describe('addDatabases', () => {
    const accountId = 'account-id';
    const sessionMetadata = {
      userId: 'user-id',
      sessionId: 'session-id',
      accountId: 'session-account-id',
    };

    beforeEach(() => {
      mockDatabaseService.create.mockReset();
    });

    it('should successfully add a standard Redis database', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);
      const mockAccount = createMockAccount();
      const apiResponse = createStandardRedisApiResponse(database);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [apiResponse] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'redis-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockDatabaseService.create.mockResolvedValue({ id: 'new-db-id' });

      const result = await service.addDatabases(sessionMetadata, accountId, [
        { id: database.id },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(database.id);
      expect(result[0].status).toBe(ActionStatus.Success);
      expect(result[0].message).toBeUndefined();
      expect(mockDatabaseService.create).toHaveBeenCalledWith(
        sessionMetadata,
        expect.objectContaining({
          host: database.host,
          port: database.sslPort,
          name: database.name,
          tls: true,
          provider: HostingProvider.AZURE_CACHE,
          providerDetails: {
            provider: CloudProvider.Azure,
            authType: AzureAuthType.EntraId,
            azureAccountId: accountId,
          },
        }),
      );
    });

    it('should successfully add an enterprise Redis database', async () => {
      const subscriptionId = faker.string.uuid();
      const mockCluster = createMockEnterpriseCluster(subscriptionId);
      const resourceGroup = mockCluster.id.match(
        /resourceGroups\/([^/]+)/i,
      )?.[1];
      const mockDb = createMockEnterpriseDatabase(
        subscriptionId,
        resourceGroup!,
        mockCluster.name,
      );
      const mockAccount = createMockAccount();

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      // Mock: empty standard, then cluster, then database within cluster
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [mockCluster] } })
        .mockResolvedValueOnce({ data: { value: [mockDb] } });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'redis-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockDatabaseService.create.mockResolvedValue({ id: 'new-db-id' });

      const result = await service.addDatabases(sessionMetadata, accountId, [
        { id: mockDb.id },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(ActionStatus.Success);
      expect(mockDatabaseService.create).toHaveBeenCalledWith(
        sessionMetadata,
        expect.objectContaining({
          provider: HostingProvider.AZURE_CACHE_REDIS_ENTERPRISE,
        }),
      );
    });

    it('should return fail status when database is not found', async () => {
      const testSubscriptionId = faker.string.uuid();
      const databaseId = `/subscriptions/${testSubscriptionId}/resourceGroups/rg/providers/Microsoft.Cache/redis/not-found`;

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [] } });

      const result = await service.addDatabases(sessionMetadata, accountId, [
        { id: databaseId },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(databaseId);
      expect(result[0].status).toBe(ActionStatus.Fail);
      expect(result[0].message).toBe(ERROR_MESSAGES.AZURE_DATABASE_NOT_FOUND);
      expect(mockDatabaseService.create).not.toHaveBeenCalled();
    });

    it('should return fail status when connection details are not available', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);
      const apiResponse = createStandardRedisApiResponse(database);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [apiResponse] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue(null);

      const result = await service.addDatabases(sessionMetadata, accountId, [
        { id: database.id },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(ActionStatus.Fail);
      expect(result[0].message).toBe(
        ERROR_MESSAGES.AZURE_FAILED_TO_GET_CONNECTION_DETAILS,
      );
      expect(mockDatabaseService.create).not.toHaveBeenCalled();
    });

    it('should return fail status with user-friendly error message on creation error', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);
      const mockAccount = createMockAccount();
      const apiResponse = createStandardRedisApiResponse(database);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [apiResponse] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'redis-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockDatabaseService.create.mockRejectedValue(
        new Error('WRONGPASS invalid username-password pair'),
      );

      const result = await service.addDatabases(sessionMetadata, accountId, [
        { id: database.id },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(ActionStatus.Fail);
      expect(result[0].message).toBe(ERROR_MESSAGES.AZURE_ENTRA_ID_AUTH_FAILED);
    });

    it('should handle multiple databases with mixed results', async () => {
      const database1 = createMockDatabase(AzureRedisType.Standard);
      const database2 = createMockDatabase(AzureRedisType.Standard);
      const mockAccount = createMockAccount();
      const apiResponse1 = createStandardRedisApiResponse(database1);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      // First database found, second not found
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { value: [apiResponse1] } })
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'redis-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockDatabaseService.create.mockResolvedValue({ id: 'new-db-id' });

      const result = await service.addDatabases(sessionMetadata, accountId, [
        { id: database1.id },
        { id: database2.id },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(ActionStatus.Success);
      expect(result[1].status).toBe(ActionStatus.Fail);
      expect(result[1].message).toBe(ERROR_MESSAGES.AZURE_DATABASE_NOT_FOUND);
    });
  });
});
