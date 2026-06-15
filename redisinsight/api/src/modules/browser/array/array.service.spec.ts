import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import { ReplyError } from 'src/models/redis-client';
import {
  mockBrowserClientMetadata,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
} from 'src/__mocks__';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { mockDatabaseClientFactory } from 'src/__mocks__/databases-client';
import { mockStandaloneRedisClient } from 'src/__mocks__/redis-client';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  createContiguousArrayDtoFactory,
  createSparseArrayDtoFactory,
} from 'src/modules/browser/array/__tests__/array.factory';
import {
  mockArrayCount,
  mockArrayElement1,
  mockArrayLength,
  mockArrayNextIndex,
  mockArrayRangeWithGaps,
  mockGetArrayCountResponse,
  mockGetArrayElementDto,
  mockGetArrayElementResponse,
  mockGetArrayLengthResponse,
  mockGetArrayMultiElementsDto,
  mockGetArrayMultiElementsResponse,
  mockGetArrayNextIndexResponse,
  mockGetArrayRangeDto,
  mockGetArrayRangeResponse,
  mockGetArrayScanDto,
  mockGetArrayScanResponse,
  mockKeyDto,
} from 'src/modules/browser/__mocks__';
import { ARRAY_RANGE_MAX_ELEMENTS } from 'src/modules/browser/array/constants';
import { ArrayService } from 'src/modules/browser/array/array.service';

