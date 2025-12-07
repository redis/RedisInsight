import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import { flatMap } from 'lodash';
import { ReplyError } from 'src/models/redis-client';
import {
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockBrowserClientMetadata,
  mockDatabaseRecommendationService,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { GetHashFieldsDto, HashFieldDto } from 'src/modules/browser/hash/dto';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  mockAddFieldsDto,
  mockAddFieldsWithExpirationDto,
  mockCreateHashWithExpireAndFieldsExpireDto,
  mockCreateHashWithExpireDto,
  mockDeleteFieldsDto,
  mockGetFieldsDto,
  mockGetFieldsResponse,
  mockGetFieldsWithTtlResponse,
  mockHashField,
  mockHashFieldTtlDto,
  mockHashFieldTtlDto2,
  mockHashFieldTtlDto3,
  mockHashFieldWithExpire,
  mockHashFieldWithExpire2,
  mockRedisHScanResponse,
  mockRedisHScanWithFieldsExpireResponse,
  mockRedisHTtlResponse,
  mockUpdateHashFieldsTtlDto,
} from 'src/modules/browser/__mocks__';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { HashService } from 'src/modules/browser/hash/hash.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisFeature } from 'src/modules/redis/client';
import apiConfig, { Config } from 'src/utils/config';

const REDIS_SCAN_CONFIG = apiConfig.get('redis_scan') as Config['redis_scan'];

