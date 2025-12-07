import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockBrowserClientMetadata,
  mockStandaloneRedisClient,
  mockDatabaseClientFactory,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';
import { ConsumerGroupService } from 'src/modules/browser/stream/services/consumer-group.service';
import {
  mockAddStreamEntriesDto,
  mockConsumerGroup,
  mockConsumerGroupsReply,
  mockCreateConsumerGroupDto,
  mockEntryId2,
  mockKeyDto,
} from 'src/modules/browser/__mocks__';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import * as bigStringUtil from 'src/utils/big-string';
import config, { Config } from 'src/utils/config';

const REDIS_CLIENTS_CONFIG = config.get(
  'redis_clients',
) as Config['redis_clients'];
const BIG_STRING_PREFIX = REDIS_CLIENTS_CONFIG.truncatedStringPrefix;

describe('ConsumerGroupService', () => {
  const client = mockStandaloneRedisClient;
  let service: ConsumerGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerGroupService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get(ConsumerGroupService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);

    when(client.sendCommand)
      .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
      .mockResolvedValue(true);
  });

  describe('getGroups', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValueOnce(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoGroups]),
        )
        .mockResolvedValue([mockConsumerGroupsReply, mockConsumerGroupsReply]);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XPending]),
        )
        .mockResolvedValue([
          's',
          mockConsumerGroup.smallestPendingId,
          mockConsumerGroup.greatestPendingId,
        ]);
    });
    it('should get consumer groups with info', async () => {
      const groups = await service.getGroups(
        mockBrowserClientMetadata,
        mockKeyDto,
      );
      expect(groups).toEqual([mockConsumerGroup, mockConsumerGroup]);
    });
    it('should get consumer groups (one with n/a info)', async () => {
      const spy = jest.spyOn(bigStringUtil, 'isTruncatingEnabled');
      spy.mockReturnValue(true);

      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoGroups]),
        )
        .mockResolvedValueOnce([
          mockConsumerGroupsReply,
          [
            'name',
            `${BIG_STRING_PREFIX} group1`,
            'consumers',
            mockConsumerGroup.consumers,
            'pending',
            mockConsumerGroup.pending,
            'last-delivered-id',
            mockConsumerGroup.lastDeliveredId,
          ],
        ]);

      const groups = await service.getGroups(
        mockBrowserClientMetadata,
        mockKeyDto,
      );
      expect(groups).toEqual([
        mockConsumerGroup,
        {
          name: Buffer.from(`${BIG_STRING_PREFIX} group1`),
          consumers: 0,
          pending: 0,
          lastDeliveredId: mockEntryId2,
          smallestPendingId: 'n/a',
          greatestPendingId: 'n/a',
        },
      ]);
    });
    it('should throw error when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValueOnce(false);

      try {
        await service.getGroups(mockBrowserClientMetadata, mockKeyDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.getGroups(mockBrowserClientMetadata, mockKeyDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XPending]),
        )
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getGroups(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Internal Server error', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XPending]),
        )
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.getGroups(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('createGroups', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValue(true);
      client.sendPipeline.mockResolvedValue([[null, '123-1']]);
    });
    it('add groups', async () => {
      await expect(
        service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto,
            mockCreateConsumerGroupDto,
          ],
        }),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolStreamCommands.XGroupCreate,
          mockKeyDto.keyName,
          mockConsumerGroup.name,
          mockConsumerGroup.lastDeliveredId,
        ],
        [
          BrowserToolStreamCommands.XGroupCreate,
          mockKeyDto.keyName,
          mockConsumerGroup.name,
          mockConsumerGroup.lastDeliveredId,
        ],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValueOnce(false);

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto,
            mockCreateConsumerGroupDto,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto,
            mockCreateConsumerGroupDto,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      client.sendPipeline.mockResolvedValue([
        [new Error(RedisErrorCodes.WrongType), '123-1'],
      ]);

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto,
            mockCreateConsumerGroupDto,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Conflict when trying to create existing group', async () => {
      client.sendPipeline.mockResolvedValue([
        [new Error('BUSYGROUP such group already there!'), '123-1'],
      ]);

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto,
            mockCreateConsumerGroupDto,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('BUSYGROUP such group already there!');
      }
    });
    it('should throw Internal Server error', async () => {
      client.sendPipeline.mockResolvedValue([[new Error('oO'), '123-1']]);

      try {
        await service.createGroups(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto,
            mockCreateConsumerGroupDto,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('updateGroup', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValueOnce(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XGroupSetId]),
        )
        .mockResolvedValue('OK');
    });
    it('update group', async () => {
      await expect(
        service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        }),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStreamCommands.XGroupSetId,
        mockKeyDto.keyName,
        mockCreateConsumerGroupDto.name,
        mockCreateConsumerGroupDto.lastDeliveredId,
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValueOnce(false);

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      client.sendCommand.mockRejectedValueOnce(
        new Error(RedisErrorCodes.WrongType),
      );

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw NotFound when trying to modify not-existing group', async () => {
      client.sendCommand.mockRejectedValueOnce(
        new Error('NOGROUP no such group'),
      );

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Internal Server error', async () => {
      client.sendCommand.mockRejectedValueOnce(new Error('oO'));

      try {
        await service.updateGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          ...mockCreateConsumerGroupDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('deleteGroups', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValue(true);
      client.sendPipeline.mockResolvedValue([[null, '123-1']]);
    });
    it('add groups', async () => {
      await expect(
        service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto.name,
            mockCreateConsumerGroupDto.name,
          ],
        }),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolStreamCommands.XGroupDestroy,
          mockKeyDto.keyName,
          mockConsumerGroup.name,
        ],
        [
          BrowserToolStreamCommands.XGroupDestroy,
          mockKeyDto.keyName,
          mockConsumerGroup.name,
        ],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValueOnce(false);

      try {
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto.name,
            mockCreateConsumerGroupDto.name,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto.name,
            mockCreateConsumerGroupDto.name,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      client.sendPipeline.mockResolvedValue([
        [new Error(RedisErrorCodes.WrongType), '123-1'],
      ]);

      try {
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto.name,
            mockCreateConsumerGroupDto.name,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Internal Server error', async () => {
      client.sendPipeline.mockResolvedValue([[new Error('oO'), '123-1']]);

      try {
        await service.deleteGroup(mockBrowserClientMetadata, {
          ...mockKeyDto,
          consumerGroups: [
            mockCreateConsumerGroupDto.name,
            mockCreateConsumerGroupDto.name,
          ],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
});
