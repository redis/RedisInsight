import { ClientMetadata } from 'src/common/models';
import {
  RedisClient,
  RedisClientConnectionType,
} from 'src/modules/redis/client';
import { RedisClientLib } from 'src/modules/redis/redis.client.factory';
import { mockCommonClientMetadata } from 'src/__mocks__/common';
import { mockDatabase } from 'src/__mocks__/databases';
import { BadRequestException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { Database } from 'src/modules/database/models/database';

export const mockClientDatabase: Partial<Database> = {
  providerDetails: mockDatabase.providerDetails,
};

export interface IRedisClientInstance {
  id: string;
  clientMetadata: ClientMetadata;
  client: any;
  lastTimeUsed: number;
}

export const mockInvalidClientMetadataError = new BadRequestException(
  ERROR_MESSAGES.INVALID_CLIENT_METADATA,
);
export const mockInvalidSessionMetadataError = new BadRequestException(
  ERROR_MESSAGES.INVALID_SESSION_METADATA,
);

// todo: NEW. remove everything above
export class MockRedisClient extends RedisClient {
  constructor(
    clientMetadata: ClientMetadata,
    client: any = jest.fn(),
    options = {},
    database: Partial<Database> = mockClientDatabase,
  ) {
    super(clientMetadata, client, options, database);
  }

  public isConnected = jest.fn().mockReturnValue(true);

  public getConnectionType = jest
    .fn()
    .mockReturnValue(RedisClientConnectionType.STANDALONE);

  public nodes = jest.fn().mockResolvedValue([this]);

  public sendCommand = jest.fn().mockResolvedValue(undefined);

  public sendPipeline = jest.fn().mockResolvedValue(undefined);

  public publish = jest.fn().mockResolvedValue(undefined);

  public subscribe = jest.fn().mockResolvedValue(undefined);

  public pSubscribe = jest.fn().mockResolvedValue(undefined);

  public unsubscribe = jest.fn().mockResolvedValue(undefined);

  public pUnsubscribe = jest.fn().mockResolvedValue(undefined);

  // public sendMulti = jest.fn().mockResolvedValue(undefined);

  public call = jest.fn().mockResolvedValue(undefined);

  public monitor = jest.fn().mockResolvedValue(undefined);

  public disconnect = jest.fn().mockResolvedValue(undefined);

  public isFeatureSupported = jest.fn().mockResolvedValue(undefined);

  public getInfo = jest.fn().mockResolvedValue(undefined);

  public quit = jest.fn().mockResolvedValue(undefined); // todo: should return commands results

  public getCurrentDbIndex = jest.fn().mockResolvedValue(0);
}

export const mockStandaloneRedisClient = new MockRedisClient(
  mockCommonClientMetadata,
);

export class MockClusterRedisClient extends MockRedisClient {
  constructor(clientMetadata: ClientMetadata, client: any = jest.fn()) {
    super(clientMetadata, client);
  }

  public getConnectionType = jest
    .fn()
    .mockReturnValue(RedisClientConnectionType.CLUSTER);

  public nodes = jest
    .fn()
    .mockResolvedValue([mockStandaloneRedisClient, mockStandaloneRedisClient]);
}

export const mockClusterRedisClient = new MockClusterRedisClient(
  mockCommonClientMetadata,
);

export class MockSentinelRedisClient extends MockRedisClient {
  constructor(clientMetadata: ClientMetadata, client: any = jest.fn()) {
    super(clientMetadata, client);
  }

  public getConnectionType = jest
    .fn()
    .mockReturnValue(RedisClientConnectionType.SENTINEL);
}

export const mockSentinelRedisClient = new MockSentinelRedisClient(
  mockCommonClientMetadata,
);

export const generateMockRedisClient = (
  clientMetadata: Partial<ClientMetadata>,
  client = jest.fn(),
  options = {},
  database: Partial<Database> = {},
): MockRedisClient =>
  new MockRedisClient(
    clientMetadata as ClientMetadata,
    client,
    options,
    { ...mockClientDatabase, ...database },
  );

export const mockRedisClientInstance: IRedisClientInstance = {
  id: RedisClient.generateId(mockCommonClientMetadata),
  clientMetadata: mockCommonClientMetadata,
  client: mockStandaloneRedisClient,
  lastTimeUsed: 1619791508019,
};

export const generateMockRedisClientInstance = (
  clientMetadata: Partial<ClientMetadata>,
): IRedisClientInstance => ({
  id: RedisClient.generateId(clientMetadata as ClientMetadata),
  clientMetadata: clientMetadata as ClientMetadata,
  client: mockStandaloneRedisClient,
  lastTimeUsed: Date.now(),
});

export const mockRedisClientStorage = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  getByMetadata: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  set: jest.fn().mockResolvedValue(mockStandaloneRedisClient),
  remove: jest.fn().mockResolvedValue(1),
  removeByMetadata: jest.fn().mockResolvedValue(1),
  removeManyByMetadata: jest.fn().mockResolvedValue(1),
}));

export const mockIoRedisRedisConnectionStrategy = jest.fn(() => ({
  lib: RedisClientLib.IOREDIS,
  createStandaloneClient: jest
    .fn()
    .mockResolvedValue(mockStandaloneRedisClient),
  createClusterClient: jest.fn().mockResolvedValue(mockClusterRedisClient),
  createSentinelClient: jest.fn().mockResolvedValue(mockSentinelRedisClient),
}));

export const mockNodeRedisConnectionStrategy = jest.fn(() => ({
  lib: RedisClientLib.NODE_REDIS,
  createStandaloneClient: jest
    .fn()
    .mockResolvedValue(mockStandaloneRedisClient),
  createClusterClient: jest.fn().mockResolvedValue(mockClusterRedisClient),
  createSentinelClient: jest.fn().mockResolvedValue(mockSentinelRedisClient),
}));

export const mockRedisClientFactory = jest.fn(() => ({
  getConnectionStrategy: jest
    .fn()
    .mockReturnValue(mockIoRedisRedisConnectionStrategy()),
  createClient: jest
    .fn()
    .mockImplementation(async (clientMetadata: ClientMetadata) =>
      Promise.resolve(new MockRedisClient(clientMetadata)),
    ),
  createClientAutomatically: jest
    .fn()
    .mockResolvedValue(mockStandaloneRedisClient),
}));
