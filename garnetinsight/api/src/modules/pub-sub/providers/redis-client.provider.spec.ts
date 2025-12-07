import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCommonClientMetadata,
  mockDatabaseClientFactory,
} from 'src/__mocks__';
import { RedisClientProvider } from 'src/modules/pub-sub/providers/redis-client.provider';
import { RedisClientSubscriber } from 'src/modules/pub-sub/model/redis-client-subscriber';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('RedisClientProvider', () => {
  let service: RedisClientProvider;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisClientProvider,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = await module.get(RedisClientProvider);
  });

  describe('createClient', () => {
    it('should create redis client', async () => {
      const redisClientSubscriber = service.createClient(
        mockCommonClientMetadata,
      );
      expect(redisClientSubscriber).toBeInstanceOf(RedisClientSubscriber);
    });
  });
});
