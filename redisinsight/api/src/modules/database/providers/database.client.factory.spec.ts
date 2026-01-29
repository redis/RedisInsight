import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCommonClientMetadata,
  mockCredentialProvider,
  mockDatabase,
  mockDatabaseAnalytics,
  mockDatabaseRepository,
  mockDatabaseService,
  MockType,
  mockRedisClientFactory,
  mockStandaloneRedisClient,
  mockSessionMetadata,
  MockRedisClient,
  mockEventEmitter,
} from 'src/__mocks__';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { v4 as uuidv4 } from 'uuid';
import { LocalRedisClientFactory } from 'src/modules/redis/local.redis.client.factory';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import {
  mockIoRedisRedisConnectionStrategy,
  mockNodeRedisConnectionStrategy,
} from 'src/__mocks__/redis-client';
import { RedisClient } from 'src/modules/redis/client';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { RedisConnectionTimeoutException } from 'src/modules/redis/exceptions/connection';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseConnectionEvent } from 'src/modules/database/constants/events';
import { InternalServerErrorException } from '@nestjs/common';
import { CredentialStrategyProvider } from 'src/modules/database/credentials';

describe('DatabaseClientFactory', () => {
  let service: DatabaseClientFactory;
  let databaseService: MockType<DatabaseService>;
  let databaseRepository: MockType<DatabaseRepository>;
  let redisClientStorage: RedisClientStorage;
  let redisClientFactory: LocalRedisClientFactory;
  let analytics: MockType<DatabaseAnalytics>;
  let eventEmitter: MockType<EventEmitter2>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseClientFactory,
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: DatabaseRepository,
          useFactory: mockDatabaseRepository,
        },
        {
          provide: DatabaseAnalytics,
          useFactory: mockDatabaseAnalytics,
        },
        RedisClientStorage,
        {
          provide: RedisClientFactory,
          useClass: mockRedisClientFactory,
        },
        {
          provide: IoredisRedisConnectionStrategy,
          useFactory: mockIoRedisRedisConnectionStrategy,
        },
        {
          provide: NodeRedisConnectionStrategy,
          useFactory: mockNodeRedisConnectionStrategy,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: CredentialStrategyProvider,
          useFactory: mockCredentialProvider,
        },
      ],
    }).compile();

    service = await module.get(DatabaseClientFactory);
    databaseService = await module.get(DatabaseService);
    databaseRepository = await module.get(DatabaseRepository);
    redisClientStorage = await module.get(RedisClientStorage);
    redisClientFactory = await module.get(RedisClientFactory);
    analytics = await module.get(DatabaseAnalytics);
    eventEmitter = await module.get(EventEmitter2);
  });

  describe('getOrCreateClient', () => {
    it('should get existing client', async () => {
      const spyOnGetByMetadata = jest
        .spyOn(redisClientStorage, 'getByMetadata')
        .mockResolvedValueOnce(mockStandaloneRedisClient);
      const spyOnSet = jest.spyOn(redisClientStorage, 'set');

      expect(await service.getOrCreateClient(mockCommonClientMetadata)).toEqual(
        mockStandaloneRedisClient,
      );
      expect(spyOnGetByMetadata).toHaveBeenCalledWith(mockCommonClientMetadata);
      expect(spyOnSet).not.toHaveBeenCalled();
    });

    it('should create new and save it client', async () => {
      const spyOnGetByMetadata = jest
        .spyOn(redisClientStorage, 'getByMetadata')
        .mockResolvedValueOnce(null);
      const spyOnSet = jest.spyOn(redisClientStorage, 'set');

      const result = await service.getOrCreateClient(mockCommonClientMetadata);
      expect(result).toBeInstanceOf(RedisClient);
      expect(result.clientMetadata.sessionMetadata).toBe(mockSessionMetadata);
      expect(spyOnGetByMetadata).toHaveBeenCalledWith(mockCommonClientMetadata);
      expect(spyOnSet).toHaveBeenCalledWith(result);
    });

    it('should only instantiate a single client per unique client metadata', async () => {
      const mockClientMetadata2: ClientMetadata = {
        sessionMetadata: {
          userId: 'user-4',
          accountId: 'acc-4',
          sessionId: uuidv4(),
        },
        databaseId: uuidv4(),
        context: ClientContext.Common,
      };

      const clients1 = await Promise.all([
        service.getOrCreateClient(mockCommonClientMetadata),
        service.getOrCreateClient(mockCommonClientMetadata),
        service.getOrCreateClient(mockCommonClientMetadata),
      ]);

      // assert that all returned clients are the same instance
      let currentClient = clients1.shift();
      expect(currentClient).toBeInstanceOf(MockRedisClient);
      expect(currentClient.clientMetadata).toEqual(mockCommonClientMetadata);
      while (clients1.length) {
        expect(currentClient).toBe(clients1[0]);
        currentClient = clients1.shift();
      }

      // test with a separate user/metadata
      const clients2 = await Promise.all([
        service.getOrCreateClient(mockClientMetadata2),
        service.getOrCreateClient(mockClientMetadata2),
        service.getOrCreateClient(mockClientMetadata2),
      ]);
      currentClient = clients2.shift();
      expect(currentClient).toBeInstanceOf(MockRedisClient);
      expect(currentClient.clientMetadata).toEqual(mockClientMetadata2);
      while (clients2.length) {
        expect(currentClient).toBe(clients2[0]);
        currentClient = clients2.shift();
      }

      expect(redisClientFactory.createClient).toHaveBeenCalledTimes(2);
    });

    it('should reject multiple failed calls with the same error instance', async () => {
      const mockCommonClientMetadata2: ClientMetadata = {
        sessionMetadata: {
          userId: 'user-4',
          accountId: 'acc-4',
          sessionId: uuidv4(),
        },
        databaseId: uuidv4(),
        context: ClientContext.Common,
      };
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const createClientSpy = jest
        .spyOn(service, 'createClient')
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              reject(error1);
            }),
        )
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              reject(error2);
            }),
        );

      const clients = await Promise.all([
        service
          .getOrCreateClient(mockCommonClientMetadata)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata2)
          .catch((err) => ({ error: err })),
        service
          .getOrCreateClient(mockCommonClientMetadata2)
          .catch((err) => ({ error: err })),
      ]);

      expect(createClientSpy).toHaveBeenCalledTimes(2);

      for (let a = 0; a < 3; a += 1) {
        const resp = clients[a] as { error?: any };
        expect(resp.error).toBe(error1);
      }
      for (let a = 3; a < clients.length; a += 1) {
        const resp = clients[a] as { error?: any };
        expect(resp.error).toBe(error2);
      }
    });
  });

  describe('createClient', () => {
    it('should create new client and not update connection type', async () => {
      jest
        .spyOn(redisClientFactory, 'createClient')
        .mockResolvedValueOnce(mockStandaloneRedisClient);
      expect(await service.createClient(mockCommonClientMetadata)).toEqual(
        mockStandaloneRedisClient,
      );
      expect(databaseService.get).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCommonClientMetadata.databaseId,
      );
      expect(databaseRepository.update).not.toHaveBeenCalled();
    });
    it('should create new client and update connection type (first connection)', async () => {
      jest
        .spyOn(redisClientFactory, 'createClient')
        .mockResolvedValueOnce(mockStandaloneRedisClient);
      databaseService.get.mockResolvedValueOnce({
        ...mockDatabase,
        connectionType: ConnectionType.NOT_CONNECTED,
      });
      expect(await service.createClient(mockCommonClientMetadata)).toEqual(
        mockStandaloneRedisClient,
      );
      expect(databaseService.get).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCommonClientMetadata.databaseId,
      );
      expect(databaseRepository.update).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCommonClientMetadata.databaseId,
        {
          connectionType: mockDatabase.connectionType,
        },
      );
    });

    it('should throw original error and emit connection failed event for RedisConnection* errors', async () => {
      jest
        .spyOn(redisClientFactory, 'createClient')
        .mockRejectedValue(new RedisConnectionTimeoutException());
      await expect(
        service.createClient(mockCommonClientMetadata),
      ).rejects.toThrow(RedisConnectionTimeoutException);
      expect(analytics.sendConnectionFailedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabase,
        new RedisConnectionTimeoutException(),
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        DatabaseConnectionEvent.DatabaseConnectionFailed,
        mockCommonClientMetadata,
      );
    });

    it('should throw original error and not emit connection failed when not RedisConnection* errors', async () => {
      jest
        .spyOn(redisClientFactory, 'createClient')
        .mockRejectedValue(new InternalServerErrorException());
      await expect(
        service.createClient(mockCommonClientMetadata),
      ).rejects.toThrow(InternalServerErrorException);
      expect(analytics.sendConnectionFailedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabase,
        new InternalServerErrorException(),
      );

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
