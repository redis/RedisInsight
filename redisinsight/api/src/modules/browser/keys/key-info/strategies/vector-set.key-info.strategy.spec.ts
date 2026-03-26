import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import {
  BrowserToolKeysCommands,
  BrowserToolVectorSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ReplyError } from 'src/models';
import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import { VectorSetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/vector-set.key-info.strategy';
import {
  vectorSetKeyInfoFactory,
  vInfoResponseFactory,
} from 'src/modules/browser/keys/key-info/__tests__/vector-set-key-info.factory';

const vInfo = vInfoResponseFactory.build();
const getKeyInfoResponse: GetKeyInfoResponse = vectorSetKeyInfoFactory.build({
  quantType: vInfo.quantType,
  vectorDim: vInfo.vectorDim,
});
const mockVInfoResponse = vInfo.raw;

describe('VectorSetKeyInfoStrategy', () => {
  let strategy: VectorSetKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VectorSetKeyInfoStrategy],
    }).compile();

    strategy = module.get(VectorSetKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    const { ttl, length, size } = getKeyInfoResponse;

    describe('when includeSize is true', () => {
      it('should return all info including quantType and vectorDim in single pipeline', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolVectorSetCommands.VCard, key],
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
            [BrowserToolVectorSetCommands.VInfo, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, length],
            [null, size],
            [null, mockVInfoResponse],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.VectorSet,
          true,
        );

        expect(result).toEqual(getKeyInfoResponse);
      });
    });

    describe('when includeSize is false', () => {
      it('should return appropriate value with quantType and vectorDim', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolVectorSetCommands.VCard, key],
            [BrowserToolVectorSetCommands.VInfo, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, length],
            [null, mockVInfoResponse],
          ]);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, size]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.VectorSet,
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
            [BrowserToolVectorSetCommands.VCard, key],
            [BrowserToolVectorSetCommands.VInfo, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, length],
            [null, mockVInfoResponse],
          ]);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[replyError, null]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.VectorSet,
          false,
        );

        expect(result).toEqual({ ...getKeyInfoResponse, size: null });
      });

      it('should not check size when length >= 50,000', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolVectorSetCommands.VCard, key],
            [BrowserToolVectorSetCommands.VInfo, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, 50000],
            [null, mockVInfoResponse],
          ]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.VectorSet,
          false,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          length: 50000,
          size: -1,
        });
      });

      it('should return undefined for quantType and vectorDim when VINFO returns empty array', async () => {
        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.Ttl, key],
            [BrowserToolVectorSetCommands.VCard, key],
            [BrowserToolVectorSetCommands.VInfo, key],
          ])
          .mockResolvedValueOnce([
            [null, ttl],
            [null, length],
            [null, []],
          ]);

        when(mockStandaloneRedisClient.sendPipeline)
          .calledWith([
            [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
          ])
          .mockResolvedValueOnce([[null, size]]);

        const result = await strategy.getInfo(
          mockStandaloneRedisClient,
          key,
          RedisDataType.VectorSet,
          false,
        );

        expect(result).toEqual({
          ...getKeyInfoResponse,
          quantType: undefined,
          vectorDim: undefined,
        });
      });
    });
  });
});
