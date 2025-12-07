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
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes } from 'src/constants';
import { ConsumerService } from 'src/modules/browser/stream/services/consumer.service';
import {
  mockAckPendingMessagesDto,
  mockAdditionalClaimPendingEntriesDto,
  mockClaimPendingEntriesDto,
  mockClaimPendingEntriesReply,
  mockConsumer,
  mockConsumerGroup,
  mockConsumerReply,
  mockGetPendingMessagesDto,
  mockKeyDto,
  mockPendingMessage,
  mockPendingMessageReply,
} from 'src/modules/browser/__mocks__';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('ConsumerService', () => {
  const client = mockStandaloneRedisClient;
  let service: ConsumerService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get(ConsumerService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
  });

  describe('getGroups', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoConsumers]),
        )
        .mockResolvedValue([mockConsumerReply, mockConsumerReply]);
    });
    it('should get consumers list', async () => {
      const consumers = await service.getConsumers(mockBrowserClientMetadata, {
        ...mockKeyDto,
        groupName: mockConsumerGroup.name,
      });
      expect(consumers).toEqual([mockConsumer, mockConsumer]);
    });
    it('should throw error when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValueOnce(false);

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
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
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Not Found error when no group', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoConsumers]),
        )
        .mockRejectedValueOnce(new Error('NOGROUP no such group'));

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoConsumers]),
        )
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
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
          expect.arrayContaining([BrowserToolStreamCommands.XInfoConsumers]),
        )
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.getConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('deleteConsumers', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(true);
      client.sendPipeline.mockResolvedValue([[null, '123-1']]);
    });
    it('delete consumers', async () => {
      await expect(
        service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        }),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolStreamCommands.XGroupDelConsumer,
          mockKeyDto.keyName,
          mockConsumerGroup.name,
          mockConsumer.name,
        ],
        [
          BrowserToolStreamCommands.XGroupDelConsumer,
          mockKeyDto.keyName,
          mockConsumerGroup.name,
          mockConsumer.name,
        ],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, expect.anything()])
        .mockResolvedValueOnce(false);

      try {
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
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
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Not Found error when group does not exists', async () => {
      client.sendPipeline.mockResolvedValue([
        [new Error(RedisErrorCodes.NoGroup), '123-1'],
      ]);

      try {
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Wrong Type error', async () => {
      client.sendPipeline.mockResolvedValue([
        [new Error(RedisErrorCodes.WrongType), '123-1'],
      ]);

      try {
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
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
        await service.deleteConsumers(mockBrowserClientMetadata, {
          ...mockKeyDto,
          groupName: mockConsumerGroup.name,
          consumerNames: [mockConsumer.name, mockConsumer.name],
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('getPendingEntries', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockGetPendingMessagesDto.keyName,
        ])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XPending]),
        )
        .mockResolvedValue([mockPendingMessageReply, mockPendingMessageReply]);
    });
    it('should get consumers list', async () => {
      const consumers = await service.getPendingEntries(
        mockBrowserClientMetadata,
        mockGetPendingMessagesDto,
      );
      expect(consumers).toEqual([mockPendingMessage, mockPendingMessage]);

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStreamCommands.XPending,
        mockGetPendingMessagesDto.keyName,
        mockGetPendingMessagesDto.groupName,
        mockGetPendingMessagesDto.start,
        mockGetPendingMessagesDto.end,
        mockGetPendingMessagesDto.count,
        mockGetPendingMessagesDto.consumerName,
      ]);
    });
    it('should throw error when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockGetPendingMessagesDto.keyName,
        ])
        .mockResolvedValueOnce(false);

      try {
        await service.getPendingEntries(
          mockBrowserClientMetadata,
          mockGetPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.getPendingEntries(
          mockBrowserClientMetadata,
          mockGetPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Not Found error when no group', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XPending]),
        )
        .mockRejectedValueOnce(new Error('NOGROUP no such group'));

      try {
        await service.getPendingEntries(
          mockBrowserClientMetadata,
          mockGetPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XPending]),
        )
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getPendingEntries(
          mockBrowserClientMetadata,
          mockGetPendingMessagesDto,
        );
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
        await service.getPendingEntries(
          mockBrowserClientMetadata,
          mockGetPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('ackPendingEntries', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAckPendingMessagesDto.keyName,
        ])
        .mockResolvedValue(true);
      client.sendCommand.mockResolvedValue(2);
    });
    it('ack pending entries', async () => {
      const result = await service.ackPendingEntries(
        mockBrowserClientMetadata,
        mockAckPendingMessagesDto,
      );
      expect(result).toEqual({ affected: 2 });

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolStreamCommands.XAck,
        mockAckPendingMessagesDto.keyName,
        mockAckPendingMessagesDto.groupName,
        ...mockAckPendingMessagesDto.entries,
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAckPendingMessagesDto.keyName,
        ])
        .mockResolvedValueOnce(false);

      try {
        await service.ackPendingEntries(
          mockBrowserClientMetadata,
          mockAckPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should proxy Not Found error', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XAck]))
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.ackPendingEntries(
          mockBrowserClientMetadata,
          mockAckPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Bad Request when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XAck]))
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.ackPendingEntries(
          mockBrowserClientMetadata,
          mockAckPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Internal Server error', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XAck]))
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.ackPendingEntries(
          mockBrowserClientMetadata,
          mockAckPendingMessagesDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('claimPendingEntries', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockClaimPendingEntriesDto.keyName,
        ])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XClaim]),
          { replyEncoding: 'utf8' },
        )
        .mockResolvedValue(mockClaimPendingEntriesReply);
    });
    it('claim pending entries', async () => {
      const result = await service.claimPendingEntries(
        mockBrowserClientMetadata,
        mockClaimPendingEntriesDto,
      );
      expect(result).toEqual({ affected: mockClaimPendingEntriesReply });

      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolStreamCommands.XClaim,
          mockClaimPendingEntriesDto.keyName,
          mockClaimPendingEntriesDto.groupName,
          mockClaimPendingEntriesDto.consumerName,
          mockClaimPendingEntriesDto.minIdleTime,
          ...mockClaimPendingEntriesDto.entries,
          'justid',
        ],
        { replyEncoding: 'utf8' },
      );
    });
    it('claim pending entries with additional args', async () => {
      const result = await service.claimPendingEntries(
        mockBrowserClientMetadata,
        {
          ...mockClaimPendingEntriesDto,
          ...mockAdditionalClaimPendingEntriesDto,
        },
      );
      expect(result).toEqual({ affected: mockClaimPendingEntriesReply });

      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolStreamCommands.XClaim,
          mockClaimPendingEntriesDto.keyName,
          mockClaimPendingEntriesDto.groupName,
          mockClaimPendingEntriesDto.consumerName,
          mockClaimPendingEntriesDto.minIdleTime,
          ...mockClaimPendingEntriesDto.entries,
          'time',
          mockAdditionalClaimPendingEntriesDto.time,
          'retrycount',
          mockAdditionalClaimPendingEntriesDto.retryCount,
          'force',
          'justid',
        ],
        { replyEncoding: 'utf8' },
      );
    });
    it('claim pending entries with additional args and "idle" instead of "time"', async () => {
      const result = await service.claimPendingEntries(
        mockBrowserClientMetadata,
        {
          ...mockClaimPendingEntriesDto,
          ...mockAdditionalClaimPendingEntriesDto,
          idle: 0,
        },
      );
      expect(result).toEqual({ affected: mockClaimPendingEntriesReply });

      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolStreamCommands.XClaim,
          mockClaimPendingEntriesDto.keyName,
          mockClaimPendingEntriesDto.groupName,
          mockClaimPendingEntriesDto.consumerName,
          mockClaimPendingEntriesDto.minIdleTime,
          ...mockClaimPendingEntriesDto.entries,
          'idle',
          0,
          'retrycount',
          mockAdditionalClaimPendingEntriesDto.retryCount,
          'force',
          'justid',
        ],
        { replyEncoding: 'utf8' },
      );
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockClaimPendingEntriesDto.keyName,
        ])
        .mockResolvedValueOnce(false);

      try {
        await service.claimPendingEntries(
          mockBrowserClientMetadata,
          mockClaimPendingEntriesDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should proxy Not Found error', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XClaim]))
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.claimPendingEntries(
          mockBrowserClientMetadata,
          mockClaimPendingEntriesDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Bad Request when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XClaim]))
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.claimPendingEntries(
          mockBrowserClientMetadata,
          mockClaimPendingEntriesDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XClaim]))
        .mockRejectedValueOnce(new Error(RedisErrorCodes.NoGroup));

      try {
        await service.claimPendingEntries(
          mockBrowserClientMetadata,
          mockClaimPendingEntriesDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }
    });
    it('should throw Internal Server error', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XClaim]))
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.claimPendingEntries(
          mockBrowserClientMetadata,
          mockClaimPendingEntriesDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
});
