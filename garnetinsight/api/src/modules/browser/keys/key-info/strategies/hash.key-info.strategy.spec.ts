import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import {
  BrowserToolHashCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import { HashKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/hash.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testHash',
  type: 'hash',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('HashKeyInfoStrategy', () => {
  let strategy: HashKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashKeyInfoStrategy],
    }).compile();

    strategy = module.get(HashKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;

    describe('when includeSize is true', () => {
      it('should return all info in single pipeline', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolHashCommands.HLen, key],
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
          RedisDataType.Hash,
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
            [BrowserToolHashCommands.HLen, key],
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
          RedisDataType.Hash,
          false,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });

      it('should return size with null value when memory usage fails', async () => {
        const replyError: ReplyError = {
          name: 'ReplyError',
          command: BrowserToolKeysCommands.MemoryUsage,
          message: "ERR unknown command 'memory'",
        };
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolHashCommands.HLen, key],
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
          RedisDataType.Hash,
          false,
        );

        expect(result).toEqual({ ...getKeyInfoResponse, size: null });
      });

      it('should not check size when length >= 50,000', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolHashCommands.HLen, key],
          ])
          .mockResolvedValueOnce([
            [null, -1],
            [null, 50000],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.Hash,
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
