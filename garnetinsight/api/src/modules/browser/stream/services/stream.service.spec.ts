import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockBrowserClientMetadata,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { StreamService } from 'src/modules/browser/stream/services/stream.service';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisErrorCodes, SortOrder } from 'src/constants';
import {
  mockAddStreamEntriesDto,
  mockEmptyStreamEntriesReply,
  mockEmptyStreamInfo,
  mockEmptyStreamInfoReply,
  mockGetStreamEntriesDto,
  mockStreamEntries,
  mockStreamEntriesReply,
  mockStreamEntry,
  mockStreamInfo,
  mockStreamInfoReply,
} from 'src/modules/browser/__mocks__';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

describe('StreamService', () => {
  const client = mockStandaloneRedisClient;
  let service: StreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get(StreamService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
  });

  describe('createStream', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValue(false);
      client.sendPipeline.mockResolvedValue([[null, '123-1']]);
    });
    it('create stream with expiration', async () => {
      await expect(
        service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolStreamCommands.XAdd,
          mockAddStreamEntriesDto.keyName,
          mockStreamEntry.id,
          mockStreamEntry.fields[0].name,
          mockStreamEntry.fields[0].value,
        ],
        [BrowserToolKeysCommands.Expire, mockAddStreamEntriesDto.keyName, 1000],
      ]);
    });
    it('create stream without expiration', async () => {
      await expect(
        service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        }),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolStreamCommands.XAdd,
          mockAddStreamEntriesDto.keyName,
          mockStreamEntry.id,
          mockStreamEntry.fields[0].name,
          mockStreamEntry.fields[0].value,
        ],
      ]);
    });
    it('should throw error key exists', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValueOnce(true);

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NAME_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
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
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Bad Request when incorrect ID', async () => {
      client.sendPipeline.mockResolvedValue([
        [new Error('ID specified in XADD is equal or smaller'), '123-1'],
      ]);

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('ID specified in XADD is equal or smaller');
      }
    });
    it('should throw Internal Server error', async () => {
      client.sendPipeline.mockResolvedValue([[new Error('oO'), '123-1']]);

      try {
        await service.createStream(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('addEntries', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValue(true);
      client.sendPipeline.mockResolvedValue([[null, '123-1']]);
    });
    it('add entries', async () => {
      await expect(
        service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        }),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolStreamCommands.XAdd,
          mockAddStreamEntriesDto.keyName,
          mockStreamEntry.id,
          mockStreamEntry.fields[0].name,
          mockStreamEntry.fields[0].value,
        ],
      ]);
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValueOnce(false);

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
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
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
    it('should throw Bad Request when incorrect ID', async () => {
      client.sendPipeline.mockResolvedValue([
        [new Error('ID specified in XADD is equal or smaller'), '123-1'],
      ]);

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('ID specified in XADD is equal or smaller');
      }
    });
    it('should throw Internal Server error', async () => {
      client.sendPipeline.mockResolvedValue([[new Error('oO'), '123-1']]);

      try {
        await service.addEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('get entries from empty stream', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoStream]),
        )
        .mockResolvedValue(mockEmptyStreamInfoReply);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XRevRange]),
        )
        .mockResolvedValue(mockEmptyStreamEntriesReply);
    });
    it('Should return stream with 0 entries', async () => {
      const result = await service.getEntries(mockBrowserClientMetadata, {
        ...mockGetStreamEntriesDto,
      });
      expect(result).toEqual({
        ...mockEmptyStreamInfo,
        entries: mockEmptyStreamEntriesReply,
      });
    });
  });
  describe('getEntries', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolKeysCommands.Exists]))
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoStream]),
        )
        .mockResolvedValue(mockStreamInfoReply);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XRevRange]),
        )
        .mockResolvedValue(mockStreamEntriesReply);
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XRange]))
        .mockResolvedValue(mockStreamEntriesReply);
    });
    it('get entries DESC', async () => {
      const result = await service.getEntries(mockBrowserClientMetadata, {
        ...mockGetStreamEntriesDto,
      });
      expect(result).toEqual({
        ...mockStreamInfo,
        entries: mockStreamEntries,
      });
    });
    it('get entries ASC', async () => {
      const result = await service.getEntries(mockBrowserClientMetadata, {
        ...mockGetStreamEntriesDto,
        sortOrder: SortOrder.Asc,
      });
      expect(result).toEqual({
        ...mockStreamInfo,
        entries: mockStreamEntries,
      });
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValueOnce(false);

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockGetStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Not Found error', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockRejectedValueOnce(
          new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID),
        );

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockGetStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolStreamCommands.XInfoStream,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getEntries(mockBrowserClientMetadata, {
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
        .calledWith([
          BrowserToolStreamCommands.XInfoStream,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockRejectedValueOnce(new Error('oO'));

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockGetStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('oO');
      }
    });
  });
  describe('deleteEntries', () => {
    const mockEntriesIds = mockStreamEntries.map(({ id }) => id);
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XInfoStream]),
        )
        .mockResolvedValue(mockStreamInfoReply);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolStreamCommands.XRevRange]),
        )
        .mockResolvedValue(mockStreamEntriesReply);
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XRange]))
        .mockResolvedValue(mockStreamEntriesReply);
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolStreamCommands.XDel]))
        .mockResolvedValue(mockStreamEntries.length);
    });
    it('delete entries', async () => {
      const result = await service.deleteEntries(mockBrowserClientMetadata, {
        keyName: mockAddStreamEntriesDto.keyName,
        entries: mockEntriesIds,
      });
      expect(result).toEqual({ affected: mockStreamEntries.length });
    });
    it('should throw Not Found when key does not exists', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockResolvedValueOnce(false);

      try {
        await service.deleteEntries(mockBrowserClientMetadata, {
          keyName: mockAddStreamEntriesDto.keyName,
          entries: mockEntriesIds,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw Wrong Type error', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolStreamCommands.XInfoStream,
          mockAddStreamEntriesDto.keyName,
        ])
        .mockRejectedValueOnce(new Error(RedisErrorCodes.WrongType));

      try {
        await service.getEntries(mockBrowserClientMetadata, {
          ...mockAddStreamEntriesDto,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(RedisErrorCodes.WrongType);
      }
    });
  });
});
