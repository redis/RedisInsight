import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import {
  mockBrowserClientMetadata,
  mockBrowserHistoryService,
  mockClusterRedisClient,
  mockDatabaseClientFactory,
  mockRedisNoPermError,
  mockRedisUnknownIndexName,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import {
  RedisearchIndexDataType,
  RedisearchIndexKeyType,
} from 'src/modules/browser/redisearch/dto';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { mockIndexInfoDto, mockIndexInfoRaw } from 'src/__mocks__/redisearch';

const keyName1 = Buffer.from('keyName1');
const keyName2 = Buffer.from('keyName2');

const mockCreateRedisearchIndexDto = {
  index: 'indexName',
  type: RedisearchIndexKeyType.HASH,
  prefixes: ['device:', 'user:'],
  fields: [
    {
      name: 'text:field',
      type: RedisearchIndexDataType.TEXT,
    },
    {
      name: 'coordinates:field',
      type: RedisearchIndexDataType.GEO,
    },
  ],
};
const mockSearchRedisearchDto = {
  index: 'indexName',
  query: 'somequery:',
  limit: 10,
  offset: 0,
};

describe('RedisearchService', () => {
  const standaloneClient = mockStandaloneRedisClient;
  const clusterClient = mockClusterRedisClient;
  let service: RedisearchService;
  let databaseClientFactory: DatabaseClientFactory;
  let browserHistory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisearchService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: BrowserHistoryService,
          useFactory: mockBrowserHistoryService,
        },
      ],
    }).compile();

    service = module.get<RedisearchService>(RedisearchService);
    browserHistory = module.get<BrowserHistoryService>(BrowserHistoryService);
    databaseClientFactory = module.get<DatabaseClientFactory>(
      DatabaseClientFactory,
    );
    browserHistory.create.mockResolvedValue({});

    standaloneClient.sendCommand = jest.fn().mockResolvedValue(undefined);
    clusterClient.sendCommand = jest.fn().mockResolvedValue(undefined);
    clusterClient.nodes.mockReturnValue([
      mockStandaloneRedisClient,
      mockStandaloneRedisClient,
    ]);
  });

  describe('list', () => {
    it('should get list of indexes for standalone', async () => {
      standaloneClient.sendCommand.mockResolvedValue([keyName1, keyName2]);

      const list = await service.list(mockBrowserClientMetadata);

      expect(list).toEqual({
        indexes: [keyName1, keyName2],
      });
    });
    it('should get list of indexes for cluster (handle unique index name)', async () => {
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockResolvedValue(clusterClient);
      mockStandaloneRedisClient.sendCommand.mockResolvedValue([
        keyName1,
        keyName2,
      ]);

      const list = await service.list(mockBrowserClientMetadata);

      expect(list).toEqual({
        indexes: [keyName1, keyName2],
      });
    });
    it('should handle ACL error', async () => {
      standaloneClient.sendCommand.mockRejectedValueOnce(mockRedisNoPermError);

      try {
        await service.list(mockBrowserClientMetadata);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('createIndex', () => {
    it('should create index for standalone', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.INFO']))
        .mockRejectedValue(mockRedisUnknownIndexName);
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.CREATE']))
        .mockResolvedValue('OK');

      await service.createIndex(
        mockBrowserClientMetadata,
        mockCreateRedisearchIndexDto,
      );

      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(2);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        [
          'FT.CREATE',
          mockCreateRedisearchIndexDto.index,
          'ON',
          mockCreateRedisearchIndexDto.type,
          'PREFIX',
          2,
          ...mockCreateRedisearchIndexDto.prefixes,
          'SCHEMA',
          mockCreateRedisearchIndexDto.fields[0].name,
          mockCreateRedisearchIndexDto.fields[0].type,
          mockCreateRedisearchIndexDto.fields[1].name,
          mockCreateRedisearchIndexDto.fields[1].type,
        ],
        { replyEncoding: 'utf8' },
      );
    });
    it('should create index for cluster', async () => {
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockResolvedValue(clusterClient);
      when(clusterClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.INFO']))
        .mockRejectedValue(mockRedisUnknownIndexName);
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.CREATE']))
        .mockResolvedValueOnce('OK')
        .mockRejectedValue(new Error('ReplyError: MOVED to somenode'));

      await service.createIndex(
        mockBrowserClientMetadata,
        mockCreateRedisearchIndexDto,
      );

      expect(clusterClient.sendCommand).toHaveBeenCalledTimes(1);
      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(2);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        [
          'FT.CREATE',
          mockCreateRedisearchIndexDto.index,
          'ON',
          mockCreateRedisearchIndexDto.type,
          'PREFIX',
          2,
          ...mockCreateRedisearchIndexDto.prefixes,
          'SCHEMA',
          mockCreateRedisearchIndexDto.fields[0].name,
          mockCreateRedisearchIndexDto.fields[0].type,
          mockCreateRedisearchIndexDto.fields[1].name,
          mockCreateRedisearchIndexDto.fields[1].type,
        ],
        { replyEncoding: 'utf8' },
      );
    });
    it('should handle already existing index error', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.INFO']))
        .mockReturnValue({ any: 'data' });

      try {
        await service.createIndex(
          mockBrowserClientMetadata,
          mockCreateRedisearchIndexDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
      }
    });
    it('should handle ACL error (ft.info command)', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.INFO']))
        .mockRejectedValue(mockRedisNoPermError);

      try {
        await service.createIndex(
          mockBrowserClientMetadata,
          mockCreateRedisearchIndexDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should handle ACL error (ft.create command)', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.INFO']))
        .mockRejectedValue(mockRedisUnknownIndexName);
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.CREATE']))
        .mockRejectedValue(mockRedisNoPermError);

      try {
        await service.createIndex(
          mockBrowserClientMetadata,
          mockCreateRedisearchIndexDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('search', () => {
    it('should search in standalone', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.SEARCH']))
        .mockResolvedValue([100, keyName1, keyName2]);

      const res = await service.search(
        mockBrowserClientMetadata,
        mockSearchRedisearchDto,
      );

      expect(res).toEqual({
        cursor: mockSearchRedisearchDto.limit + mockSearchRedisearchDto.offset,
        scanned: 2,
        total: 100,
        maxResults: null,
        keys: [
          {
            name: keyName1,
          },
          {
            name: keyName2,
          },
        ],
      });

      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(3);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['FT.CONFIG', 'GET', 'MAXSEARCHRESULTS'],
        { replyEncoding: 'utf8' },
      );
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith([
        'FT.SEARCH',
        mockSearchRedisearchDto.index,
        mockSearchRedisearchDto.query,
        'NOCONTENT',
        'LIMIT',
        mockSearchRedisearchDto.offset,
        mockSearchRedisearchDto.limit,
      ]);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TYPE', keyName1],
        { replyEncoding: 'utf8' },
      );
      expect(browserHistory.create).toHaveBeenCalled();
    });
    it('should search in cluster', async () => {
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockResolvedValue(clusterClient);
      when(clusterClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.SEARCH']))
        .mockResolvedValue([100, keyName1, keyName2]);

      const res = await service.search(
        mockBrowserClientMetadata,
        mockSearchRedisearchDto,
      );

      expect(res).toEqual({
        cursor: mockSearchRedisearchDto.limit + mockSearchRedisearchDto.offset,
        scanned: 2,
        total: 100,
        maxResults: null,
        keys: [{ name: keyName1 }, { name: keyName2 }],
      });

      expect(clusterClient.sendCommand).toHaveBeenCalledTimes(3);
      expect(clusterClient.sendCommand).toHaveBeenCalledWith(
        ['FT.CONFIG', 'GET', 'MAXSEARCHRESULTS'],
        { replyEncoding: 'utf8' },
      );
      expect(clusterClient.sendCommand).toHaveBeenCalledWith([
        'FT.SEARCH',
        mockSearchRedisearchDto.index,
        mockSearchRedisearchDto.query,
        'NOCONTENT',
        'LIMIT',
        mockSearchRedisearchDto.offset,
        mockSearchRedisearchDto.limit,
      ]);
      expect(clusterClient.sendCommand).toHaveBeenCalledWith(
        ['TYPE', keyName1],
        { replyEncoding: 'utf8' },
      );
      expect(browserHistory.create).toHaveBeenCalled();
    });
    it('should handle ACL error (ft.info command)', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.SEARCH']))
        .mockRejectedValue(mockRedisNoPermError);

      try {
        await service.search(
          mockBrowserClientMetadata,
          mockSearchRedisearchDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should call "TYPE" and once "FT.CONFIG GET MAXSEARCHRESULTS" for all requests', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.SEARCH']))
        .mockResolvedValue([100, keyName1, keyName2]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.CONFIG', 'GET', 'MAXSEARCHRESULTS'], {
          replyEncoding: 'utf8',
        })
        .mockResolvedValue([['MAXSEARCHRESULTS', '10000']]);

      const res = await service.search(
        mockBrowserClientMetadata,
        mockSearchRedisearchDto,
      );
      await service.search(mockBrowserClientMetadata, mockSearchRedisearchDto);
      await service.search(mockBrowserClientMetadata, mockSearchRedisearchDto);

      expect(res).toEqual({
        cursor: mockSearchRedisearchDto.limit + mockSearchRedisearchDto.offset,
        scanned: 2,
        total: 100,
        maxResults: 10_000,
        keys: [
          {
            name: keyName1,
          },
          {
            name: keyName2,
          },
        ],
      });

      expect(standaloneClient.sendCommand).toHaveBeenCalledTimes(7);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['FT.CONFIG', 'GET', 'MAXSEARCHRESULTS'],
        { replyEncoding: 'utf8' },
      );
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith([
        'FT.SEARCH',
        mockSearchRedisearchDto.index,
        mockSearchRedisearchDto.query,
        'NOCONTENT',
        'LIMIT',
        mockSearchRedisearchDto.offset,
        mockSearchRedisearchDto.limit,
      ]);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TYPE', keyName1],
        { replyEncoding: 'utf8' },
      );
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith([
        'FT.SEARCH',
        mockSearchRedisearchDto.index,
        mockSearchRedisearchDto.query,
        'NOCONTENT',
        'LIMIT',
        mockSearchRedisearchDto.offset,
        mockSearchRedisearchDto.limit,
      ]);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TYPE', keyName1],
        { replyEncoding: 'utf8' },
      );
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith([
        'FT.SEARCH',
        mockSearchRedisearchDto.index,
        mockSearchRedisearchDto.query,
        'NOCONTENT',
        'LIMIT',
        mockSearchRedisearchDto.offset,
        mockSearchRedisearchDto.limit,
      ]);
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['TYPE', keyName1],
        { replyEncoding: 'utf8' },
      );
      expect(browserHistory.create).toHaveBeenCalled();
    });
  });

  describe('getInfo', () => {
    it('should get indexInfo', async () => {
      const mockIndexName = 'idx:movie';
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', mockIndexName], { replyEncoding: 'utf8' })
        .mockResolvedValue(mockIndexInfoRaw);

      const res = await service.getInfo(mockBrowserClientMetadata, {
        index: mockIndexName,
      });
      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['FT.INFO', mockIndexName],
        { replyEncoding: 'utf8' },
      );
      expect(res).toEqual(mockIndexInfoDto);
    });

    it('should throw error if index name was not provided', async () => {
      await expect(
        service.getInfo(mockBrowserClientMetadata, { index: '' }),
      ).rejects.toThrow('Index was not provided');
    });

    it('should throw error if client was not created', async () => {
      const error = new Error('Client was not created');
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockRejectedValue(error);

      await expect(
        service.getInfo(mockBrowserClientMetadata, { index: 'indexName' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteIndex', () => {
    it('should delete index for standalone', async () => {
      const mockIndexName = 'idx:movie';
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.DROPINDEX']))
        .mockResolvedValue(undefined);

      await service.deleteIndex(mockBrowserClientMetadata, {
        index: mockIndexName,
      });

      expect(standaloneClient.sendCommand).toHaveBeenCalledWith(
        ['FT.DROPINDEX', mockIndexName],
        { replyEncoding: 'utf8' },
      );
    });

    it('should delete index for cluster', async () => {
      const mockIndexName = 'idx:movie';
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockResolvedValue(clusterClient);
      when(clusterClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.DROPINDEX']))
        .mockResolvedValue(undefined);

      await service.deleteIndex(mockBrowserClientMetadata, {
        index: mockIndexName,
      });

      expect(clusterClient.sendCommand).toHaveBeenCalledWith(
        ['FT.DROPINDEX', mockIndexName],
        { replyEncoding: 'utf8' },
      );
    });

    it('should handle index not found error', async () => {
      const mockIndexName = 'idx:movie';
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.DROPINDEX']))
        .mockRejectedValue(mockRedisUnknownIndexName);

      try {
        await service.deleteIndex(mockBrowserClientMetadata, {
          index: mockIndexName,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should handle ACL error', async () => {
      const mockIndexName = 'idx:movie';
      when(standaloneClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.DROPINDEX']))
        .mockRejectedValue(mockRedisNoPermError);

      try {
        await service.deleteIndex(mockBrowserClientMetadata, {
          index: mockIndexName,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