describe('ArrayService', () => {
  const client = mockStandaloneRedisClient;
  let service: ArrayService;

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

    service = module.get(ArrayService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
    client.sendPipeline = jest.fn().mockResolvedValue(undefined);
    // Key exists by default for read paths; specific tests override.
    when(client.sendCommand)
      .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
      .mockResolvedValue(1);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createArray', () => {
    it('create contiguous array without expiration', async () => {
      const dto = createContiguousArrayDtoFactory.build();
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArSet,
        dto.keyName,
        dto.startIndex,
        ...(dto.values ?? []),
      ]);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it('create sparse array without expiration', async () => {
      const dto = createSparseArrayDtoFactory.build();
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArMSet,
        dto.keyName,
        ...(dto.elements ?? []).flatMap(({ index, value }) => [index, value]),
      ]);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it('create contiguous array with expiration', async () => {
      const dto = createContiguousArrayDtoFactory.build({ expire: 1000 });
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(false);
      when(client.sendPipeline)
        .calledWith([
          [
            BrowserToolArrayCommands.ArSet,
            dto.keyName,
            dto.startIndex,
            ...(dto.values ?? []),
          ],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([
          [null, 'OK'],
          [null, 1],
        ]);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolArrayCommands.ArSet,
          dto.keyName,
          dto.startIndex,
          ...(dto.values ?? []),
        ],
        [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
      ]);
    });

    it('key with this name exist', async () => {
      const dto = createContiguousArrayDtoFactory.build();
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(true);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST));
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });

    it("user don't have required permissions for createArray", async () => {
      const dto = createContiguousArrayDtoFactory.build();
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARSET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.createArray(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(client.sendCommand).toHaveBeenCalledTimes(1);
      expect(client.sendPipeline).not.toHaveBeenCalled();
    });
  });

  describe('getRange', () => {
    beforeEach(() => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArGetRange,
          mockGetArrayRangeDto.keyName,
          mockGetArrayRangeDto.start,
          mockGetArrayRangeDto.end,
        ])
        .mockResolvedValue(mockArrayRangeWithGaps);
    });

    it('should return range elements (with nulls for gaps)', async () => {
      const result = await service.getRange(
        mockBrowserClientMetadata,
        mockGetArrayRangeDto,
      );
      expect(result).toEqual(mockGetArrayRangeResponse);
    });

    it('should reject when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.getRange(mockBrowserClientMetadata, mockGetArrayRangeDto),
      ).rejects.toThrow(new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST));
    });

    it('should reject when range exceeds the 1M cap', async () => {
      await expect(
        service.getRange(mockBrowserClientMetadata, {
          ...mockGetArrayRangeDto,
          start: '0',
          end: String(ARRAY_RANGE_MAX_ELEMENTS),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when reversed range exceeds the 1M cap', async () => {
      await expect(
        service.getRange(mockBrowserClientMetadata, {
          ...mockGetArrayRangeDto,
          start: String(ARRAY_RANGE_MAX_ELEMENTS),
          end: '0',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARGETRANGE',
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArGetRange,
          expect.anything(),
          expect.anything(),
          expect.anything(),
        ])
        .mockRejectedValue(replyError);
      await expect(
        service.getRange(mockBrowserClientMetadata, mockGetArrayRangeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARGETRANGE',
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.getRange(mockBrowserClientMetadata, mockGetArrayRangeDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('scan', () => {
    const flatReply = [
      Buffer.from('0'),
      mockArrayElement1,
      Buffer.from('1'),
      Buffer.from('20.4'),
    ];

    beforeEach(() => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArScan,
          mockGetArrayScanDto.keyName,
          mockGetArrayScanDto.start,
          mockGetArrayScanDto.end,
        ])
        .mockResolvedValue(flatReply);
    });

    it('should pair flat reply into structured elements', async () => {
      const result = await service.scan(
        mockBrowserClientMetadata,
        mockGetArrayScanDto,
      );
      expect(result).toEqual(mockGetArrayScanResponse);
    });

    it('should append LIMIT when provided', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArScan,
          mockGetArrayScanDto.keyName,
          mockGetArrayScanDto.start,
          mockGetArrayScanDto.end,
          'LIMIT',
          50,
        ])
        .mockResolvedValue([Buffer.from('0'), mockArrayElement1]);

      const result = await service.scan(mockBrowserClientMetadata, {
        ...mockGetArrayScanDto,
        limit: 50,
      });
      expect(result.elements).toHaveLength(1);
    });

    it('should also accept the nested [[index, value], ...] reply shape', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArScan,
          mockGetArrayScanDto.keyName,
          mockGetArrayScanDto.start,
          mockGetArrayScanDto.end,
        ])
        .mockResolvedValue([
          [Buffer.from('0'), mockArrayElement1],
          [Buffer.from('1'), Buffer.from('20.4')],
        ] as unknown as (Buffer | string)[]);

      const result = await service.scan(
        mockBrowserClientMetadata,
        mockGetArrayScanDto,
      );
      expect(result.elements).toHaveLength(2);
      expect(result.elements[0].index).toBe('0');
      expect(result.elements[1].index).toBe('1');
    });

    it('should drop pairs whose value or index is null/undefined', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArScan,
          mockGetArrayScanDto.keyName,
          mockGetArrayScanDto.start,
          mockGetArrayScanDto.end,
        ])
        .mockResolvedValue([
          Buffer.from('0'),
          mockArrayElement1,
          Buffer.from('1'),
          null,
          Buffer.from('2'),
        ] as (Buffer | string | null)[]);

      const result = await service.scan(
        mockBrowserClientMetadata,
        mockGetArrayScanDto,
      );
      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].index).toBe('0');
    });

    it('should reject when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.scan(mockBrowserClientMetadata, mockGetArrayScanDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARSCAN',
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolArrayCommands.ArScan]))
        .mockRejectedValue(replyError);
      await expect(
        service.scan(mockBrowserClientMetadata, mockGetArrayScanDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARSCAN',
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.scan(mockBrowserClientMetadata, mockGetArrayScanDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe.each([
    {
      name: 'getLength',
      command: BrowserToolArrayCommands.ArLen,
      reply: 7,
      expected: mockGetArrayLengthResponse,
      stringValue: mockArrayLength,
      call: (svc: ArrayService) =>
        svc.getLength(mockBrowserClientMetadata, mockKeyDto),
    },
    {
      name: 'getCount',
      command: BrowserToolArrayCommands.ArCount,
      reply: 5,
      expected: mockGetArrayCountResponse,
      stringValue: mockArrayCount,
      call: (svc: ArrayService) =>
        svc.getCount(mockBrowserClientMetadata, mockKeyDto),
    },
    {
      name: 'getNextIndex',
      command: BrowserToolArrayCommands.ArNext,
      reply: 7,
      expected: mockGetArrayNextIndexResponse,
      stringValue: mockArrayNextIndex,
      call: (svc: ArrayService) =>
        svc.getNextIndex(mockBrowserClientMetadata, mockKeyDto),
    },
  ])('$name', ({ command, reply, expected, call }) => {
    beforeEach(() => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([command, mockKeyDto.keyName])
        .mockResolvedValue(reply);
    });

    it('should return the value as a string', async () => {
      const result = await call(service);
      expect(result).toEqual(expected);
    });

    it('should reject when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(0);
      await expect(call(service)).rejects.toThrow(NotFoundException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: command.toUpperCase(),
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([command, mockKeyDto.keyName])
        .mockRejectedValue(replyError);
      await expect(call(service)).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: command.toUpperCase(),
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);
      await expect(call(service)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getElement', () => {
    beforeEach(() => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArGet,
          mockGetArrayElementDto.keyName,
          mockGetArrayElementDto.index,
        ])
        .mockResolvedValue(mockArrayElement1);
    });

    it('should return the element value', async () => {
      const result = await service.getElement(
        mockBrowserClientMetadata,
        mockGetArrayElementDto,
      );
      expect(result).toEqual(mockGetArrayElementResponse);
    });

    it('should return null for an empty slot', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArGet,
          mockGetArrayElementDto.keyName,
          mockGetArrayElementDto.index,
        ])
        .mockResolvedValue(null);
      const result = await service.getElement(
        mockBrowserClientMetadata,
        mockGetArrayElementDto,
      );
      expect(result.value).toBeNull();
    });

    it('should reject when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.getElement(mockBrowserClientMetadata, mockGetArrayElementDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARGET',
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolArrayCommands.ArGet]))
        .mockRejectedValue(replyError);
      await expect(
        service.getElement(mockBrowserClientMetadata, mockGetArrayElementDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARGET',
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.getElement(mockBrowserClientMetadata, mockGetArrayElementDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMultiElements', () => {
    beforeEach(() => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArMGet,
          mockGetArrayMultiElementsDto.keyName,
          ...mockGetArrayMultiElementsDto.indexes,
        ])
        .mockResolvedValue([mockArrayElement1, Buffer.from('20.4'), null]);
    });

    it('should return values aligned with requested indexes', async () => {
      const result = await service.getMultiElements(
        mockBrowserClientMetadata,
        mockGetArrayMultiElementsDto,
      );
      expect(result).toEqual(mockGetArrayMultiElementsResponse);
    });

    it('should reject when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.getMultiElements(
          mockBrowserClientMetadata,
          mockGetArrayMultiElementsDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARMGET',
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolArrayCommands.ArMGet]))
        .mockRejectedValue(replyError);
      await expect(
        service.getMultiElements(
          mockBrowserClientMetadata,
          mockGetArrayMultiElementsDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARMGET',
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.getMultiElements(
          mockBrowserClientMetadata,
          mockGetArrayMultiElementsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
