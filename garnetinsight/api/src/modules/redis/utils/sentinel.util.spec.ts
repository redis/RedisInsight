import {
  mockOtherSentinelEndpoint,
  mockOtherSentinelsReply,
  mockRedisNoPermError,
  mockRedisSentinelMasterResponse,
  mockSentinelMasterDto,
  mockSentinelMasterInDownState,
  mockSentinelMasterInOkState,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel-master';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ReplyError } from 'src/models';
import {
  isSentinel,
  discoverOtherSentinels,
  discoverSentinelMasterGroups,
} from './sentinel.util';

describe('Sentinel Util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSentinel', () => {
    it('sentinel connection ok', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(
        mockRedisSentinelMasterResponse,
      );
      expect(await isSentinel(mockStandaloneRedisClient)).toEqual(true);
    });
    it('sentinel not supported', async () => {
      mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce({
        name: 'ReplyError',
        message: 'Unknown command `sentinel`',
        command: 'SENTINEL',
      });
      expect(await isSentinel(mockStandaloneRedisClient)).toEqual(false);
    });
  });

  describe('getMasterEndpoints', () => {
    it('succeed to get sentinel master endpoints', async () => {
      const masterName = mockSentinelMasterDto.name;
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(
        mockOtherSentinelsReply,
      );

      const result = await discoverOtherSentinels(
        mockStandaloneRedisClient,
        masterName,
      );

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith(
        ['sentinel', 'sentinels', masterName],
        { replyEncoding: 'utf8' },
      );

      expect(result).toEqual([mockOtherSentinelEndpoint]);
    });
    it('empty list of sentinel master endpoints', async () => {
      const masterName = mockSentinelMasterDto.name;
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([]);

      const result = await discoverOtherSentinels(
        mockStandaloneRedisClient,
        masterName,
      );

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith(
        ['sentinel', 'sentinels', masterName],
        { replyEncoding: 'utf8' },
      );

      expect(result).toEqual([]);
    });
    it('wrong database type', async () => {
      mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce({
        message:
          'ERR unknown command `sentinel`, with args beginning with: `masters`',
      });

      await expect(
        discoverOtherSentinels(
          mockStandaloneRedisClient,
          mockSentinelMasterDto.name,
        ),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions", async () => {
      const error: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SENTINEL',
      };
      mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce(error);

      await expect(
        discoverOtherSentinels(
          mockStandaloneRedisClient,
          mockSentinelMasterDto.name,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('discoverSentinelMasterGroups', () => {
    it('succeed to get sentinel masters', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        mockSentinelMasterInOkState,
        mockSentinelMasterInDownState,
      ]);
      mockStandaloneRedisClient.sendCommand
        .mockResolvedValueOnce(mockOtherSentinelsReply)
        .mockResolvedValueOnce(mockOtherSentinelsReply);

      const result = await discoverSentinelMasterGroups(
        mockStandaloneRedisClient,
      );

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith(
        ['sentinel', 'masters'],
        { replyEncoding: 'utf8' },
      );
      expect(result).toEqual([
        mockSentinelMasterDto,
        {
          ...mockSentinelMasterDto,
          status: SentinelMasterStatus.Down,
        },
      ]);
    });
    it('wrong database type', async () => {
      mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce({
        message:
          'ERR unknown command `sentinel`, with args beginning with: `masters`',
      });

      try {
        await discoverSentinelMasterGroups(mockStandaloneRedisClient);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DISCOVERY_TOOL());
      }
    });

    it("user don't have required permissions", async () => {
      mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce({
        ...mockRedisNoPermError,
        command: 'SENTINEL',
      });

      await expect(
        discoverSentinelMasterGroups(mockStandaloneRedisClient),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
