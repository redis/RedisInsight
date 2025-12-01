import { mockRedisKeysUtilModule } from 'src/__mocks__/redis-utils';

jest.doMock('src/modules/redis/utils/keys.util', mockRedisKeysUtilModule);

import {
  mockSocket,
  mockBulkActionsAnalytics,
  mockRedisKeysUtil,
  mockBulkActionFilter,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { DeleteBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/delete.bulk-action.simple.runner';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import {
  BulkActionStatus,
  BulkActionType,
} from 'src/modules/bulk-actions/constants';

const mockCreateBulkActionDto = {
  id: 'bulk-action-id',
  databaseId: 'database-id',
  type: BulkActionType.Delete,
};

let bulkAction;

const mockKey = 'mockedKey';
const mockKeyBuffer = Buffer.from(mockKey);
const mockCursorString = '12345';
const mockCursorNumber = parseInt(mockCursorString, 10);
const mockCursorBuffer = Buffer.from(mockCursorString);
const mockZeroCursorBuffer = Buffer.from('0');
const mockRESPError = 'Reply Error: NOPERM for delete.';
const mockReplyError = new Error(mockRESPError);

describe('AbstractBulkActionSimpleRunner', () => {
  let deleteRunner: DeleteBulkActionSimpleRunner;

  beforeEach(() => {
    jest.clearAllMocks();

    bulkAction = new BulkAction(
      mockCreateBulkActionDto.id,
      mockCreateBulkActionDto.databaseId,
      mockCreateBulkActionDto.type,
      mockBulkActionFilter,
      mockSocket,
      mockBulkActionsAnalytics as any,
    );

    deleteRunner = new DeleteBulkActionSimpleRunner(
      bulkAction,
      mockStandaloneRedisClient,
    );
  });

  describe('prepareToStart', () => {
    it('should get total before start', async () => {
      mockRedisKeysUtil.getTotalKeys.mockResolvedValue(100);

      expect(deleteRunner['progress']['total']).toEqual(0);
      expect(deleteRunner['progress']['scanned']).toEqual(0);
      expect(deleteRunner['progress']['cursor']).toEqual(0);

      await deleteRunner.prepareToStart();

      expect(deleteRunner['progress']['total']).toEqual(100);
      expect(deleteRunner['progress']['scanned']).toEqual(0);
      expect(deleteRunner['progress']['cursor']).toEqual(0);
    });
  });

  describe('getKeysToProcess', () => {
    beforeEach(() => {
      deleteRunner['bulkAction']['status'] = BulkActionStatus.Running;
      deleteRunner['progress']['total'] = 1_000_000;
    });

    it('Should get keys to process and change cursor', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        mockCursorBuffer,
        [mockKeyBuffer, mockKeyBuffer],
      ]);
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        mockCursorBuffer,
        [mockKeyBuffer, mockKeyBuffer],
      ]);
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        mockZeroCursorBuffer,
        [mockKeyBuffer, mockKeyBuffer],
      ]);

      expect(deleteRunner['progress']['cursor']).toEqual(0);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      await deleteRunner.getKeysToProcess();

      expect(deleteRunner['progress']['cursor']).toEqual(mockCursorNumber);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      await deleteRunner.getKeysToProcess();

      expect(deleteRunner['progress']['cursor']).toEqual(mockCursorNumber);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      await deleteRunner.getKeysToProcess();

      expect(deleteRunner['progress']['cursor']).toEqual(-1);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      await deleteRunner.getKeysToProcess();

      expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledTimes(3);
    });
  });

  describe('runIteration', () => {
    beforeEach(() => {
      deleteRunner['bulkAction']['status'] = BulkActionStatus.Running;
      deleteRunner['progress']['total'] = 1_000_000;
    });

    it('Should get keys to process and change cursor', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        mockCursorBuffer,
        [mockKeyBuffer, mockKeyBuffer],
      ]);
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        mockCursorBuffer,
        [mockKeyBuffer, mockKeyBuffer],
      ]);
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        mockZeroCursorBuffer,
        [mockKeyBuffer, mockKeyBuffer],
      ]);
      mockStandaloneRedisClient.sendPipeline.mockResolvedValue([
        [null, 1],
        [mockReplyError, null],
      ]);

      expect(deleteRunner['progress']['cursor']).toEqual(0);
      expect(deleteRunner['progress']['scanned']).toEqual(0);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      expect(deleteRunner['summary']['processed']).toEqual(0);
      expect(deleteRunner['summary']['succeed']).toEqual(0);
      expect(deleteRunner['summary']['failed']).toEqual(0);
      expect(deleteRunner['summary']['errors']).toEqual([]);

      await deleteRunner.runIteration();

      expect(deleteRunner['progress']['cursor']).toEqual(mockCursorNumber);
      expect(deleteRunner['progress']['scanned']).toEqual(10_000);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      expect(deleteRunner['summary']['processed']).toEqual(2);
      expect(deleteRunner['summary']['succeed']).toEqual(1);
      expect(deleteRunner['summary']['failed']).toEqual(1);
      expect(deleteRunner['summary']['errors']).toEqual([
        {
          key: mockKeyBuffer,
          error: mockRESPError,
        },
      ]);

      await deleteRunner.runIteration();

      expect(deleteRunner['progress']['cursor']).toEqual(mockCursorNumber);
      expect(deleteRunner['progress']['scanned']).toEqual(20_000);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      expect(deleteRunner['summary']['processed']).toEqual(4);
      expect(deleteRunner['summary']['succeed']).toEqual(2);
      expect(deleteRunner['summary']['failed']).toEqual(2);
      expect(deleteRunner['summary']['errors']).toEqual([
        {
          key: mockKeyBuffer,
          error: mockRESPError,
        },
        {
          key: mockKeyBuffer,
          error: mockRESPError,
        },
      ]);

      await deleteRunner.runIteration();

      expect(deleteRunner['progress']['cursor']).toEqual(-1);
      expect(deleteRunner['progress']['scanned']).toEqual(1_000_000);
      expect(deleteRunner['progress']['total']).toEqual(1_000_000);

      expect(deleteRunner['summary']['processed']).toEqual(6);
      expect(deleteRunner['summary']['succeed']).toEqual(3);
      expect(deleteRunner['summary']['failed']).toEqual(3);
      expect(deleteRunner['summary']['errors']).toEqual([
        {
          key: mockKeyBuffer,
          error: mockRESPError,
        },
        {
          key: mockKeyBuffer,
          error: mockRESPError,
        },
        {
          key: mockKeyBuffer,
          error: mockRESPError,
        },
      ]);
    });
  });

  describe('run', () => {
    let runIterationSpy;

    beforeEach(() => {
      runIterationSpy = jest.spyOn(deleteRunner, 'runIteration');
      runIterationSpy.mockImplementation(async () => {
        await new Promise((res) => {
          setTimeout(() => res(''), 50);
        });
      });
      deleteRunner['bulkAction']['status'] = BulkActionStatus.Running;
    });

    it('should should run if cursor 0 and status is Running and stop on status change', async () => {
      expect(deleteRunner['progress']['cursor']).toEqual(0);
      expect(deleteRunner['bulkAction']['status']).toEqual(
        BulkActionStatus.Running,
      );
      setTimeout(() => {
        deleteRunner['bulkAction']['status'] = BulkActionStatus.Aborted;
      }, 90);
      await deleteRunner.run();

      expect(runIterationSpy).toHaveBeenCalledTimes(2);
    });

    it('should should run if cursor 0 and status is Running and stop on wen cursor -1', async () => {
      expect(deleteRunner['progress']['cursor']).toEqual(0);
      expect(deleteRunner['bulkAction']['status']).toEqual(
        BulkActionStatus.Running,
      );
      setTimeout(() => {
        deleteRunner['progress']['cursor'] = -1;
      }, 90);
      await deleteRunner.run();

      expect(runIterationSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('processIterationResults', () => {
    let addProcessedSpy;
    let addSuccessSpy;
    let addErrorsSpy;
    let writeToReportSpy;

    beforeEach(() => {
      addProcessedSpy = jest.spyOn(deleteRunner['summary'], 'addProcessed');
      addSuccessSpy = jest.spyOn(deleteRunner['summary'], 'addSuccess');
      addErrorsSpy = jest.spyOn(deleteRunner['summary'], 'addErrors');
      writeToReportSpy = jest.spyOn(bulkAction, 'writeToReport');
    });

    it('should correctly process results and update summary counters', () => {
      const keys = [
        Buffer.from('key1'),
        Buffer.from('key2'),
        Buffer.from('key3'),
      ];
      const results: [Error | null, number | null][] = [
        [null, 1], // Success
        [mockReplyError, null], // Error
        [null, 1], // Success
      ];

      deleteRunner.processIterationResults(keys, results);

      expect(addProcessedSpy).toHaveBeenCalledWith(3);

      expect(addSuccessSpy).toHaveBeenNthCalledWith(1, 1); // first call
      expect(addSuccessSpy).toHaveBeenNthCalledWith(2, 1); // second call
      expect(addErrorsSpy).toHaveBeenCalledWith([
        {
          key: Buffer.from('key2'),
          error: mockRESPError,
        },
      ]);
    });

    it('should call writeToReport for each key result', () => {
      const keys = [
        Buffer.from('key1'),
        Buffer.from('key2'),
        Buffer.from('key3'),
      ];
      const results: [Error | null, number | null][] = [
        [null, 1], // Success
        [mockReplyError, null], // Error
        [null, 1], // Success
      ];

      deleteRunner.processIterationResults(keys, results);

      expect(writeToReportSpy).toHaveBeenCalledTimes(3);
      expect(writeToReportSpy).toHaveBeenNthCalledWith(1, 'key1', true);
      expect(writeToReportSpy).toHaveBeenNthCalledWith(
        2,
        'key2',
        false,
        mockRESPError,
      );
      expect(writeToReportSpy).toHaveBeenNthCalledWith(3, 'key3', true);
    });
  });
});
