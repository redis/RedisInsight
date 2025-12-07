import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolGraphCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import { GraphKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/graph.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testGraph',
  type: 'graphdata',
  ttl: -1,
  size: 50,
  length: 10,
};

const mockGraphQueryReply = [
  [[1, 'count(r)']],
  [[[3, getKeyInfoResponse.length]]],
  [
    'Cached execution: 1',
    'Query internal execution time: 0.093200 milliseconds',
  ],
];

describe('GraphKeyInfoStrategy', () => {
  let strategy: GraphKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphKeyInfoStrategy],
    }).compile();

    strategy = module.get(GraphKeyInfoStrategy);
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
        .calledWith([
          BrowserToolGraphCommands.GraphQuery,
          key,
          'MATCH (r) RETURN count(r)',
          '--compact',
        ])
        .mockResolvedValue(mockGraphQueryReply);
    });
    it('should return appropriate value', async () => {
      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.Graph,
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
        RedisDataType.Graph,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
    it('should return result without length', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: BrowserToolGraphCommands.GraphQuery,
        message: "ERR unknown command 'graph.query",
      };
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith([
          BrowserToolGraphCommands.GraphQuery,
          key,
          'MATCH (r) RETURN count(r)',
          '--compact',
        ])
        .mockResolvedValue(replyError);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        RedisDataType.Graph,
      );

      expect(result).toEqual({ ...getKeyInfoResponse, length: undefined });
    });
  });
});
