import { Test } from '@nestjs/testing';
import * as redis from 'redis';
import {
  mockClientMetadata,
  mockDatabase,
  mockSshTunnelProvider,
} from 'src/__mocks__';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { StandaloneNodeRedisClient } from 'src/modules/redis/client/node-redis/standalone.node-redis.client';
import { RedisConnectionFamily } from 'src/modules/database/entities/database.entity';

jest.mock('redis', () => ({
  ...jest.requireActual('redis'),
  createClient: jest.fn(),
}));

describe('NodeRedisConnectionStrategy', () => {
  let service: NodeRedisConnectionStrategy;
  let createClientSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NodeRedisConnectionStrategy,
        {
          provide: SshTunnelProvider,
          useFactory: mockSshTunnelProvider,
        },
      ],
    }).compile();

    service = module.get(NodeRedisConnectionStrategy);

    createClientSpy = jest.spyOn(redis, 'createClient');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStandaloneClient', () => {
    const mockCreateClient = () => {
      const mockClient = {
        on: jest.fn().mockReturnThis(),
        connect: jest.fn().mockResolvedValue(undefined),
      };
      createClientSpy.mockReturnValue(mockClient);
    };

    it('should default to family: 0 (dual-stack IPv4/IPv6) when not set', async () => {
      mockCreateClient();

      const result = await service.createStandaloneClient(
        mockClientMetadata,
        mockDatabase,
        {},
      );

      expect(result).toBeInstanceOf(StandaloneNodeRedisClient);
      expect(createClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({
            family: 0,
          }),
        }),
      );
    });

    it('should map connection family IPv4 to socket family: 4', async () => {
      mockCreateClient();

      await service.createStandaloneClient(
        mockClientMetadata,
        { ...mockDatabase, connectionFamily: RedisConnectionFamily.IPv4 },
        {},
      );

      expect(createClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({ family: 4 }),
        }),
      );
    });

    it('should map connection family IPv6 to socket family: 6', async () => {
      mockCreateClient();

      await service.createStandaloneClient(
        mockClientMetadata,
        { ...mockDatabase, connectionFamily: RedisConnectionFamily.IPv6 },
        {},
      );

      expect(createClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({ family: 6 }),
        }),
      );
    });
  });
});
