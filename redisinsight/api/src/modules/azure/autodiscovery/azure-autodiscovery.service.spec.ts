import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { AzureAutodiscoveryService } from './azure-autodiscovery.service';
import { AzureAuthService } from '../auth/azure-auth.service';
import {
  AzureRedisType,
  AzureAuthType,
  AzureAccessKeysStatus,
} from '../constants';
import { AzureRedisDatabase } from '../models';

jest.mock('axios');

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
    accessKeysAuthentication: AzureAccessKeysStatus.Enabled,
  },
});

const createMockDatabase = (
  type: AzureRedisType = AzureRedisType.Standard,
): AzureRedisDatabase => ({
  id: faker.string.uuid(),
  name: faker.word.noun(),
  subscriptionId: faker.string.uuid(),
  resourceGroup: faker.word.noun(),
  location: faker.location.city(),
  type,
  host: faker.internet.domainName(),
  port: type === AzureRedisType.Standard ? 6379 : 10000,
  sslPort: type === AzureRedisType.Standard ? 6380 : undefined,
  provisioningState: 'Succeeded',
  accessKeysAuthentication:
    type === AzureRedisType.Enterprise
      ? AzureAccessKeysStatus.Enabled
      : undefined,
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
  });

  describe('listDatabasesInSubscription', () => {
    const subscriptionId = faker.string.uuid();

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

      const result = await service.getConnectionDetails('account-id', database);

      expect(result).toBeNull();
    });

    it('should return access key connection details for standard Redis', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);
      const primaryKey = faker.string.alphanumeric(44);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.post.mockResolvedValue({
        data: { primaryKey },
      });

      const result = await service.getConnectionDetails('account-id', database);

      expect(result).not.toBeNull();
      expect(result!.authType).toBe(AzureAuthType.AccessKey);
      expect(result!.password).toBe(primaryKey);
      expect(result!.port).toBe(database.sslPort);
    });

    it('should return access key connection details for enterprise Redis with keys enabled', async () => {
      const database = createMockDatabase(AzureRedisType.Enterprise);
      database.name = 'cluster-name/default';
      database.accessKeysAuthentication = AzureAccessKeysStatus.Enabled;
      const primaryKey = faker.string.alphanumeric(44);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.post.mockResolvedValue({
        data: { keys: [{ value: primaryKey }] },
      });

      const result = await service.getConnectionDetails('account-id', database);

      expect(result).not.toBeNull();
      expect(result!.authType).toBe(AzureAuthType.AccessKey);
      expect(result!.password).toBe(primaryKey);
    });

    it('should return Entra ID connection details for enterprise Redis with keys disabled', async () => {
      const database = createMockDatabase(AzureRedisType.Enterprise);
      database.accessKeysAuthentication = AzureAccessKeysStatus.Disabled;
      const mockAccount = createMockAccount();

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: mockAccount,
      });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue({
        token: 'redis-token',
        expiresOn: new Date(),
        account: mockAccount,
      });

      const result = await service.getConnectionDetails('account-id', database);

      expect(result).not.toBeNull();
      expect(result!.authType).toBe(AzureAuthType.EntraId);
      expect(result!.username).toBe(mockAccount.localAccountId);
      expect(result!.azureAccountId).toBe('account-id');
    });

    it('should return null when Redis token not available for Entra ID auth', async () => {
      const database = createMockDatabase(AzureRedisType.Enterprise);
      database.accessKeysAuthentication = AzureAccessKeysStatus.Disabled;

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAuthService.getRedisTokenByAccountId.mockResolvedValue(null);

      const result = await service.getConnectionDetails('account-id', database);

      expect(result).toBeNull();
    });

    it('should return null when access key fetch fails', async () => {
      const database = createMockDatabase(AzureRedisType.Standard);

      mockAuthService.getManagementTokenByAccountId.mockResolvedValue({
        token: 'mock-token',
        expiresOn: new Date(),
        account: createMockAccount(),
      });
      mockAxiosInstance.post.mockRejectedValue(new Error('API error'));

      const result = await service.getConnectionDetails('account-id', database);

      expect(result).toBeNull();
    });
  });
});
