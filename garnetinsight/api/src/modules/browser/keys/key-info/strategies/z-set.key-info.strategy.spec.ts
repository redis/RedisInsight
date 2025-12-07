import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolZSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import { ZSetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/z-set.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testZSet',
  type: 'zset',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('ZSetKeyInfoStrategy', () => {
  let strategy: ZSetKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZSetKeyInfoStrategy],
    }).compile();

    strategy = module.get(ZSetKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;

    describe('when includeSize is true', () => {
      it('should return all info in single pipeline', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolZSetCommands.ZCard, key],
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([
            [null, -1],
            [null, 10],
            [null, 50],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.ZSet,
          true,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });
    });

    describe('when includeSize is false', () => {
      it('should return appropriate value', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolZSetCommands.ZCard, key],
          ])
          .mockResolvedValueOnce([
            [null, -1],
            [null, 10],
          ]);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, 50]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.ZSet,
          false,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });

      it('should return size with null when memory usage fails', async () => {
        const replyError: ReplyError = {
          name: 'ReplyError',
          command: BrowserToolKeysCommands.MemoryUsage,
          message: "ERR unknown command 'memory'",
        };

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolZSetCommands.ZCard, key],
          ])
          .mockResolvedValueOnce([
            [null, -1],
            [null, 10],
          ]);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[replyError, null]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.ZSet,
          false,
        );

        expect(result).toEqual({ ...getKeyInfoResponse, size: null });
      });

      it('should not check size when length >= 50,000', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolZSetCommands.ZCard, key],
          ])
          .mockResolvedValueOnce([
            [null, -1],
            [null, 50000],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.ZSet,
          false,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          length: 50000,
          size: -1,
        });
      });
    });
  });
});
