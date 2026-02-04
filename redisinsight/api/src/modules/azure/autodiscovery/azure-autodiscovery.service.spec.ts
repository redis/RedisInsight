import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { AzureAutodiscoveryService } from './azure-autodiscovery.service';
import { AzureAuthService } from '../auth/azure-auth.service';
import { DatabaseService } from 'src/modules/database/database.service';
import { AzureRedisType, AzureAuthType } from '../constants';
import { AzureRedisDatabase } from '../models';

jest.mock('axios');

const mockDatabaseService = {
  create: jest.fn(),
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
  state: 'Enabled',
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
      provisioningState: 'Succeeded',
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
    provisioningState: 'Succeeded',
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
    provisioningState: 'Succeeded',
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
      ],
    }).compile();

    service = module.get<AzureAutodiscoveryService>(AzureAutodiscoveryService);
  });

  describe('listSubscriptions', () => {
    it('should return empty array when no token available', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue(null);

      const result = await service.listSubscriptions('account-id');

      expect(result).toEqual([]);
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

    it('should return empty array on API error', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get.mockRejectedValue(new Error('API error'));

      const result = await service.listSubscriptions('account-id');

      expect(result).toEqual([]);
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

    it('should return empty array when subscription ID is invalid', async () => {
      const result = await service.listDatabasesInSubscription(
        'account-id',
        'invalid-subscription-id',
      );

      expect(result).toEqual([]);
      expect(
        mockAuthService.getManagementTokenByAccountId,
      ).not.toHaveBeenCalled();
    });

    it('should return empty array when no token available', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue(null);

      const result = await service.listDatabasesInSubscription(
        'account-id',
        subscriptionId,
      );

      expect(result).toEqual([]);
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

    it('should return empty array on API error', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.get.mockRejectedValue(new Error('API error'));

      const result = await service.listDatabasesInSubscription(
        'account-id',
        subscriptionId,
      );

      expect(result).toEqual([]);
    });
  });

  describe('getConnectionDetails', () => {
    it('should return null when no token available', async () => {
      mockAuthService.getManagementTokenByAccountId.mockResolvedValue(null);
      const database = createMockDatabase();

      const result = await service.getConnectionDetails(
        'account-id',
        database.id,
      );

      expect(result).toBeNull();
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
});
