import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { instanceToPlain } from 'class-transformer';
import { when } from 'jest-when';
import { RedisStringResponseEncoding } from 'src/common/constants';
import { ReplyError } from 'src/models';
import {
  mockBrowserClientMetadata,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
} from 'src/__mocks__';
import { mockDatabaseClientFactory } from 'src/__mocks__/databases-client';
import { mockStandaloneRedisClient } from 'src/__mocks__/redis-client';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ArrayElementResponse, ArraySearchPredicate } from './dto';
import { ArrayService } from './array.service';

describe('ArrayService', () => {
  const client = mockStandaloneRedisClient;
  let service: ArrayService;

  const keyName = Buffer.from('array-key');
  const value = Buffer.from('value-1');
  const value2 = Buffer.from('value-2');
  const elements = [
    { index: '0', value },
    { index: '1000000', value: value2 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArrayService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get<ArrayService>(ArrayService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
    client.sendPipeline = jest.fn().mockResolvedValue(undefined);
  });

  describe('createArray', () => {
    it('creates a sparse array and sets expiration', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(false);
      client.sendPipeline.mockResolvedValue([
        [null, 2],
        [null, 1],
      ]);

      await service.createArray(mockBrowserClientMetadata, {
        keyName,
        elements,
        expire: 60,
      });

      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolArrayCommands.ARMSet,
          keyName,
          '0',
          value,
          '1000000',
          value2,
        ],
        [BrowserToolKeysCommands.Expire, keyName, 60],
      ]);
    });

    it('throws conflict when key already exists', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);

      await expect(
        service.createArray(mockBrowserClientMetadata, { keyName, elements }),
      ).rejects.toThrow(new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST));
    });
  });

  describe('getElements', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);
    });

    it('returns populated elements and the next sparse index cursor', async () => {
      client.sendPipeline.mockResolvedValue([
        [null, 2],
        [null, '1000001'],
        [null, ['0', value, '1000000', value2]],
      ]);

      const result = await service.getElements(mockBrowserClientMetadata, {
        keyName,
        start: '0',
        count: 2,
      });

      expect(client.sendPipeline).toHaveBeenCalledWith([
        [BrowserToolArrayCommands.ARCount, keyName],
        [BrowserToolArrayCommands.ARLen, keyName],
        [
          BrowserToolArrayCommands.ARScan,
          keyName,
          '0',
          '18446744073709551614',
          'LIMIT',
          2,
        ],
      ]);
      expect(result).toEqual({
        keyName,
        total: 2,
        logicalLength: '1000001',
        nextIndex: '1000001',
        isPaginationSupported: true,
        elements,
      });
    });

    it('serializes raw string values as Redis buffers for the browser UI', async () => {
      client.sendPipeline.mockResolvedValue([
        [null, 1],
        [null, '1'],
        [null, ['0', 'hello']],
      ]);

      const result = await service.getElements(mockBrowserClientMetadata, {
        keyName,
        start: '0',
        count: 10,
      });

      expect(result.elements[0]).toBeInstanceOf(ArrayElementResponse);
      expect(
        instanceToPlain(result, {
          groups: [RedisStringResponseEncoding.Buffer],
        }).elements[0].value,
      ).toEqual(Buffer.from('hello'));
    });

    it('throws not found when key is missing', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(false);

      await expect(
        service.getElements(mockBrowserClientMetadata, { keyName, count: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getElement', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);
    });

    it('returns one element by index', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolArrayCommands.ARGet, keyName, '1000000'])
        .mockResolvedValue(value2);

      await expect(
        service.getElement(mockBrowserClientMetadata, {
          keyName,
          index: '1000000',
        }),
      ).resolves.toEqual({ keyName, index: '1000000', value: value2 });
    });

    it('throws not found for a hole', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolArrayCommands.ARGet, keyName, '9'])
        .mockResolvedValue(null);

      await expect(
        service.getElement(mockBrowserClientMetadata, { keyName, index: '9' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setElement', () => {
    it('sets an existing array element by string index', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);

      await service.setElement(mockBrowserClientMetadata, {
        keyName,
        index: '1000000',
        value,
      });

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ARSet,
        keyName,
        '1000000',
        value,
      ]);
    });
  });

  describe('deleteElements', () => {
    it('removes indexes and returns affected count', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);
      when(client.sendCommand)
        .calledWith([BrowserToolArrayCommands.ARDel, keyName, '0', '1000000'])
        .mockResolvedValue(2);

      await expect(
        service.deleteElements(mockBrowserClientMetadata, {
          keyName,
          indexes: ['0', '1000000'],
        }),
      ).resolves.toEqual({ affected: 2 });
    });
  });

  describe('searchElements', () => {
    it('uses ARGREP with WITHVALUES and LIMIT', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);
      client.sendPipeline.mockResolvedValue([
        [null, 2],
        [null, 10],
        [null, ['3', value]],
      ]);

      const result = await service.searchElements(mockBrowserClientMetadata, {
        keyName,
        query: Buffer.from('value'),
        predicate: ArraySearchPredicate.Match,
        count: 15,
      });

      expect(client.sendPipeline).toHaveBeenCalledWith([
        [BrowserToolArrayCommands.ARCount, keyName],
        [BrowserToolArrayCommands.ARLen, keyName],
        [
          BrowserToolArrayCommands.ARGrep,
          keyName,
          '-',
          '+',
          ArraySearchPredicate.Match,
          Buffer.from('value'),
          'WITHVALUES',
          'LIMIT',
          15,
        ],
      ]);
      expect(result.elements).toEqual([{ index: '3', value }]);
    });
  });

  describe('errors', () => {
    it('maps WRONGTYPE to BadRequestException', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARCOUNT',
      };
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);
      client.sendPipeline.mockRejectedValue(replyError);

      await expect(
        service.getElements(mockBrowserClientMetadata, { keyName, count: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('maps ACL errors to ForbiddenException', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARSCAN',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getElements(mockBrowserClientMetadata, { keyName, count: 10 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
