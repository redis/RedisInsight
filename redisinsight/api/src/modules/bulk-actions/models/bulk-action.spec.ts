import { mockRedisKeysUtilModule } from 'src/__mocks__/redis-utils';

jest.doMock('src/modules/redis/utils/keys.util', mockRedisKeysUtilModule);

import { omit } from 'lodash';
import {
  mockSocket,
  mockBulkActionsAnalytics,
  mockCreateBulkActionDto,
  mockBulkActionFilter,
  mockStandaloneRedisClient,
  mockClusterRedisClient,
  generateMockBulkActionSummary,
  generateMockBulkActionProgress,
  generateMockBulkActionErrors,
  MockType,
  mockBulkActionOverviewMatcher,
  mockSessionMetadata,
} from 'src/__mocks__';
import { DeleteBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/delete.bulk-action.simple.runner';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { BulkActionStatus } from 'src/modules/bulk-actions/constants';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';

let bulkAction: BulkAction;
let mockRunner;
let analytics: MockType<BulkActionsAnalytics>;

describe('AbstractBulkActionSimpleRunner', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    bulkAction = new BulkAction(
      mockCreateBulkActionDto.id,
      mockCreateBulkActionDto.databaseId,
      mockCreateBulkActionDto.type,
      mockBulkActionFilter,
      mockSocket,
      mockBulkActionsAnalytics() as any,
    );

    analytics = bulkAction[
      'analytics'
    ] as unknown as MockType<BulkActionsAnalytics>;
  });

  describe('prepare', () => {
    it('should generate single runner for standalone', async () => {
      expect(bulkAction['runners']).toEqual([]);

      await bulkAction.prepare(
        mockStandaloneRedisClient,
        DeleteBulkActionSimpleRunner,
      );

      expect(bulkAction['status']).toEqual(BulkActionStatus.Ready);
      expect(bulkAction['runners'].length).toEqual(1);
      expect(bulkAction['runners'][0]).toBeInstanceOf(
        DeleteBulkActionSimpleRunner,
      );
      expect(bulkAction['runners'][0]['progress']['total']).toEqual(10_000);
    });
    it('should generate 2 runners for cluster with 2 master nodes', async () => {
      mockClusterRedisClient.nodes.mockResolvedValueOnce([
        mockStandaloneRedisClient,
        mockStandaloneRedisClient,
      ]);
      expect(bulkAction['runners']).toEqual([]);

      await bulkAction.prepare(
        mockClusterRedisClient,
        DeleteBulkActionSimpleRunner,
      );

      expect(bulkAction['status']).toEqual(BulkActionStatus.Ready);
      expect(bulkAction['runners'].length).toEqual(2);
      expect(bulkAction['runners'][0]).toBeInstanceOf(
        DeleteBulkActionSimpleRunner,
      );
      expect(bulkAction['runners'][0]['progress']['total']).toEqual(10_000);
      expect(bulkAction['runners'][1]).toBeInstanceOf(
        DeleteBulkActionSimpleRunner,
      );
      expect(bulkAction['runners'][1]['progress']['total']).toEqual(10_000);
    });
    it('should fail when bulk action in inappropriate state', async () => {
      try {
        bulkAction['status'] = BulkActionStatus.Ready;
        await bulkAction.prepare(
          mockStandaloneRedisClient,
          DeleteBulkActionSimpleRunner,
        );
        fail();
      } catch (e) {
        expect(e.message).toEqual(
          `Unable to prepare bulk action with "${BulkActionStatus.Ready}" status`,
        );
      }
    });
  });

  describe('start', () => {
    let runnerRunSpy;
    beforeEach(() => {
      mockRunner = new DeleteBulkActionSimpleRunner(
        bulkAction,
        mockStandaloneRedisClient,
      );
      runnerRunSpy = jest.spyOn(mockRunner, 'run');
    });

    it('should throw an error when status is not READY', async () => {
      try {
        await bulkAction.start();
        fail();
      } catch (e) {
        expect(e.message).toEqual(
          `Unable to start bulk action with "${BulkActionStatus.Initialized}" status`,
        );
      }
    });
    it('should start and run until the end', async () => {
      bulkAction['status'] = BulkActionStatus.Ready;
      bulkAction['runners'] = [mockRunner];
      runnerRunSpy.mockResolvedValue();

      const overview = await bulkAction.start();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 0,
        scanned: 0,
      });
      expect(overview.summary).toEqual({
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
        keys: [],
      });

      await new Promise((res) => setTimeout(res, 100));

      expect(runnerRunSpy).toHaveBeenCalledTimes(1);
      expect(bulkAction['status']).toEqual(BulkActionStatus.Completed);
    });
    it('should start and run until the end for clusters', async () => {
      bulkAction['status'] = BulkActionStatus.Ready;
      bulkAction['runners'] = [mockRunner, mockRunner];
      runnerRunSpy.mockResolvedValue();

      const overview = await bulkAction.start();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 0,
        scanned: 0,
      });
      expect(overview.summary).toEqual({
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
        keys: [],
      });

      await new Promise((res) => setTimeout(res, 100));

      expect(runnerRunSpy).toHaveBeenCalledTimes(2);
      expect(bulkAction['status']).toEqual(BulkActionStatus.Completed);
    });
    it('should start and run until the error occur', async () => {
      bulkAction['status'] = BulkActionStatus.Ready;
      bulkAction['runners'] = [mockRunner];
      runnerRunSpy.mockRejectedValue();

      const overview = await bulkAction.start();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 0,
        scanned: 0,
      });
      expect(overview.summary).toEqual({
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
        keys: [],
      });

      await new Promise((res) => setTimeout(res, 100));

      expect(bulkAction.getStatus()).toEqual(BulkActionStatus.Failed);
    });
  });

  describe('getOverview', () => {
    let mockSummary;
    let mockProgress;

    beforeEach(() => {
      mockSummary = generateMockBulkActionSummary();
      mockProgress = generateMockBulkActionProgress();
      mockRunner = new DeleteBulkActionSimpleRunner(
        bulkAction,
        mockStandaloneRedisClient,
      );
      mockRunner['progress'] = mockProgress;
      mockRunner['summary'] = mockSummary;
      bulkAction['status'] = BulkActionStatus.Completed;
    });

    it('should return overview for standalone', async () => {
      bulkAction['runners'] = [mockRunner];

      const overview = await bulkAction.getOverview();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 1_000_000,
        scanned: 1_000_000,
      });
      expect(overview.summary).toEqual({
        processed: 1_000_000,
        succeed: 900_000,
        failed: 100_000,
        errors: generateMockBulkActionErrors(500, false),
        keys: [],
      });
    });
    it('should return overview for cluster', async () => {
      bulkAction['runners'] = [mockRunner, mockRunner, mockRunner];

      const overview = await bulkAction.getOverview();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 3_000_000,
        scanned: 3_000_000,
      });
      expect(overview.summary).toEqual({
        processed: 3_000_000,
        succeed: 2_700_000,
        failed: 300_000,
        errors: generateMockBulkActionErrors(500, false),
        keys: [],
      });
    });
  });

  describe('getOverview - keys aggregation', () => {
    let mockSummary1;
    let mockSummary2;
    let mockSummary3;
    let mockRunner1;
    let mockRunner2;
    let mockRunner3;
    let mockProgress1;
    let mockProgress2;
    let mockProgress3;

    beforeEach(() => {
      mockProgress1 = {
        getOverview: jest.fn().mockReturnValue({ total: 500, scanned: 400 }),
      };
      mockProgress2 = {
        getOverview: jest.fn().mockReturnValue({ total: 1000, scanned: 800 }),
      };
      mockProgress3 = {
        getOverview: jest.fn().mockReturnValue({ total: 1500, scanned: 1200 }),
      };

      mockSummary1 = {
        getOverview: jest.fn().mockReturnValue({
          processed: 100,
          succeed: 90,
          failed: 10,
          errors: [],
          keys: [],
        }),
      };
      mockSummary2 = {
        getOverview: jest.fn().mockReturnValue({
          processed: 200,
          succeed: 180,
          failed: 20,
          errors: [],
          keys: [],
        }),
      };
      mockSummary3 = {
        getOverview: jest.fn().mockReturnValue({
          processed: 300,
          succeed: 270,
          failed: 30,
          errors: [],
          keys: [],
        }),
      };

      mockRunner1 = {
        getSummary: jest.fn().mockReturnValue(mockSummary1),
        getProgress: jest.fn().mockReturnValue(mockProgress1),
      };
      mockRunner2 = {
        getSummary: jest.fn().mockReturnValue(mockSummary2),
        getProgress: jest.fn().mockReturnValue(mockProgress2),
      };
      mockRunner3 = {
        getSummary: jest.fn().mockReturnValue(mockSummary3),
        getProgress: jest.fn().mockReturnValue(mockProgress3),
      };

      bulkAction['runners'] = [mockRunner1, mockRunner2, mockRunner3];
      bulkAction['status'] = BulkActionStatus.Completed;
    });

    it('should correctly aggregate summary data from all runners', async () => {
      const overview = bulkAction.getOverview();

      expect(overview.summary.processed).toBeGreaterThan(0);
      expect(overview.summary.succeed).toBeGreaterThan(0);
      expect(overview.summary.failed).toBeGreaterThan(0);
      expect(Array.isArray(overview.summary.errors)).toBe(true);
    });
  });

  describe('setStatus', () => {
    const testCases = [
      { input: BulkActionStatus.Completed, affect: true },
      { input: BulkActionStatus.Failed, affect: true },
      { input: BulkActionStatus.Aborted, affect: true },
      { input: BulkActionStatus.Initializing, affect: false },
      { input: BulkActionStatus.Initialized, affect: false },
      { input: BulkActionStatus.Preparing, affect: false },
      { input: BulkActionStatus.Ready, affect: false },
    ];

    testCases.forEach((testCase) => {
      it(`should change state to ${testCase.input} and ${testCase.affect ? '' : 'do not'} set a time`, () => {
        expect(bulkAction['status']).toEqual(BulkActionStatus.Initialized);
        expect(bulkAction['endTime']).toEqual(undefined);

        bulkAction.setStatus(testCase.input);

        expect(bulkAction['status']).toEqual(testCase.input);
        if (testCase.affect) {
          expect(bulkAction['endTime']).not.toEqual(undefined);
        } else {
          expect(bulkAction['endTime']).toEqual(undefined);
        }
      });
    });

    const currentStatusTestCases = [
      { input: BulkActionStatus.Completed, ignore: true },
      { input: BulkActionStatus.Failed, ignore: true },
      { input: BulkActionStatus.Aborted, ignore: true },
      { input: BulkActionStatus.Initialized, ignore: false },
      { input: BulkActionStatus.Preparing, ignore: false },
      { input: BulkActionStatus.Ready, ignore: false },
    ];

    currentStatusTestCases.forEach((testCase) => {
      it(`should ${testCase.ignore ? 'not' : ''} change state from ${testCase.input}`, () => {
        expect(bulkAction['status']).toEqual(BulkActionStatus.Initialized);
        bulkAction.setStatus(testCase.input);
        expect(bulkAction['status']).toEqual(testCase.input);

        bulkAction.setStatus(BulkActionStatus.Running);

        if (testCase.ignore) {
          expect(bulkAction['status']).toEqual(testCase.input);
        } else {
          expect(bulkAction['status']).toEqual(BulkActionStatus.Running);
        }
      });
    });
  });

  describe('sendOverview', () => {
    let sendOverviewSpy;

    beforeEach(() => {
      sendOverviewSpy = jest.spyOn(bulkAction, 'sendOverview');
    });

    it('Should not fail on emit error', () => {
      mockSocket.emit.mockImplementation(() => {
        throw new Error('some error');
      });

      bulkAction.sendOverview(mockSessionMetadata);
    });
    it('Should send overview', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction.sendOverview(mockSessionMetadata);

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
    });

    it('Should call sendActionSucceed', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction['status'] = BulkActionStatus.Completed;

      bulkAction.sendOverview(mockSessionMetadata);

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
      expect(analytics.sendActionFailed).not.toHaveBeenCalled();
      expect(analytics.sendActionStopped).not.toHaveBeenCalled();
      expect(analytics.sendActionSucceed).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockBulkActionOverviewMatcher,
      );
    });

    it('Should call sendActionFailed', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction['status'] = BulkActionStatus.Failed;
      bulkAction['error'] = new Error('some error');

      bulkAction.sendOverview(mockSessionMetadata);

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
      expect(analytics.sendActionSucceed).not.toHaveBeenCalled();
      expect(analytics.sendActionStopped).not.toHaveBeenCalled();
      expect(analytics.sendActionFailed).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockBulkActionOverviewMatcher,
          status: 'failed',
        },
        new Error('some error'),
      );
    });

    it('Should call sendActionStopped', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction['status'] = BulkActionStatus.Aborted;

      bulkAction.sendOverview(mockSessionMetadata);

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
      expect(analytics.sendActionSucceed).not.toHaveBeenCalled();
      expect(analytics.sendActionFailed).not.toHaveBeenCalled();
      expect(analytics.sendActionStopped).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockBulkActionOverviewMatcher,
          status: 'aborted',
        },
      );
    });
  });

  describe('Other', () => {
    it('getters', () => {
      expect(bulkAction.getSocket()).toEqual(bulkAction['socket']);
      expect(bulkAction.getFilter()).toEqual(bulkAction['filter']);
      expect(bulkAction.getId()).toEqual(bulkAction['id']);
    });
  });

  describe('Report streaming', () => {
    let mockResponse: any;

    beforeEach(() => {
      mockResponse = {
        write: jest.fn(),
        end: jest.fn(),
      };
    });

    describe('isReportEnabled', () => {
      it('should return false when generateReport is not set', () => {
        expect(bulkAction.isReportEnabled()).toBe(false);
      });

      it('should return true when generateReport is true', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );
        expect(bulkActionWithReport.isReportEnabled()).toBe(true);
      });
    });

    describe('setStreamingResponse', () => {
      it('should set streaming response and resolve promise', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );

        bulkActionWithReport.setStreamingResponse(mockResponse);

        expect(bulkActionWithReport['streamingResponse']).toBe(mockResponse);
      });

      it('should write header when response is set', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );

        bulkActionWithReport.setStreamingResponse(mockResponse);

        expect(mockResponse.write).toHaveBeenCalled();
        const headerCall = mockResponse.write.mock.calls[0][0];
        expect(headerCall).toContain('Bulk Delete Report');
        expect(headerCall).toContain('Command Executed for each key:');
      });
    });

    describe('writeToReport', () => {
      it('should not write when streaming response is not set', () => {
        bulkAction.writeToReport('testKey', true);
        // No error thrown, just no-op
      });

      it('should write success entry to stream', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );
        bulkActionWithReport['streamingResponse'] = mockResponse;

        bulkActionWithReport.writeToReport('testKey', true);

        expect(mockResponse.write).toHaveBeenCalledWith('testKey - OK\n');
      });

      it('should write error entry to stream', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );
        bulkActionWithReport['streamingResponse'] = mockResponse;

        bulkActionWithReport.writeToReport('testKey', false, 'NOPERM');

        expect(mockResponse.write).toHaveBeenCalledWith(
          'testKey - Error: NOPERM\n',
        );
      });

      it('should write unknown error when error message not provided', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );
        bulkActionWithReport['streamingResponse'] = mockResponse;

        bulkActionWithReport.writeToReport('testKey', false);

        expect(mockResponse.write).toHaveBeenCalledWith(
          'testKey - Error: Unknown error\n',
        );
      });
    });

    describe('finalizeReport', () => {
      it('should not finalize when streaming response is not set', () => {
        bulkAction['finalizeReport']();
        // No error thrown, just no-op
      });

      it('should write summary and close stream', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );
        bulkActionWithReport['streamingResponse'] = mockResponse;
        bulkActionWithReport['status'] = BulkActionStatus.Completed;

        bulkActionWithReport['finalizeReport']();

        expect(mockResponse.write).toHaveBeenCalled();
        expect(mockResponse.end).toHaveBeenCalled();

        const summaryCall = mockResponse.write.mock.calls[0][0];
        expect(summaryCall).toContain('Summary');
        expect(summaryCall).toContain('Processed:');
        expect(summaryCall).toContain('Succeeded:');
        expect(summaryCall).toContain('Failed:');
        expect(summaryCall).toContain('Status:');
      });
    });

    describe('getOverview with downloadUrl', () => {
      it('should not include downloadUrl when generateReport is false', () => {
        const overview = bulkAction.getOverview();
        expect(overview.downloadUrl).toBeUndefined();
      });

      it('should include downloadUrl when generateReport is true', () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );

        const overview = bulkActionWithReport.getOverview();

        expect(overview.downloadUrl).toBe(
          `databases/${mockCreateBulkActionDto.databaseId}/bulk-actions/${mockCreateBulkActionDto.id}/report/download`,
        );
      });
    });

    describe('waitForStreamIfNeeded', () => {
      it('should resolve immediately when generateReport is false', async () => {
        await bulkAction['waitForStreamIfNeeded']();
        // Should not hang
      });

      it('should wait for stream when generateReport is true', async () => {
        const bulkActionWithReport = new BulkAction(
          mockCreateBulkActionDto.id,
          mockCreateBulkActionDto.databaseId,
          mockCreateBulkActionDto.type,
          mockBulkActionFilter,
          mockSocket,
          mockBulkActionsAnalytics() as any,
          true,
        );

        // Start waiting in background
        const waitPromise = bulkActionWithReport['waitForStreamIfNeeded']();

        // Set streaming response after a short delay
        setTimeout(() => {
          bulkActionWithReport.setStreamingResponse(mockResponse);
        }, 10);

        // Wait should resolve after setStreamingResponse is called
        await waitPromise;

        expect(bulkActionWithReport['streamingResponse']).toBe(mockResponse);
      });
    });
  });
});
