import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { when } from 'jest-when';
import {
  mockBrowserClientMetadata,
  mockClusterRedisClient,
  mockDatabaseClientFactory,
  mockRedisNoPermError,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { buildIndexInfoRaw } from 'src/__mocks__/redisearch';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { KeyIndexesService } from 'src/modules/browser/redisearch/key-indexes.service';

const mockMovieInfoRaw = buildIndexInfoRaw({
  indexName: 'idx:movie',
  prefixes: ['movie:'],
  numDocs: '10',
});

const mockUserInfoRaw = buildIndexInfoRaw({
  indexName: 'idx:user',
  prefixes: ['user:'],
  numDocs: '5',
});

const mockGlobalInfoRaw = buildIndexInfoRaw({
  indexName: 'idx:global',
  prefixes: [],
  numDocs: '100',
});

const mockMultiPrefixInfoRaw = buildIndexInfoRaw({
  indexName: 'idx:multi',
  keyType: 'JSON',
  prefixes: ['product:', 'item:'],
  attributes: [['identifier', 'sku', 'attribute', 'sku', 'type', 'TAG']],
  numDocs: '20',
});

describe('KeyIndexesService', () => {
  const standaloneClient = mockStandaloneRedisClient;
  const clusterClient = mockClusterRedisClient;
  let service: KeyIndexesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyIndexesService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get<KeyIndexesService>(KeyIndexesService);

    standaloneClient.sendCommand = jest.fn().mockResolvedValue(undefined);
    clusterClient.sendCommand = jest.fn().mockResolvedValue(undefined);
    clusterClient.nodes.mockReturnValue([
      mockStandaloneRedisClient,
      mockStandaloneRedisClient,
    ]);
  });

  describe('getKeyIndexes', () => {
    it('should return matching index when key matches a prefix', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([Buffer.from('idx:movie')]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:movie'], expect.anything())
        .mockResolvedValue(mockMovieInfoRaw);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'movie:1',
      });

      expect(result.indexes).toHaveLength(1);
      expect(result.indexes[0].name).toBe('idx:movie');
      expect(result.indexes[0].prefixes).toEqual(['movie:']);
      expect(result.indexes[0].key_type).toBe('HASH');
    });

    it('should return empty array when key matches no prefix', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([Buffer.from('idx:movie')]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:movie'], expect.anything())
        .mockResolvedValue(mockMovieInfoRaw);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'session:abc',
      });

      expect(result.indexes).toHaveLength(0);
    });

    it('should return multiple indexes when key matches several', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([
          Buffer.from('idx:user'),
          Buffer.from('idx:global'),
        ]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:user'], expect.anything())
        .mockResolvedValue(mockUserInfoRaw);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:global'], expect.anything())
        .mockResolvedValue(mockGlobalInfoRaw);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'user:42',
      });

      expect(result.indexes).toHaveLength(2);
      const names = result.indexes.map((i) => i.name);
      expect(names).toContain('idx:user');
      expect(names).toContain('idx:global');
    });

    it('should match index with empty prefixes to any key', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([Buffer.from('idx:global')]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:global'], expect.anything())
        .mockResolvedValue(mockGlobalInfoRaw);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'anything:here',
      });

      expect(result.indexes).toHaveLength(1);
      expect(result.indexes[0].name).toBe('idx:global');
    });

    it('should match key against index with multiple prefixes', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([Buffer.from('idx:multi')]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:multi'], expect.anything())
        .mockResolvedValue(mockMultiPrefixInfoRaw);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'item:99',
      });

      expect(result.indexes).toHaveLength(1);
      expect(result.indexes[0].name).toBe('idx:multi');
      expect(result.indexes[0].key_type).toBe('JSON');
    });

    it('should return empty when no indexes exist', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([]);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'movie:1',
      });

      expect(result.indexes).toHaveLength(0);
    });

    it('should skip indexes whose FT.INFO fails', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([
          Buffer.from('idx:movie'),
          Buffer.from('idx:broken'),
        ]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:movie'], expect.anything())
        .mockResolvedValue(mockMovieInfoRaw);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:broken'], expect.anything())
        .mockRejectedValue(new Error('Unknown index'));

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'movie:1',
      });

      expect(result.indexes).toHaveLength(1);
      expect(result.indexes[0].name).toBe('idx:movie');
    });

    it('should deduplicate index names from cluster shards', async () => {
      when(clusterClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([Buffer.from('idx:movie')]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([Buffer.from('idx:movie')]);
      when(clusterClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:movie'], expect.anything())
        .mockResolvedValue(mockMovieInfoRaw);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: 'movie:1',
      });

      expect(result.indexes).toHaveLength(1);
    });

    it('should throw when FT._LIST fails', async () => {
      standaloneClient.sendCommand.mockRejectedValue(mockRedisNoPermError);

      await expect(
        service.getKeyIndexes(mockBrowserClientMetadata, { key: 'movie:1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle Buffer keys', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['FT._LIST'])
        .mockResolvedValue([Buffer.from('idx:movie')]);
      when(standaloneClient.sendCommand)
        .calledWith(['FT.INFO', 'idx:movie'], expect.anything())
        .mockResolvedValue(mockMovieInfoRaw);

      const result = await service.getKeyIndexes(mockBrowserClientMetadata, {
        key: Buffer.from('movie:1'),
      });

      expect(result.indexes).toHaveLength(1);
      expect(result.indexes[0].name).toBe('idx:movie');
    });
  });
});
