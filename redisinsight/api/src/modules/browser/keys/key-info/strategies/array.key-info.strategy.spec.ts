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
  length: 10,
  count: 7,
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
    const { ttl, length, size, count } = getKeyInfoResponse;

    describe('when includeSize is true', () => {
      it('should return ttl, length, count, and size in single pipeline', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ARLen, key],
            [BrowserToolArrayCommands.ARCount, key],
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, length],
            [null, count],
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
    });

    describe('when includeSize is false', () => {
      it('should skip MEMORY USAGE when length exceeds MAX_KEY_SIZE', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ARLen, key],
            [BrowserToolArrayCommands.ARCount, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, MAX_KEY_SIZE + 1],
            [null, count],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.Array,
          false,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          length: MAX_KEY_SIZE + 1,
          size: -1,
        });
      });

      it('should issue MEMORY USAGE separately when length is small', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolArrayCommands.ARLen, key],
            [BrowserToolArrayCommands.ARCount, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, length],
            [null, count],
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
