import { Test, TestingModule } from '@nestjs/testing';
import {
  mockClientMetadata,
  mockClusterDatabaseWithTlsAuth,
  mockClusterRedisClient,
  mockConstantsProvider,
  mockDatabase,
  mockFeatureRedisClient,
  mockFeatureService,
  mockIoRedisRedisConnectionStrategy,
  mockNodeRedisConnectionStrategy,
  mockSentinelDatabaseWithTlsAuth,
  mockSentinelRedisClient,
  mockSessionMetadata,
  mockStandaloneRedisClient,
  MockType,
} from 'src/__mocks__';
import { Database } from 'src/modules/database/models/database';
import {
  RedisClientFactory,
  RedisClientLib,
} from 'src/modules/redis/redis.client.factory';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { FeatureService } from 'src/modules/feature/feature.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { LocalRedisClientFactory } from 'src/modules/redis/local.redis.client.factory';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';

jest.mock('ioredis', () => ({
  ...(jest.requireActual('ioredis') as object),
}));

describe('LocalRedisClientFactory', () => {
  let module: TestingModule;
  let service: LocalRedisClientFactory;
  let ioredisRedisConnectionStrategy: MockType<IoredisRedisConnectionStrategy>;
  let nodeRedisConnectionStrategy: MockType<NodeRedisConnectionStrategy>;
  let featureService: MockType<FeatureService>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        LocalRedisClientFactory,
        {
          provide: IoredisRedisConnectionStrategy,
          useFactory: mockIoRedisRedisConnectionStrategy,
        },
        {
          provide: NodeRedisConnectionStrategy,
          useFactory: mockNodeRedisConnectionStrategy,
        },
        {
          provide: FeatureService,
          useFactory: mockFeatureService,
        },
        {
          provide: ConstantsProvider,
          useFactory: mockConstantsProvider,
        },
      ],
    }).compile();

    service = await module.get(LocalRedisClientFactory);
    ioredisRedisConnectionStrategy = await module.get(
      IoredisRedisConnectionStrategy,
    );
    nodeRedisConnectionStrategy = await module.get(NodeRedisConnectionStrategy);
    featureService = await module.get(FeatureService);

    featureService.getByName.mockResolvedValue(mockFeatureRedisClient);
  });

  describe('init', () => {
    it('should set ioredis as default strategy from config', async () => {
      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);

      await service.init();

      expect(featureService.getByName).toHaveBeenCalledWith(
        mockSessionMetadata,
        KnownFeatures.RedisClient,
      );
      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);
    });
    it('should set default (ioredis for now) strategy if unknown strategy in the config', async () => {
      featureService.getByName.mockResolvedValueOnce({
        ...mockFeatureRedisClient,
        data: {
          strategy: 'jredis',
        },
      });

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);

      await service.init();

      expect(featureService.getByName).toHaveBeenCalledWith(
        mockSessionMetadata,
        KnownFeatures.RedisClient,
      );
      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);
    });
    it('should set default (ioredis for now) strategy if no feature found', async () => {
      featureService.getByName.mockResolvedValueOnce(undefined);

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);

      await service.init();

      expect(featureService.getByName).toHaveBeenCalledWith(
        mockSessionMetadata,
        KnownFeatures.RedisClient,
      );
      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);
    });
    it('should set default (ioredis for now) strategy if no feature.data specified', async () => {
      featureService.getByName.mockResolvedValueOnce({
        ...mockFeatureRedisClient,
        data: undefined,
      });

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);

      await service.init();

      expect(featureService.getByName).toHaveBeenCalledWith(
        mockSessionMetadata,
        KnownFeatures.RedisClient,
      );
      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);
    });
    it('should set default (ioredis for now) strategy if no feature.data.strategy specified', async () => {
      featureService.getByName.mockResolvedValueOnce({
        ...mockFeatureRedisClient,
        data: {},
      });

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);

      await service.init();

      expect(featureService.getByName).toHaveBeenCalledWith(
        mockSessionMetadata,
        KnownFeatures.RedisClient,
      );
      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);
    });
    it('should set node-redis as default strategy from config', async () => {
      featureService.getByName.mockResolvedValueOnce({
        ...mockFeatureRedisClient,
        data: {
          strategy: 'node-redis',
        },
      });

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);

      await service.init();

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.NODE_REDIS);
    });
    it('should nor fail in case of an error', async () => {
      featureService.getByName.mockRejectedValueOnce(
        new Error('Unable to get config'),
      );

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);

      await service.init();

      expect(service['defaultConnectionStrategy']['lib']) // lib field doesn't exist in the not mocked implementation
        .toEqual(RedisClientLib.IOREDIS);
    });
  });

  describe('createClientAutomatically', () => {
    it('should create standalone client (when unable to create cluster and sentinel)', async () => {
      ioredisRedisConnectionStrategy.createClusterClient.mockRejectedValueOnce(
        new Error('not a cluster'),
      );
      const result = await service['createClientAutomatically'](
        mockClientMetadata,
        mockDatabase,
      );

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createSentinelClient,
      ).not.toHaveBeenCalled();
      expect(
        ioredisRedisConnectionStrategy.createClusterClient,
      ).toHaveBeenCalledWith(
        mockClientMetadata,
        mockDatabase,
        RedisClientFactory.prepareConnectionOptions(),
      );
      expect(
        ioredisRedisConnectionStrategy.createStandaloneClient,
      ).toHaveBeenCalledWith(
        mockClientMetadata,
        mockDatabase,
        RedisClientFactory.prepareConnectionOptions(),
      );
    });
    it('should create cluster client', async () => {
      const result = await service['createClientAutomatically'](
        mockClientMetadata,
        mockClusterDatabaseWithTlsAuth,
      );

      expect(result).toEqual(mockClusterRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createSentinelClient,
      ).not.toHaveBeenCalled();
      expect(
        ioredisRedisConnectionStrategy.createClusterClient,
      ).toHaveBeenCalledWith(
        mockClientMetadata,
        mockClusterDatabaseWithTlsAuth,
        { useRetry: true },
      );
      expect(
        ioredisRedisConnectionStrategy.createStandaloneClient,
      ).not.toHaveBeenCalled();
    });
    it('should create sentinel client', async () => {
      const result = await service['createClientAutomatically'](
        mockClientMetadata,
        mockSentinelDatabaseWithTlsAuth,
      );

      expect(result).toEqual(mockSentinelRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createSentinelClient,
      ).toHaveBeenCalledWith(
        mockClientMetadata,
        mockSentinelDatabaseWithTlsAuth,
        { useRetry: true },
      );
      expect(
        ioredisRedisConnectionStrategy.createClusterClient,
      ).not.toHaveBeenCalled();
      expect(
        ioredisRedisConnectionStrategy.createStandaloneClient,
      ).not.toHaveBeenCalled();
    });
  });

  describe('createClient', () => {
    it('should create standalone client (default ioredis strategy)', async () => {
      const result = await service.createClient(
        mockClientMetadata,
        mockDatabase,
      );

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createStandaloneClient,
      ).toHaveBeenCalledWith(mockClientMetadata, mockDatabase, {
        useRetry: true,
      });
    });
    it('should create standalone client (ioredis strategy)', async () => {
      const result = await service.createClient(
        mockClientMetadata,
        mockDatabase,
        {
          clientLib: RedisClientLib.IOREDIS,
        },
      );

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createStandaloneClient,
      ).toHaveBeenCalledWith(mockClientMetadata, mockDatabase, {
        useRetry: true,
        clientLib: RedisClientLib.IOREDIS,
      });
    });
    it('should create standalone client (node-redis strategy)', async () => {
      const result = await service.createClient(
        mockClientMetadata,
        mockDatabase,
        {
          clientLib: RedisClientLib.NODE_REDIS,
        },
      );

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(
        nodeRedisConnectionStrategy.createStandaloneClient,
      ).toHaveBeenCalledWith(mockClientMetadata, mockDatabase, {
        useRetry: true,
        clientLib: RedisClientLib.NODE_REDIS,
      });
    });
    it('should trigger auto discovery connection type (when no connectionType defined)', async () => {
      const mockDatabaseWithoutConnectionType = Object.assign(new Database(), {
        ...mockDatabase,
        connectionType: null,
      });

      const result = await service.createClient(
        mockClientMetadata,
        mockDatabaseWithoutConnectionType,
      );

      expect(result).toEqual(mockClusterRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createClusterClient,
      ).toHaveBeenCalledWith(
        mockClientMetadata,
        {
          ...mockDatabaseWithoutConnectionType,
          connectionType: undefined,
        },
        RedisClientFactory.prepareConnectionOptions(),
      );
    });
    it('should create cluster client', async () => {
      const result = await service.createClient(
        mockClientMetadata,
        mockClusterDatabaseWithTlsAuth,
      );

      expect(result).toEqual(mockClusterRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createClusterClient,
      ).toHaveBeenCalledWith(
        mockClientMetadata,
        mockClusterDatabaseWithTlsAuth,
        { useRetry: true },
      );
    });
    it('should create sentinel client', async () => {
      const result = await service.createClient(
        mockClientMetadata,
        mockSentinelDatabaseWithTlsAuth,
      );

      expect(result).toEqual(mockSentinelRedisClient);
      expect(
        ioredisRedisConnectionStrategy.createSentinelClient,
      ).toHaveBeenCalledWith(
        mockClientMetadata,
        mockSentinelDatabaseWithTlsAuth,
        { useRetry: true },
      );
    });
  });
});
