import {
  mockSocket,
  mockBulkActionsAnalytics,
  mockCreateBulkActionDto,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { UnlinkBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/unlink.bulk-action.simple.runner';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';

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
    unlinkRunner = new UnlinkBulkActionSimpleRunner(bulkAction, client);
  });

  it('prepareCommands 3 commands', () => {
    const commands = unlinkRunner.prepareCommands([
      mockKeyBuffer,
      mockKeyBuffer,
      mockKeyBuffer,
    ]);
    expect(commands).toEqual([
      ['unlink', mockKeyBuffer],
      ['unlink', mockKeyBuffer],
      ['unlink', mockKeyBuffer],
    ]);
  });

  it('prepareCommands 0 commands', () => {
    const commands = unlinkRunner.prepareCommands([]);
    expect(commands).toEqual([]);
  });
});
