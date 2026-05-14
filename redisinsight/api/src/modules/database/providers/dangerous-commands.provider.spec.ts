import { Test, TestingModule } from '@nestjs/testing';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import { DangerousCommandsProvider } from 'src/modules/database/providers/dangerous-commands.provider';

describe('DangerousCommandsProvider', () => {
  const client = mockStandaloneRedisClient;
  let service: DangerousCommandsProvider;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DangerousCommandsProvider],
    }).compile();

    service = module.get(DangerousCommandsProvider);
  });

  describe('getDangerousCommands', () => {
    it('should return upper-cased dangerous commands from ACL CAT dangerous', async () => {
      client.call.mockResolvedValueOnce([
        'flushall',
        'flushdb',
        'keys',
        'debug',
      ]);

      const result = await service.getDangerousCommands(client);

      expect(result).toEqual(['FLUSHALL', 'FLUSHDB', 'KEYS', 'DEBUG']);
      expect(client.call).toHaveBeenCalledWith(['acl', 'cat', 'dangerous'], {
        replyEncoding: 'utf8',
      });
    });

    it('should deduplicate command names', async () => {
      client.call.mockResolvedValueOnce(['flushall', 'FLUSHALL', 'keys']);

      const result = await service.getDangerousCommands(client);

      expect(result).toEqual(['FLUSHALL', 'KEYS']);
    });

    it('should return empty array on empty reply', async () => {
      client.call.mockResolvedValueOnce([]);

      const result = await service.getDangerousCommands(client);

      expect(result).toEqual([]);
    });

    it('should return empty array and cache it when ACL is not supported (unknown command)', async () => {
      client.call.mockRejectedValueOnce(new Error("ERR unknown command 'ACL'"));

      const first = await service.getDangerousCommands(client);
      const second = await service.getDangerousCommands(client);

      expect(first).toEqual([]);
      expect(second).toEqual([]);
      expect(client.call).toHaveBeenCalledTimes(1);
    });

    it('should return empty array and cache it on NOPERM', async () => {
      client.call.mockRejectedValueOnce(
        new Error(
          "NOPERM this user has no permissions to run the 'acl|cat' command",
        ),
      );

      const first = await service.getDangerousCommands(client);
      const second = await service.getDangerousCommands(client);

      expect(first).toEqual([]);
      expect(second).toEqual([]);
      expect(client.call).toHaveBeenCalledTimes(1);
    });

    it('should return empty array but NOT cache on transient errors', async () => {
      client.call
        .mockRejectedValueOnce(new Error('ECONNRESET socket hang up'))
        .mockResolvedValueOnce(['flushall']);

      const first = await service.getDangerousCommands(client);
      const second = await service.getDangerousCommands(client);

      expect(first).toEqual([]);
      expect(second).toEqual(['FLUSHALL']);
      expect(client.call).toHaveBeenCalledTimes(2);
    });

    it('should return empty array when reply is not an array', async () => {
      client.call.mockResolvedValueOnce(null);

      const result = await service.getDangerousCommands(client);

      expect(result).toEqual([]);
    });

    it('should cache the result and not re-fetch on subsequent calls', async () => {
      client.call.mockResolvedValueOnce(['flushall']);

      const first = await service.getDangerousCommands(client);
      const second = await service.getDangerousCommands(client);

      expect(first).toEqual(['FLUSHALL']);
      expect(second).toEqual(['FLUSHALL']);
      expect(client.call).toHaveBeenCalledTimes(1);
    });
  });

  describe('invalidate', () => {
    it('should drop the cached entry so the next call re-fetches', async () => {
      client.call
        .mockResolvedValueOnce(['flushall'])
        .mockResolvedValueOnce(['keys']);

      await service.getDangerousCommands(client);
      service.invalidate(client.clientMetadata.databaseId);
      const result = await service.getDangerousCommands(client);

      expect(result).toEqual(['KEYS']);
      expect(client.call).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleInstanceDeletedEvent', () => {
    it('should invalidate the cache for the deleted database', async () => {
      client.call
        .mockResolvedValueOnce(['flushall'])
        .mockResolvedValueOnce(['keys']);

      await service.getDangerousCommands(client);
      service.handleInstanceDeletedEvent(client.clientMetadata.databaseId);
      const result = await service.getDangerousCommands(client);

      expect(result).toEqual(['KEYS']);
      expect(client.call).toHaveBeenCalledTimes(2);
    });
  });
});
