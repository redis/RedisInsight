import {
  mockRedisSentinelUtilModule,
  mockRedisSentinelUtil,
} from 'src/__mocks__/redis-utils';

jest.doMock(
  'src/modules/redis/utils/sentinel.util',
  mockRedisSentinelUtilModule,
);

import { Test, TestingModule } from '@nestjs/testing';
import {
  mockConstantsProvider,
  mockDatabaseFactory,
  mockDatabaseService,
  mockIORedisClient,
  mockRedisClientFactory,
  mockRedisSentinelAnalytics,
  mockRedisSentinelMasterResponse,
  mockSentinelDatabaseWithTlsAuth,
  mockSentinelMasterDto,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { RedisSentinelService } from 'src/modules/redis-sentinel/redis-sentinel.service';
import { RedisSentinelAnalytics } from 'src/modules/redis-sentinel/redis-sentinel.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { RedisConnectionIncorrectCertificateException } from 'src/modules/redis/exceptions/connection';

describe('RedisSentinelService', () => {
  let service: RedisSentinelService;
  let redisClientFactory: MockType<RedisClientFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisSentinelService,
        {
          provide: RedisSentinelAnalytics,
          useFactory: mockRedisSentinelAnalytics,
        },
        {
          provide: RedisClientFactory,
          useFactory: mockRedisClientFactory,
        },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: DatabaseFactory,
          useFactory: mockDatabaseFactory,
        },
        {
          provide: ConstantsProvider,
          useFactory: mockConstantsProvider,
        },
      ],
    }).compile();

    service = module.get(RedisSentinelService);
    redisClientFactory = module.get(RedisClientFactory);
  });

  describe('getSentinelMasters', () => {
    it('connect and get sentinel masters', async () => {
      redisClientFactory
        .getConnectionStrategy()
        .createStandaloneClient.mockResolvedValue(mockIORedisClient);
      mockIORedisClient.call.mockResolvedValue(mockRedisSentinelMasterResponse);
      mockRedisSentinelUtil.discoverSentinelMasterGroups.mockResolvedValue([
        mockSentinelMasterDto,
      ]);

      const result = await service.getSentinelMasters(
        mockSessionMetadata,
        mockSentinelDatabaseWithTlsAuth,
      );

      expect(result).toEqual([mockSentinelMasterDto]);
      expect(mockIORedisClient.disconnect).toHaveBeenCalled();
    });

    it('failed connection to the redis database', async () => {
      redisClientFactory
        .getConnectionStrategy()
        .createStandaloneClient.mockRejectedValue(
          new RedisConnectionIncorrectCertificateException(),
        );

      await expect(
        service.getSentinelMasters(
          mockSessionMetadata,
          mockSentinelDatabaseWithTlsAuth,
        ),
      ).rejects.toThrow(RedisConnectionIncorrectCertificateException);
    });
  });
});
