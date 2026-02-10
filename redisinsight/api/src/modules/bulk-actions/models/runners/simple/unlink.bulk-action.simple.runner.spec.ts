import {
  mockSocket,
  mockBulkActionsAnalytics,
  mockCreateBulkActionDto,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { UnlinkBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/unlink.bulk-action.simple.runner';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { RedisFeature } from 'src/modules/redis/client';

const mockBulkActionFilter = Object.assign(new BulkActionFilter(), {
  count: 10_000,
  match: '*',
  type: RedisDataType.Set,
});

const bulkAction = new BulkAction(
  mockCreateBulkActionDto.id,
  mockCreateBulkActionDto.databaseId,
  mockCreateBulkActionDto.type,
  mockBulkActionFilter,
  mockSocket,
  mockBulkActionsAnalytics as any,
);

const mockKey = 'mockedKey';
const mockKeyBuffer = Buffer.from(mockKey);

describe('UnlinkBulkActionSimpleRunner', () => {
  const client = mockStandaloneRedisClient;
  let unlinkRunner: UnlinkBulkActionSimpleRunner;

  beforeEach(() => {
    jest.clearAllMocks();
    unlinkRunner = new UnlinkBulkActionSimpleRunner(bulkAction, client);
  });

  describe('prepareCommands', () => {
    it('should use UNLINK command when Redis supports it (Redis 4.0.0+)', () => {
      // Default behavior - UNLINK is supported
      const commands = unlinkRunner.prepareCommands([
        mockKeyBuffer,
        mockKeyBuffer,
        mockKeyBuffer,
      ]);
      expect(commands).toEqual([
        [BrowserToolKeysCommands.Unlink, mockKeyBuffer],
        [BrowserToolKeysCommands.Unlink, mockKeyBuffer],
        [BrowserToolKeysCommands.Unlink, mockKeyBuffer],
      ]);
    });

    it('should return empty array for 0 commands', () => {
      const commands = unlinkRunner.prepareCommands([]);
      expect(commands).toEqual([]);
    });
  });

  describe('prepareToStart', () => {
    it('should use UNLINK when Redis version supports it (4.0.0+)', async () => {
      client.isFeatureSupported.mockResolvedValueOnce(true);
      client.sendCommand.mockResolvedValueOnce('100'); // getTotalKeys mock

      await unlinkRunner.prepareToStart();

      expect(client.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.UnlinkCommand,
      );

      const commands = unlinkRunner.prepareCommands([mockKeyBuffer]);
      expect(commands).toEqual([
        [BrowserToolKeysCommands.Unlink, mockKeyBuffer],
      ]);
    });

    it('should fall back to DEL when Redis version does not support UNLINK (< 4.0.0)', async () => {
      client.isFeatureSupported.mockResolvedValueOnce(false);
      client.sendCommand.mockResolvedValueOnce('100'); // getTotalKeys mock

      await unlinkRunner.prepareToStart();

      expect(client.isFeatureSupported).toHaveBeenCalledWith(
        RedisFeature.UnlinkCommand,
      );

      const commands = unlinkRunner.prepareCommands([mockKeyBuffer]);
      expect(commands).toEqual([[BrowserToolKeysCommands.Del, mockKeyBuffer]]);
    });

    it('should use DEL for multiple keys when UNLINK is not supported', async () => {
      client.isFeatureSupported.mockResolvedValueOnce(false);
      client.sendCommand.mockResolvedValueOnce('100'); // getTotalKeys mock

      await unlinkRunner.prepareToStart();

      const commands = unlinkRunner.prepareCommands([
        mockKeyBuffer,
        mockKeyBuffer,
        mockKeyBuffer,
      ]);
      expect(commands).toEqual([
        [BrowserToolKeysCommands.Del, mockKeyBuffer],
        [BrowserToolKeysCommands.Del, mockKeyBuffer],
        [BrowserToolKeysCommands.Del, mockKeyBuffer],
      ]);
    });
  });
});
