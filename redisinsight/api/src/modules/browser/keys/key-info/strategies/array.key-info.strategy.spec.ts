import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import { ArrayKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/array.key-info.strategy';
import { MAX_KEY_SIZE } from 'src/modules/browser/keys/key-info/constants';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testArray',
  type: 'array',
  ttl: -1,
  size: 50,
  length: '10',
  count: '7',
};

describe('ArrayKeyInfoStrategy', () => {
  let strategy: ArrayKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArrayKeyInfoStrategy],
    }).compile();

    strategy = module.get(ArrayKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    const { ttl, size } = getKeyInfoResponse;
    const rawLength = 10;
    const rawCount = 7;

    describe('when includeSize is true', () => {
      it('should return ttl, length, count, and size in single pipeline', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ArLen, key],
            [BrowserToolArrayCommands.ArCount, key],
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, rawLength],
            [null, rawCount],
            [null, size],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.Array,
          true,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });

      it('should preserve u64 length and count as decimal strings', async () => {
        // ARLEN can exceed Number.MAX_SAFE_INTEGER for sparse arrays; the
        // strategy must surface the value as a string so precision is kept
        // when the client passes back bigint or string replies.
        const hugeLength = BigInt('18446744073709551610');
        const hugeCount = '18446744073709551500';
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ArLen, key],
            [BrowserToolArrayCommands.ArCount, key],
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, hugeLength],
            [null, hugeCount],
            [null, size],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.Array,
          true,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          length: '18446744073709551610',
          count: '18446744073709551500',
        });
      });
    });

    describe('when includeSize is false', () => {
      it('should skip MEMORY USAGE when count exceeds MAX_KEY_SIZE', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ArLen, key],
            [BrowserToolArrayCommands.ArCount, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, rawLength],
            [null, MAX_KEY_SIZE + 1],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.Array,
          false,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          count: String(MAX_KEY_SIZE + 1),
          size: -1,
        });
      });

      it('should still issue MEMORY USAGE for sparse arrays where length is huge but count is small', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ArLen, key],
            [BrowserToolArrayCommands.ArCount, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, MAX_KEY_SIZE * 10],
            [null, rawCount],
          ]);
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, size]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.Array,
          false,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          length: String(MAX_KEY_SIZE * 10),
        });
      });

      it('should issue MEMORY USAGE separately when count is small', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ArLen, key],
            [BrowserToolArrayCommands.ArCount, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, rawLength],
            [null, rawCount],
          ]);
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, size]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.Array,
          false,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });
    });
  });
});
