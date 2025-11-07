import * as utils from 'src/utils';
import { getAvailableEndpoints } from 'src/modules/database-discovery/utils/autodiscovery.util';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAutodiscoveryEndpoint,
  mockDatabase,
  mockDatabaseService,
  mockRedisClientFactory,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { AutoDatabaseDiscoveryService } from 'src/modules/database-discovery/auto.database-discovery.service';
import { DatabaseService } from 'src/modules/database/database.service';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { mockConstantsProvider } from 'src/__mocks__/constants';

jest.mock(
  'src/modules/database-discovery/utils/autodiscovery.util',
  jest.fn(() => ({
    ...(jest.requireActual(
      'src/modules/database-discovery/utils/autodiscovery.util',
    ) as object),
    __esModule: true,
    getAvailableEndpoints: jest.fn(),
  })),
);

jest.mock(
  'src/utils',
  jest.fn(() => ({
    ...(jest.requireActual('src/utils') as object),
    __esModule: true,
    convertRedisInfoReplyToObject: jest.fn(),
  })),
);

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

describe('AutoDatabaseDiscoveryService', () => {
  let service: AutoDatabaseDiscoveryService;
  let databaseService: MockType<DatabaseService>;
  let redisClientFactory: MockType<RedisClientFactory>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoDatabaseDiscoveryService,
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: RedisClientFactory,
          useFactory: mockRedisClientFactory,
        },
        {
          provide: ConstantsProvider,
          useFactory: mockConstantsProvider,
        },
      ],
    }).compile();

    service = module.get(AutoDatabaseDiscoveryService);
    databaseService = module.get(DatabaseService);
    redisClientFactory = module.get(RedisClientFactory);

    (utils.convertRedisInfoReplyToObject as jest.Mock).mockReturnValue({
      server: {
        redis_mode: 'standalone',
      },
    });
  });

  describe('discover', () => {
    let addRedisDatabaseSpy: jest.SpyInstance;

    beforeEach(async () => {
      (getAvailableEndpoints as jest.Mock).mockResolvedValue([]);
      addRedisDatabaseSpy = jest.spyOn(service as any, 'addRedisDatabase');
      addRedisDatabaseSpy.mockResolvedValue(null);
    });

    it('should not call addRedisDatabase when no endpoints found', async () => {
      await service.discover(mockSessionMetadata);

      expect(addRedisDatabaseSpy).toHaveBeenCalledTimes(0);
    });

    it('should call addRedisDatabase 2 times', async () => {
      (getAvailableEndpoints as jest.Mock).mockResolvedValueOnce([
        mockAutodiscoveryEndpoint,
        mockAutodiscoveryEndpoint,
      ]);
      databaseService.list.mockResolvedValue([]);

      await service.discover(mockSessionMetadata);

      expect(addRedisDatabaseSpy).toHaveBeenCalledTimes(2);
      expect(addRedisDatabaseSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockAutodiscoveryEndpoint,
      );
    });

    it('should not call addRedisDatabase when there existing databases', async () => {
      databaseService.list.mockResolvedValue([mockDatabase]);

      await service.discover(mockSessionMetadata);

      expect(addRedisDatabaseSpy).not.toHaveBeenCalled();
      expect(getAvailableEndpoints as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe('addRedisDatabase', () => {
    it('should create database if redis_mode is standalone', async () => {
      redisClientFactory.createClient.mockResolvedValue({
        getInfo: async () => ({
          server: {
            redis_mode: 'standalone',
          },
        }),
      });

      await service['addRedisDatabase'](
        mockSessionMetadata,
        mockAutodiscoveryEndpoint,
      );

      expect(databaseService.create).toHaveBeenCalledTimes(1);
      expect(databaseService.create).toHaveBeenCalledWith(mockSessionMetadata, {
        name: `${mockAutodiscoveryEndpoint.host}:${mockAutodiscoveryEndpoint.port}`,
        ...mockAutodiscoveryEndpoint,
      });
    });

    it('should not create database if redis_mode is not standalone', async () => {
      redisClientFactory.createClient.mockResolvedValue({
        getInfo: async () => ({
          server: {
            redis_mode: 'cluster',
          },
        }),
      });

      await service['addRedisDatabase'](
        mockSessionMetadata,
        mockAutodiscoveryEndpoint,
      );

      expect(databaseService.create).toHaveBeenCalledTimes(0);
    });

    it('should not fail in case of an error', async () => {
      redisClientFactory.createClient.mockRejectedValue(new Error());

      await service['addRedisDatabase'](
        mockSessionMetadata,
        mockAutodiscoveryEndpoint,
      );

      expect(databaseService.create).toHaveBeenCalledTimes(0);
    });
  });
});
