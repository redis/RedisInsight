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
  aggregateArrayDtoFactory,
  createContiguousArrayDtoFactory,
  createSparseArrayDtoFactory,
  deleteArrayElementsDtoFactory,
  deleteArrayRangeDtoFactory,
  getArraySearchDtoFactory,
  getArraySearchResponseFactory,
  setArrayElementDtoFactory,
  appendArrayElementDtoFactory,
} from 'src/modules/browser/array/__tests__/array.factory';
import {
  mockArrayCount,
  mockArrayElement1,
  mockArrayLength,
  mockArrayNextIndex,
  mockArrayRangeWithGaps,
  mockArraySearchReplyIndexesOnly,
  mockArraySearchReplyWithValues,
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
import {
  ArrayAggregateOperation,
  ArrayCombinator,
  ArrayGrepCriteria,
} from 'src/modules/browser/array/dto';
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

    it('should forward reversed ranges (start > end) to Redis as-is', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArGetRange,
          mockGetArrayRangeDto.keyName,
          '5',
          '0',
        ])
        .mockResolvedValue(mockArrayRangeWithGaps);

      await service.getRange(mockBrowserClientMetadata, {
        ...mockGetArrayRangeDto,
        start: '5',
        end: '0',
      });

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArGetRange,
        mockGetArrayRangeDto.keyName,
        '5',
        '0',
      ]);
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
        .calledWith(
          [
            BrowserToolArrayCommands.ArScan,
            mockGetArrayScanDto.keyName,
            mockGetArrayScanDto.start,
            mockGetArrayScanDto.end,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue(flatReply);
    });

    it('should pair flat reply into structured elements', async () => {
      const result = await service.scan(
        mockBrowserClientMetadata,
        mockGetArrayScanDto,
      );
      expect(result).toEqual(mockGetArrayScanResponse);
    });

    it('should pair nested [[index, value], ...] reply (Redis 8.8 shape)', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArScan,
            mockGetArrayScanDto.keyName,
            mockGetArrayScanDto.start,
            mockGetArrayScanDto.end,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue([
          [Buffer.from('0'), mockArrayElement1],
          [Buffer.from('1'), Buffer.from('20.4')],
        ]);
      const result = await service.scan(
        mockBrowserClientMetadata,
        mockGetArrayScanDto,
      );
      expect(result).toEqual(mockGetArrayScanResponse);
    });

    it('should drop nested entries with a nil half', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArScan,
            mockGetArrayScanDto.keyName,
            mockGetArrayScanDto.start,
            mockGetArrayScanDto.end,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue([
          [Buffer.from('0'), mockArrayElement1],
          [Buffer.from('1'), null],
          [Buffer.from('2')],
        ]);
      const result = await service.scan(
        mockBrowserClientMetadata,
        mockGetArrayScanDto,
      );
      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].index).toBe('0');
    });

    it('should append LIMIT when provided', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArScan,
            mockGetArrayScanDto.keyName,
            mockGetArrayScanDto.start,
            mockGetArrayScanDto.end,
            'LIMIT',
            50,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue([Buffer.from('0'), mockArrayElement1]);

      const result = await service.scan(mockBrowserClientMetadata, {
        ...mockGetArrayScanDto,
        limit: 50,
      });
      expect(result.elements).toHaveLength(1);
    });

    it('should treat an explicit null limit the same as omitted', async () => {
      const result = await service.scan(mockBrowserClientMetadata, {
        ...mockGetArrayScanDto,
        limit: null as unknown as number,
      });

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArScan,
          mockGetArrayScanDto.keyName,
          mockGetArrayScanDto.start,
          mockGetArrayScanDto.end,
        ],
        { integerReply: 'bigint' },
      );
      expect(result).toEqual(mockGetArrayScanResponse);
    });

    it('should drop pairs whose value or index is null/undefined', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArScan,
            mockGetArrayScanDto.keyName,
            mockGetArrayScanDto.start,
            mockGetArrayScanDto.end,
          ],
          { integerReply: 'bigint' },
        )
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

    // No span cap on scan: ARSCAN skips empty slots server-side and the
    // sparse-array use case routinely spans far more indexes than it
    // returns. The DTO caps `limit` at ARRAY_RANGE_MAX_ELEMENTS to keep
    // result-set size bounded — exercised via DTO validation tests, not
    // here (the service trusts the DTO).

    it('should forward reversed ranges (start > end) to Redis as-is', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArScan,
            mockGetArrayScanDto.keyName,
            '5',
            '0',
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue(flatReply);

      await service.scan(mockBrowserClientMetadata, {
        ...mockGetArrayScanDto,
        start: '5',
        end: '0',
      });

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArScan,
          mockGetArrayScanDto.keyName,
          '5',
          '0',
        ],
        { integerReply: 'bigint' },
      );
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARSCAN',
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolArrayCommands.ArScan]),
          expect.anything(),
        )
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
        .calledWith([command, mockKeyDto.keyName], { integerReply: 'bigint' })
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
        .calledWith([command, mockKeyDto.keyName], { integerReply: 'bigint' })
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

  describe('getNextIndex (exhausted)', () => {
    it('should surface null index when ARNEXT returns nil', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolArrayCommands.ArNext, mockKeyDto.keyName], {
          integerReply: 'bigint',
        })
        .mockResolvedValue(null);

      const result = await service.getNextIndex(
        mockBrowserClientMetadata,
        mockKeyDto,
      );

      expect(result).toEqual({ keyName: mockKeyDto.keyName, index: null });
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

  describe('setElement', () => {
    // keyName matches mockKeyDto so the shared key-existence stub resolves.
    const dto = setArrayElementDtoFactory.build({
      keyName: mockKeyDto.keyName,
      index: '5',
    });

    it('should set the element via ARSET key index value', async () => {
      await expect(
        service.setElement(mockBrowserClientMetadata, dto),
      ).resolves.not.toThrow();
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArSet,
        dto.keyName,
        dto.index,
        dto.value,
      ]);
    });

    it('should reject when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.setElement(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARSET',
      };
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolArrayCommands.ArSet]))
        .mockRejectedValue(replyError);
      await expect(
        service.setElement(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARSET',
      };
      client.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.setElement(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('search', () => {
    // keyName matches mockKeyDto so the shared key-existence stub resolves.
    const mockGetArraySearchDto = getArraySearchDtoFactory.build({
      keyName: mockKeyDto.keyName,
    });
    const mockGetArraySearchResponse = getArraySearchResponseFactory.build({
      keyName: mockGetArraySearchDto.keyName,
    });

    it('runs ARGREP with WITHVALUES by default and parses index/value pairs', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolArrayCommands.ArGrep]),
          expect.anything(),
        )
        .mockResolvedValue(mockArraySearchReplyWithValues);

      const result = await service.search(
        mockBrowserClientMetadata,
        mockGetArraySearchDto,
      );

      expect(result).toEqual(mockGetArraySearchResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArGrep,
          mockGetArraySearchDto.keyName,
          '-',
          '+',
          'MATCH',
          '21.4',
          'WITHVALUES',
        ],
        { integerReply: 'bigint' },
      );
    });

    it('appends the global connective only with 2+ predicates', async () => {
      when(client.sendCommand).mockResolvedValue([]);

      await service.search(mockBrowserClientMetadata, {
        keyName: mockGetArraySearchDto.keyName,
        predicates: [
          { criteria: ArrayGrepCriteria.Glob, value: '21.*' },
          { criteria: ArrayGrepCriteria.Exact, value: '99' },
        ],
        combinator: ArrayCombinator.Or,
      });

      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArGrep,
          mockGetArraySearchDto.keyName,
          '-',
          '+',
          'GLOB',
          '21.*',
          'EXACT',
          '99',
          'OR',
          'WITHVALUES',
        ],
        { integerReply: 'bigint' },
      );
    });

    it('sends no connective when omitted so the server applies its default', async () => {
      when(client.sendCommand).mockResolvedValue([]);

      await service.search(mockBrowserClientMetadata, {
        keyName: mockGetArraySearchDto.keyName,
        predicates: [
          { criteria: ArrayGrepCriteria.Match, value: 'a' },
          { criteria: ArrayGrepCriteria.Match, value: 'b' },
        ],
      });

      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArGrep,
          mockGetArraySearchDto.keyName,
          '-',
          '+',
          'MATCH',
          'a',
          'MATCH',
          'b',
          'WITHVALUES',
        ],
        { integerReply: 'bigint' },
      );
    });

    it('parses the nested [[index, value], ...] reply shape (Redis 8.8)', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolArrayCommands.ArGrep]),
          expect.anything(),
        )
        .mockResolvedValue([
          ['5', '21.4'],
          ['6', '21.9'],
        ]);

      const result = await service.search(
        mockBrowserClientMetadata,
        mockGetArraySearchDto,
      );

      expect(result).toEqual(mockGetArraySearchResponse);
    });

    it('treats an explicit null withValues like omitted (defaults to WITHVALUES)', async () => {
      when(client.sendCommand).mockResolvedValue([]);

      await service.search(mockBrowserClientMetadata, {
        keyName: mockGetArraySearchDto.keyName,
        predicates: [{ criteria: ArrayGrepCriteria.Match, value: 'x' }],
        withValues: null as unknown as boolean,
      });

      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArGrep,
          mockGetArraySearchDto.keyName,
          '-',
          '+',
          'MATCH',
          'x',
          'WITHVALUES',
        ],
        { integerReply: 'bigint' },
      );
    });

    it('passes range, NOCASE and LIMIT and omits WITHVALUES when withValues=false', async () => {
      when(client.sendCommand).mockResolvedValue(
        mockArraySearchReplyIndexesOnly,
      );

      const result = await service.search(mockBrowserClientMetadata, {
        keyName: mockGetArraySearchDto.keyName,
        predicates: [{ criteria: ArrayGrepCriteria.Match, value: 'x' }],
        start: '10',
        end: '20',
        nocase: true,
        withValues: false,
        limit: 50,
      });

      expect(client.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArGrep,
          mockGetArraySearchDto.keyName,
          '10',
          '20',
          'MATCH',
          'x',
          'NOCASE',
          'LIMIT',
          50,
        ],
        { integerReply: 'bigint' },
      );
      expect(result.elements).toEqual([
        { index: '5', value: null },
        { index: '6', value: null },
      ]);
    });

    it('throws BadRequest on a wrong-type key', async () => {
      when(client.sendCommand).mockRejectedValue(mockRedisWrongTypeError);

      await expect(
        service.search(mockBrowserClientMetadata, mockGetArraySearchDto),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    [
      "ERR invalid regular expression: Missing ']'",
      'ERR regular expression is empty',
      'ERR regular expression backreferences are not supported',
    ].forEach((message) => {
      it(`maps RE validation error to BadRequest: "${message}"`, async () => {
        when(client.sendCommand).mockRejectedValue({ message });

        await expect(
          service.search(mockBrowserClientMetadata, mockGetArraySearchDto),
        ).rejects.toBeInstanceOf(BadRequestException);
      });
    });

    it('throws Forbidden on an ACL error', async () => {
      when(client.sendCommand).mockRejectedValue(mockRedisNoPermError);

      await expect(
        service.search(mockBrowserClientMetadata, mockGetArraySearchDto),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('appendElement', () => {
    // keyName matches mockKeyDto so the shared key-existence stub resolves.
    const dto = appendArrayElementDtoFactory.build({
      keyName: mockKeyDto.keyName,
    });

    it('should append at the current length (ARLEN then ARSET) and return the index', async () => {
      // ARLEN can exceed 2^53; the bigint opt-in keeps the derived index exact.
      // 2^53 + 1 (9007199254740993) is odd and unrepresentable as a float64, so
      // a rounded read would land on the wrong slot.
      when(client.sendCommand)
        .calledWith([BrowserToolArrayCommands.ArLen, dto.keyName], {
          integerReply: 'bigint',
        })
        .mockResolvedValue(BigInt('9007199254740993'));

      const result = await service.appendElement(
        mockBrowserClientMetadata,
        dto,
      );

      expect(result).toEqual({
        keyName: dto.keyName,
        index: '9007199254740993',
      });
      expect(client.sendCommand).toHaveBeenCalledWith(
        [BrowserToolArrayCommands.ArLen, dto.keyName],
        { integerReply: 'bigint' },
      );
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArSet,
        dto.keyName,
        '9007199254740993',
        dto.value,
      ]);
    });

    it('should reject when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, dto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.appendElement(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject with BadRequest when the array is full (ARLEN === 2^64-1)', async () => {
      // Top index already 2^64-2, so the next index is the reserved 2^64-1 —
      // guard it before ARSET rather than letting Redis 500.
      when(client.sendCommand)
        .calledWith([BrowserToolArrayCommands.ArLen, dto.keyName], {
          integerReply: 'bigint',
        })
        .mockResolvedValue('18446744073709551615');

      await expect(
        service.appendElement(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(BadRequestException);
      expect(client.sendCommand).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolArrayCommands.ArSet,
          dto.keyName,
          '18446744073709551615',
        ]),
      );
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARLEN',
      };
      when(client.sendCommand)
        .calledWith([BrowserToolArrayCommands.ArLen, dto.keyName], {
          integerReply: 'bigint',
        })
        .mockRejectedValue(replyError);
      await expect(
        service.appendElement(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARSET',
      };
      client.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.appendElement(mockBrowserClientMetadata, dto),
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

  describe('deleteElements', () => {
    // keyName matches mockKeyDto so the shared key-existence stub resolves.
    const dto = deleteArrayElementsDtoFactory.build({
      keyName: mockKeyDto.keyName,
      indexes: ['0', '1', '3'],
    });

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArDel,
          dto.keyName,
          ...dto.indexes,
        ])
        .mockResolvedValue('2');
    });

    it('should delete via ARDEL key index... and return the affected count', async () => {
      const result = await service.deleteElements(
        mockBrowserClientMetadata,
        dto,
      );
      expect(result).toEqual({ affected: '2' });
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArDel,
        dto.keyName,
        ...dto.indexes,
      ]);
    });

    it('should reject when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.deleteElements(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARDEL',
      };
      when(client.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolArrayCommands.ArDel]))
        .mockRejectedValue(replyError);
      await expect(
        service.deleteElements(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARDEL',
      };
      client.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.deleteElements(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteRange', () => {
    // keyName matches mockKeyDto so the shared key-existence stub resolves.
    const dto = deleteArrayRangeDtoFactory.build({
      keyName: mockKeyDto.keyName,
      start: '0',
      end: '3',
    });

    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArDelRange,
          dto.keyName,
          dto.start,
          dto.end,
        ])
        .mockResolvedValue('2');
    });

    it('should delete via ARDELRANGE key start end and return the affected count', async () => {
      const result = await service.deleteRange(mockBrowserClientMetadata, dto);
      expect(result).toEqual({ affected: '2' });
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArDelRange,
        dto.keyName,
        dto.start,
        dto.end,
      ]);
    });

    it('should forward reversed ranges (start > end) to Redis as-is', async () => {
      const reversed = deleteArrayRangeDtoFactory.build({
        keyName: mockKeyDto.keyName,
        start: '3',
        end: '0',
      });
      when(client.sendCommand)
        .calledWith([
          BrowserToolArrayCommands.ArDelRange,
          reversed.keyName,
          reversed.start,
          reversed.end,
        ])
        .mockResolvedValue('2');

      await service.deleteRange(mockBrowserClientMetadata, reversed);

      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolArrayCommands.ArDelRange,
        reversed.keyName,
        '3',
        '0',
      ]);
    });

    it('should reject when key does not exist', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockKeyDto.keyName])
        .mockResolvedValue(0);
      await expect(
        service.deleteRange(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'ARDELRANGE',
      };
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([BrowserToolArrayCommands.ArDelRange]),
        )
        .mockRejectedValue(replyError);
      await expect(
        service.deleteRange(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'ARDELRANGE',
      };
      client.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.deleteRange(mockBrowserClientMetadata, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('aggregate', () => {
    const mockAggregateArrayDto = aggregateArrayDtoFactory.build();
    const mockArrayAggregateSumResult = '104.7';
    const mockAggregateArrayResponse = {
      keyName: mockAggregateArrayDto.keyName,
      result: mockArrayAggregateSumResult,
    };

    beforeEach(() => {
      // Key exists by default; the not-exists test overrides it.
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAggregateArrayDto.keyName,
        ])
        .mockResolvedValue(1);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArOp,
            mockAggregateArrayDto.keyName,
            mockAggregateArrayDto.start,
            mockAggregateArrayDto.end,
            mockAggregateArrayDto.operation,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue(Buffer.from(mockArrayAggregateSumResult));
    });

    it('should return the aggregation result as a string', async () => {
      const result = await service.aggregate(
        mockBrowserClientMetadata,
        mockAggregateArrayDto,
      );
      expect(result).toEqual(mockAggregateArrayResponse);
    });

    it('should append the value arg for MATCH', async () => {
      const dto = {
        ...mockAggregateArrayDto,
        operation: ArrayAggregateOperation.Match,
        value: '20.4',
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArOp,
            dto.keyName,
            dto.start,
            dto.end,
            dto.operation,
            dto.value,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue(1);

      const result = await service.aggregate(mockBrowserClientMetadata, dto);
      expect(result.result).toBe('1');
    });

    it('should not append a value arg for non-MATCH operations', async () => {
      await service.aggregate(mockBrowserClientMetadata, {
        ...mockAggregateArrayDto,
        // value intentionally set — should be ignored when operation !== MATCH.
        value: 'ignored',
      });
      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith(
        [
          BrowserToolArrayCommands.ArOp,
          mockAggregateArrayDto.keyName,
          mockAggregateArrayDto.start,
          mockAggregateArrayDto.end,
          mockAggregateArrayDto.operation,
        ],
        { integerReply: 'bigint' },
      );
    });

    it('should normalize integer replies (USED) to a string', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArOp,
            mockAggregateArrayDto.keyName,
            mockAggregateArrayDto.start,
            mockAggregateArrayDto.end,
            ArrayAggregateOperation.Used,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue(5);

      const result = await service.aggregate(mockBrowserClientMetadata, {
        ...mockAggregateArrayDto,
        operation: ArrayAggregateOperation.Used,
      });
      expect(result.result).toBe('5');
    });

    it('should return null when AROP yields a nil reply', async () => {
      // SUM over an empty/non-numeric range returns nil; the API surfaces
      // that as `result: null` instead of throwing a 500.
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          [
            BrowserToolArrayCommands.ArOp,
            mockAggregateArrayDto.keyName,
            mockAggregateArrayDto.start,
            mockAggregateArrayDto.end,
            mockAggregateArrayDto.operation,
          ],
          { integerReply: 'bigint' },
        )
        .mockResolvedValue(null);

      const result = await service.aggregate(
        mockBrowserClientMetadata,
        mockAggregateArrayDto,
      );
      expect(result.result).toBeNull();
    });

    // Binary elements and zero-length bulk strings are valid RedisString
    // values the create DTO accepts, so MATCH must forward them verbatim
    // rather than reject them.
    it.each([
      { description: 'a Buffer', value: Buffer.from([0x00, 0xff, 0x10]) },
      { description: 'an empty string', value: '' },
      { description: 'an empty Buffer', value: Buffer.alloc(0) },
    ])(
      'should pass $description value through to AROP for MATCH',
      async ({ value }) => {
        const dto = {
          ...mockAggregateArrayDto,
          operation: ArrayAggregateOperation.Match,
          value,
        };
        when(mockStandaloneRedisClient.sendCommand)
          .calledWith(
            [
              BrowserToolArrayCommands.ArOp,
              dto.keyName,
              dto.start,
              dto.end,
              dto.operation,
              dto.value,
            ],
            { integerReply: 'bigint' },
          )
          .mockResolvedValue(2);

        const result = await service.aggregate(mockBrowserClientMetadata, dto);
        expect(result.result).toBe('2');
      },
    );

    it('should reject MATCH when value is undefined', async () => {
      // Mirrors the DTO @ValidateIf/@IsRedisString contract for the
      // case where the controller layer is bypassed.
      await expect(
        service.aggregate(mockBrowserClientMetadata, {
          ...mockAggregateArrayDto,
          operation: ArrayAggregateOperation.Match,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when key does not exist', async () => {
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockAggregateArrayDto.keyName,
        ])
        .mockResolvedValue(0);
      await expect(
        service.aggregate(mockBrowserClientMetadata, mockAggregateArrayDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject when range exceeds the 1M cap', async () => {
      await expect(
        service.aggregate(mockBrowserClientMetadata, {
          ...mockAggregateArrayDto,
          start: '0',
          end: String(ARRAY_RANGE_MAX_ELEMENTS),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rethrow BadRequest on WrongType', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'AROP',
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining([BrowserToolArrayCommands.ArOp]), {
          integerReply: 'bigint',
        })
        .mockRejectedValue(replyError);
      await expect(
        service.aggregate(mockBrowserClientMetadata, mockAggregateArrayDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should map ACL error to Forbidden', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'AROP',
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);
      await expect(
        service.aggregate(mockBrowserClientMetadata, mockAggregateArrayDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
