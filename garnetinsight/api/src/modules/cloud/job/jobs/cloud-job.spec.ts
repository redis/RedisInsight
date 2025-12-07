import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import {
  mockDatabaseService,
  mockRedisClientInstance,
  mockClientMetadata,
  mockStandaloneRedisClient,
  mockDatabaseClientFactory,
} from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('CloudJob', () => {
  let consumerInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    consumerInstance = await module.get<DatabaseClientFactory>(
      DatabaseClientFactory,
    );
  });

  describe('getRedisClient', () => {
    beforeEach(() => {
      consumerInstance.createClient = jest.fn();
    });
    it('create new redis client', async () => {
      consumerInstance.getOrCreateClient.mockResolvedValue(
        mockStandaloneRedisClient,
      );

      const result =
        await consumerInstance.getOrCreateClient(mockClientMetadata);

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(consumerInstance.getOrCreateClient).toHaveBeenCalled();
    });
    it('existing client has connection', async () => {
      const result =
        await consumerInstance.getOrCreateClient(mockClientMetadata);

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(consumerInstance.createClient).not.toHaveBeenCalled();
    });
    it('existing client has no connection', async () => {
      consumerInstance.getOrCreateClient.mockResolvedValue(
        mockStandaloneRedisClient,
      );

      const result =
        await consumerInstance.getOrCreateClient(mockClientMetadata);

      expect(result).toEqual(mockStandaloneRedisClient);
      expect(consumerInstance.getOrCreateClient).toHaveBeenCalled();
    });
    it('select redis database by number', async () => {
      await expect(
        consumerInstance.getOrCreateClient({
          ...mockClientMetadata,
        }),
      ).resolves.not.toThrow();

      expect(consumerInstance.createClient).not.toHaveBeenCalled();
    });
    it("can't create redis client", async () => {
      const error = new BadRequestException(
        ' Could not connect to localhost, please check the connection details.',
      );
      consumerInstance.getOrCreateClient.mockRejectedValue(error);

      await expect(
        consumerInstance.getOrCreateClient({
          ...mockClientMetadata,
          dbNumber: 1,
        }),
      ).rejects.toThrow(error);
    });
    // it('should throw error if autoConnection disabled', async () => {
    //   redisService.getClientInstance.mockReturnValue(null);
    //   // @ts-ignore
    //   class Tool extends RedisConsumerAbstractService {
    //     constructor() {
    //       super(
    //         ClientContext.CLI,
    //         redisService,
    //         redisConnectionFactory,
    //         instancesBusinessService,
    //         { enableAutoConnection: false },
    //       );
    //     }
    //   }
    //
    //   await expect(new Tool().getRedisClient(mockClientMetadata))
    //     .rejects.toThrow(new ClientNotFoundErrorException());
    // });
  });

  describe('createNewClient', () => {
    it('create new redis client', async () => {
      consumerInstance.createClient.mockResolvedValue(
        mockStandaloneRedisClient,
      );

      const result = await consumerInstance.createClient(
        mockRedisClientInstance.clientMetadata,
      );
      expect(result).toEqual(mockStandaloneRedisClient);
    });
    it("can't create redis client", async () => {
      const error = new BadRequestException(
        ' Could not connect to localhost, please check the connection details.',
      );
      consumerInstance.createClient.mockRejectedValue(error);

      await expect(
        consumerInstance.createClient(mockRedisClientInstance.clientMetadata),
      ).rejects.toThrow(error);
    });
  });

  describe('execPipelineFromClient', () => {
    const client = mockStandaloneRedisClient;
    const mockPipelineCommands = ['module list', 'keys', '*'];
    it('succeed to execute pipeline from redis client', async () => {
      client.sendPipeline.mockResolvedValue([null, []]);

      await expect(
        client.sendPipeline(client, mockPipelineCommands),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith(
        client,
        mockPipelineCommands,
      );
    });
  });
});
