import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import { mockKeyDto } from 'src/modules/browser/__mocks__';
import { RejsonRlKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/rejson-rl.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: mockKeyDto.keyName,
  type: 'ReJSON-RL',
  ttl: -1,
  size: 50,
  length: 10,
};

describe('RejsonRlKeyInfoStrategy', () => {
  let strategy: RejsonRlKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RejsonRlKeyInfoStrategy],
    }).compile();

    strategy = module.get(RejsonRlKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;

    describe('when includeSize is true', () => {
      it('should return all info in single pipeline for object type', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([
            [null, -1],
            [null, 50],
          ]);

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue('object');

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonObjLen, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue(10);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.JSON,
          true,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });
    });

    describe('when includeSize is false', () => {
      it('should return appropriate value for key that store object', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([[BrowserToolKeysCommands.Ttl, key]])
          .mockResolvedValueOnce([[null, -1]]);

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue('object');

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonObjLen, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue(10);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, 50]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.JSON,
          false,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });

      it('should return appropriate value for key that store array', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([[BrowserToolKeysCommands.Ttl, key]])
          .mockResolvedValueOnce([[null, -1]]);

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue('array');

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonArrLen, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue(10);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, 50]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.JSON,
          false,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });

      it('should return appropriate value for key that store string', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([[BrowserToolKeysCommands.Ttl, key]])
          .mockResolvedValueOnce([[null, -1]]);

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue('string');

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonStrLen, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue(10);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, 50]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.JSON,
          false,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });

      it('should return appropriate value for key that store not iterable type', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([[BrowserToolKeysCommands.Ttl, key]])
          .mockResolvedValueOnce([[null, -1]]);

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue('boolean');

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, 50]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.JSON,
          false,
        );

        expect(result).toEqual({ ...getKeyInfoResponse, length: null });
      });

      it('should return size with null when memory usage fails', async () => {
        const replyError: ReplyError = {
          name: 'ReplyError',
          command: BrowserToolKeysCommands.MemoryUsage,
          message: "ERR unknown command 'memory'",
        };

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([[BrowserToolKeysCommands.Ttl, key]])
          .mockResolvedValueOnce([[null, -1]]);

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue('object');

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonObjLen, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue(10);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[replyError, null]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.JSON,
          false,
        );

        expect(result).toEqual({ ...getKeyInfoResponse, size: null });
      });

      it('should not check size when length >= 100', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([[BrowserToolKeysCommands.Ttl, key]])
          .mockResolvedValueOnce([[null, -1]]);

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue('object');

        when(mockStandaloneRedisClient.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonObjLen, key], {
            replyEncoding: 'utf8',
          })
          .mockResolvedValue(100);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.JSON,
          false,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          length: 100,
          size: -1,
        });
      });
    });
  });
});
