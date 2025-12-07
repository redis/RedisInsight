import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import { ReplyError } from 'src/models';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { UnsupportedKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/unsupported.key-info.strategy';

const getKeyInfoResponse: GetKeyInfoResponse = {
  name: 'testKey',
  type: 'custom-type',
  ttl: -1,
  size: 50,
};

describe('UnsupportedKeyInfoStrategy', () => {
  let strategy: UnsupportedKeyInfoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnsupportedKeyInfoStrategy],
    }).compile();

    strategy = module.get(UnsupportedKeyInfoStrategy);
  });

  describe('getInfo', () => {
    const key = getKeyInfoResponse.name;
    it('should return appropriate value', async () => {
      when(mockStandaloneRedisClient.sendPipeline)
        .calledWith([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])
        .mockResolvedValue([
          [null, -1],
          [null, 50],
        ]);

      const result = await strategy.getInfo(
        mockStandaloneRedisClient,
        key,
        'custom-type',
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
        'custom-type',
      );

      expect(result).toEqual({ ...getKeyInfoResponse, size: null });
    });
  });
});
