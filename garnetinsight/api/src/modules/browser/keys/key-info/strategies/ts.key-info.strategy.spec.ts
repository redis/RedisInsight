import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolTSCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import { TsKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/ts.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testTS',
  type: 'TSDB-TYPE',
  ttl: -1,
  size: 50,
  length: 10,
};

const mockTSInfoReply = [
  'totalSamples',
  10,
  'memoryUsage',
  4239,
  'firstTimestamp',
  0,
  'lastTimestamp',
  0,
  'retentionTime',
  6000,
  'chunkCount',
  1,
  'chunkSize',
  4096,
];

describe('TsKeyInfoStrategy', () => {
  let strategy: TsKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TsKeyInfoStrategy],
    }).compile();

    strategy = module.get(TsKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    beforeEach(() => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])
        .mockResolvedValue([
          [null, -1],
          [null, 50],
        ]);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolTSCommands.TSInfo, key], {
          replyEncoding: 'utf8',
        })
        .mockResolvedValue(mockTSInfoReply);
    });
    it('should return appropriate value', async () => {
      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.TS,
      );

      expect(result).toEqual(getKeyInfoResponse);
    });
    it('should return size with null value', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: BrowserToolKeysCommands.MemoryUsage,
        message: "ERR unknown command 'memory'",
      };
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])
        .mockResolvedValue([
          [null, -1],
          [replyError, null],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.TS,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
    it('should return result without length', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: BrowserToolTSCommands.TSInfo,
        message: "ERR unknown command 'ts.info'",
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([BrowserToolTSCommands.TSInfo, key], {
          replyEncoding: 'utf8',
        })
        .mockResolvedValue(replyError);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.TS,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, length: undefined });
    });
  });
});