describe('HashService', () => {
  const client = mockStandaloneRedisClient;
  let service: HashService;
  let recommendationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<HashService>(HashService);
    recommendationService = module.get<DatabaseRecommendationService>(
      DatabaseRecommendationService,
    );
    client.sendPipeline = jest.fn().mockResolvedValue([[null, '1']]);
  });

  describe('createHash', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(false);
    });
    it('create hash with expiration', async () => {
      expect(
        await service.createHash(
          mockBrowserClientMetadata,
          mockCreateHashWithExpireDto,
        ),
      ).toEqual(undefined);
      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolHashCommands.HSet,
          mockCreateHashWithExpireDto.keyName,
          mockHashField.field,
          mockHashField.value,
        ],
        [
          BrowserToolKeysCommands.Expire,
          mockCreateHashWithExpireDto.keyName,
          mockCreateHashWithExpireDto.expire,
        ],
      ]);
      expect(mockStandaloneRedisClient.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.HashFieldsExpiration,
      );
    });
    it('create hash with expiration but without fields exp since no expire was provided for fields', async () => {
      mockStandaloneRedisClient.isFeatureSupported.mockResolvedValueOnce(true);

      expect(
        await service.createHash(
          mockBrowserClientMetadata,
          mockCreateHashWithExpireDto,
        ),
      ).toEqual(undefined);
      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolHashCommands.HSet,
          mockCreateHashWithExpireDto.keyName,
          mockHashField.field,
          mockHashField.value,
        ],
        [
          BrowserToolKeysCommands.Expire,
          mockCreateHashWithExpireDto.keyName,
          mockCreateHashWithExpireDto.expire,
        ],
      ]);
      expect(mockStandaloneRedisClient.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.HashFieldsExpiration,
      );
    });
    it('create hash with expiration and fields expiration', async () => {
      mockStandaloneRedisClient.isFeatureSupported.mockResolvedValueOnce(true);

      expect(
        await service.createHash(
          mockBrowserClientMetadata,
          mockCreateHashWithExpireAndFieldsExpireDto,
        ),
      ).toEqual(undefined);
      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolHashCommands.HSet,
          mockCreateHashWithExpireAndFieldsExpireDto.keyName,
          mockHashField.field,
          mockHashField.value,
          mockHashFieldWithExpire.field,
          mockHashFieldWithExpire.value,
          mockHashFieldWithExpire2.field,
          mockHashFieldWithExpire2.value,
        ],
        [
          BrowserToolKeysCommands.Expire,
          mockCreateHashWithExpireAndFieldsExpireDto.keyName,
          mockCreateHashWithExpireAndFieldsExpireDto.expire,
        ],
        [
          BrowserToolHashCommands.HExpire,
          mockCreateHashWithExpireAndFieldsExpireDto.keyName,
          mockHashFieldWithExpire.expire,
          'fields',
          '1',
          mockHashFieldWithExpire.field,
        ],
        [
          BrowserToolHashCommands.HExpire,
          mockCreateHashWithExpireAndFieldsExpireDto.keyName,
          mockHashFieldWithExpire2.expire,
          'fields',
          '1',
          mockHashFieldWithExpire2.field,
        ],
      ]);
      expect(mockStandaloneRedisClient.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.HashFieldsExpiration,
      );
    });
    it('create hash without expiration', async () => {
      const { keyName, fields } = mockAddFieldsDto;
      const commandArgs = flatMap(fields, ({ field, value }: HashFieldDto) => [
        field,
        value,
      ]);

      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HSet, keyName, ...commandArgs])
        .mockResolvedValue(1);

      expect(
        await service.createHash(mockBrowserClientMetadata, mockAddFieldsDto),
      ).toEqual(undefined);
      expect(mockStandaloneRedisClient.sendPipeline).toHaveBeenCalledWith([
        [BrowserToolHashCommands.HSet, keyName, ...commandArgs],
      ]);
    });
    it('key with this name exist', async () => {
      const { keyName, fields } = mockAddFieldsDto;
      const args = flatMap(fields, ({ field, value }: HashFieldDto) => [
        field,
        value,
      ]);

      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, keyName])
        .mockResolvedValue(true);

      await expect(
        service.createHash(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(ConflictException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HSet,
        keyName,
        ...args,
      ]);
    });
    it("user don't have required permissions for createHash", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HSET',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.createHash(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getFields', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HLen, mockAddFieldsDto.keyName])
        .mockResolvedValue(mockAddFieldsDto.fields.length);
    });
    it('succeed to get fields of the hash', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockRedisHScanResponse);

      const result = await service.getFields(
        mockBrowserClientMetadata,
        mockGetFieldsDto,
      );
      expect(result).toEqual(mockGetFieldsResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]),
      );
    });
    it('succeed to get fields of the hash with ttls', async () => {
      mockStandaloneRedisClient.isFeatureSupported.mockResolvedValueOnce(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockRedisHScanWithFieldsExpireResponse);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HLen,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockGetFieldsWithTtlResponse.total);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HTtl,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockRedisHTtlResponse);

      const result = await service.getFields(
        mockBrowserClientMetadata,
        mockGetFieldsDto,
      );
      expect(result).toEqual(mockGetFieldsWithTtlResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]),
      );
    });
    it('should not fail in case of ttl query error and return results without ttl field', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'httl',
      };
      mockStandaloneRedisClient.isFeatureSupported.mockResolvedValueOnce(true);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockRedisHScanWithFieldsExpireResponse);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HLen,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockGetFieldsWithTtlResponse.total);
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HTtl,
            expect.anything(),
          ]),
        )
        .mockRejectedValueOnce(replyError);

      const result = await service.getFields(
        mockBrowserClientMetadata,
        mockGetFieldsDto,
      );
      expect(result).toEqual({
        ...mockGetFieldsWithTtlResponse,
        fields: mockGetFieldsWithTtlResponse.fields.map((field) => ({
          ...field,
          expire: undefined,
        })),
      });
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]),
      );
    });
    it('succeed to find exact field in the hash', async () => {
      const item = mockAddFieldsDto.fields[0];
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: item.field.toString(),
      };
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HGet, dto.keyName, dto.match])
        .mockResolvedValue(item.value);

      const result = await service.getFields(mockBrowserClientMetadata, dto);

      expect(result).toEqual(mockGetFieldsResponse);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HScan,
        expect.anything(),
      ]);
    });
    it('failed to find exact field in the hash', async () => {
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: 'field',
      };
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HGet, dto.keyName, dto.match])
        .mockResolvedValue(null);

      const result = await service.getFields(mockBrowserClientMetadata, dto);

      expect(result).toEqual({ ...mockGetFieldsResponse, fields: [] });
    });
    it('should not call scan when math contains escaped glob', async () => {
      const item = {
        field: Buffer.from('fi[a-e]ld'),
        value: Buffer.from('value'),
      };
      const dto: GetHashFieldsDto = {
        ...mockGetFieldsDto,
        match: 'fi\\[a-e\\]ld',
      };
      when(client.sendCommand)
        .calledWith([
          BrowserToolHashCommands.HGet,
          dto.keyName,
          item.field.toString(),
        ])
        .mockResolvedValue('value');

      const result = await service.getFields(mockBrowserClientMetadata, dto);

      expect(result).toEqual({ ...mockGetFieldsResponse, fields: [item] });
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HScan,
        expect.anything(),
      ]);
    });
    // TODO: uncomment after enabling threshold for hash scan
    // it('should stop hash full scan', async () => {
    //   const dto: GetHashFieldsDto = {
    //     ...mockGetFieldsDto,
    //     count: REDIS_SCAN_CONFIG.countDefault,
    //     match: '*un-exist-field*',
    //   };
    //   const maxScanCalls = Math.round(
    //     REDIS_SCAN_CONFIG.countThreshold / REDIS_SCAN_CONFIG.countDefault,
    //   );
    //   when(browserTool.execCommand)
    //     .calledWith(
    //       mockBrowserClientMetadata,
    //       BrowserToolHashCommands.HScan,
    //       expect.anything(),
    //     )
    //     .mockResolvedValue(['200', []]);
    //
    //   await service.getFields(mockBrowserClientMetadata, dto);
    //
    //   expect(browserTool.execCommand).toHaveBeenCalledTimes(maxScanCalls + 1);
    // });
    it('key with this name does not exist for getFields', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HLen, mockGetFieldsDto.keyName])
        .mockResolvedValue(0);

      await expect(
        service.getFields(mockBrowserClientMetadata, mockGetFieldsDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'HLEN' command not for hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HLEN',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getFields(mockBrowserClientMetadata, mockGetFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HLEN',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.getFields(mockBrowserClientMetadata, mockGetFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should call recommendationService', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockRedisHScanResponse);

      const result = await service.getFields(
        mockBrowserClientMetadata,
        mockGetFieldsDto,
      );
      expect(result).toEqual(mockGetFieldsResponse);
      expect(client.sendCommand).toHaveBeenCalledWith(
        expect.arrayContaining([
          BrowserToolHashCommands.HScan,
          expect.anything(),
        ]),
      );

      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.BIG_HASHES,
        { total: result.total, keyName: result.keyName },
      );

      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('scanHash', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolHashCommands.HLen, mockAddFieldsDto.keyName])
        .mockResolvedValue(mockAddFieldsDto.fields.length);
    });
    it('should scan with match="*" by default and default count', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockRedisHScanResponse);

      const result = await service.scanHash(mockStandaloneRedisClient, {
        keyName: mockGetFieldsDto.keyName,
        cursor: 0,
      });
      expect(result).toEqual({ ...mockGetFieldsResponse, total: undefined });
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolHashCommands.HScan,
        mockGetFieldsDto.keyName,
        '0',
        'MATCH',
        '*',
        'COUNT',
        REDIS_SCAN_CONFIG.countDefault,
      ]);
    });
    it('should scan with passed arguments', async () => {
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HScan,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(mockRedisHScanResponse);

      const result = await service.scanHash(
        mockStandaloneRedisClient,
        mockGetFieldsDto,
      );
      expect(result).toEqual({ ...mockGetFieldsResponse, total: undefined });
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolHashCommands.HScan,
        mockGetFieldsDto.keyName,
        '0',
        'MATCH',
        mockGetFieldsDto.match,
        'COUNT',
        mockGetFieldsDto.count,
      ]);
    });
  });

  describe('addFields', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(true);
    });
    it('succeed to add/update fields to the Hash data type', async () => {
      expect(
        await service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).toEqual(undefined);
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolKeysCommands.Exists,
        mockAddFieldsDto.keyName,
      ]);
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolHashCommands.HSet,
          mockAddFieldsDto.keyName,
          mockHashField.field,
          mockHashField.value,
        ],
      ]);
    });
    it('succeed add/update fields to the Hash data type without expiration fields when feature disabled', async () => {
      expect(
        await service.addFields(
          mockBrowserClientMetadata,
          mockAddFieldsWithExpirationDto,
        ),
      ).toEqual(undefined);
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolKeysCommands.Exists,
        mockAddFieldsDto.keyName,
      ]);
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolHashCommands.HSet,
          mockAddFieldsDto.keyName,
          mockHashField.field,
          mockHashField.value,
          mockHashFieldWithExpire.field,
          mockHashFieldWithExpire.value,
          mockHashFieldWithExpire2.field,
          mockHashFieldWithExpire2.value,
        ],
      ]);
    });
    it('succeed to add/update fields to the Hash data type with fields expiration', async () => {
      mockStandaloneRedisClient.isFeatureSupported.mockResolvedValueOnce(true);
      expect(
        await service.addFields(
          mockBrowserClientMetadata,
          mockAddFieldsWithExpirationDto,
        ),
      ).toEqual(undefined);
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolKeysCommands.Exists,
        mockAddFieldsWithExpirationDto.keyName,
      ]);
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolHashCommands.HSet,
          mockAddFieldsWithExpirationDto.keyName,
          mockHashField.field,
          mockHashField.value,
          mockHashFieldWithExpire.field,
          mockHashFieldWithExpire.value,
          mockHashFieldWithExpire2.field,
          mockHashFieldWithExpire2.value,
        ],
        [
          BrowserToolHashCommands.HExpire,
          mockAddFieldsWithExpirationDto.keyName,
          mockHashFieldWithExpire.expire,
          'fields',
          '1',
          mockHashFieldWithExpire.field,
        ],
        [
          BrowserToolHashCommands.HExpire,
          mockAddFieldsWithExpirationDto.keyName,
          mockHashFieldWithExpire2.expire,
          'fields',
          '1',
          mockHashFieldWithExpire2.field,
        ],
      ]);
    });
    it('key with this name does not exist for addFields', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(false);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HSet,
        expect.anything(),
      ]);
    });
    it("try to use 'HSET' command not for hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HSET',
      };
      client.sendPipeline.mockRejectedValue(replyError);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HSET',
      };
      client.sendPipeline.mockRejectedValue(replyError);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateTtl', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockUpdateHashFieldsTtlDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('should update ttl for 2 fields and persist one', async () => {
      expect(
        await service.updateTtl(
          mockBrowserClientMetadata,
          mockUpdateHashFieldsTtlDto,
        ),
      ).toEqual(undefined);
      expect(client.sendCommand).toHaveBeenCalledWith([
        BrowserToolKeysCommands.Exists,
        mockUpdateHashFieldsTtlDto.keyName,
      ]);
      expect(client.sendPipeline).toHaveBeenCalledWith([
        [
          BrowserToolHashCommands.HPersist,
          mockUpdateHashFieldsTtlDto.keyName,
          'fields',
          '1',
          mockHashFieldTtlDto.field,
        ],
        [
          BrowserToolHashCommands.HExpire,
          mockUpdateHashFieldsTtlDto.keyName,
          mockHashFieldTtlDto2.expire,
          'fields',
          '1',
          mockHashFieldTtlDto2.field,
        ],
        [
          BrowserToolHashCommands.HExpire,
          mockUpdateHashFieldsTtlDto.keyName,
          mockHashFieldTtlDto3.expire,
          'fields',
          '1',
          mockHashFieldTtlDto3.field,
        ],
      ]);
    });
    it('key with this name does not exist for addFields', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockUpdateHashFieldsTtlDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.updateTtl(
          mockBrowserClientMetadata,
          mockUpdateHashFieldsTtlDto,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HExpire,
        expect.anything(),
      ]);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HPersist,
        expect.anything(),
      ]);
    });
    it("try to use 'HEXPIRE' command not for hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HEXPIRE',
      };
      client.sendPipeline.mockResolvedValueOnce([[replyError, null]]);

      await expect(
        service.updateTtl(
          mockBrowserClientMetadata,
          mockUpdateHashFieldsTtlDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HEXPIRE',
      };
      client.sendPipeline.mockResolvedValueOnce([[replyError, null]]);

      await expect(
        service.addFields(mockBrowserClientMetadata, mockAddFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteFields', () => {
    beforeEach(() => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockDeleteFieldsDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeeded to delete fields from Hash data type', async () => {
      const { fields } = mockDeleteFieldsDto;
      when(client.sendCommand)
        .calledWith(
          expect.arrayContaining([
            BrowserToolHashCommands.HDel,
            expect.anything(),
          ]),
        )
        .mockResolvedValue(fields.length);

      const result = await service.deleteFields(
        mockBrowserClientMetadata,
        mockDeleteFieldsDto,
      );

      expect(result).toEqual({ affected: fields.length });
    });
    it('key with this name does not exist for deleteFields', async () => {
      when(client.sendCommand)
        .calledWith([
          BrowserToolKeysCommands.Exists,
          mockDeleteFieldsDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.deleteFields(mockBrowserClientMetadata, mockDeleteFieldsDto),
      ).rejects.toThrow(NotFoundException);
      expect(client.sendCommand).not.toHaveBeenCalledWith([
        BrowserToolHashCommands.HDel,
        expect.anything(),
      ]);
    });
    it("try to use 'HDEL' command not for Hash data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'HDEL',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteFields(mockBrowserClientMetadata, mockDeleteFieldsDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for deleteFields", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'HDEL',
      };
      client.sendCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteFields(mockBrowserClientMetadata, mockDeleteFieldsDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
