import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockBulkActionOverview,
  mockRedisNoAuthError,
  mockSessionMetadata,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';

describe('BulkActionsAnalytics', () => {
  let service: BulkActionsAnalytics;
  let sendEventSpy;
  let sendFailedEventSpy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BulkActionsAnalytics, EventEmitter2],
    }).compile();

    service = await module.get(BulkActionsAnalytics);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
    sendFailedEventSpy = jest.spyOn(service as any, 'sendFailedEvent');
  });

  describe('sendActionStarted', () => {
    it('should emit event when action started (without summary)', () => {
      service.sendActionStarted(mockSessionMetadata, mockBulkActionOverview);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          filter: {
            match: '*',
            type: mockBulkActionOverview.filter?.type,
          },
          progress: {
            scanned: mockBulkActionOverview.progress.scanned,
            scannedRange: '0 - 5 000',
            total: mockBulkActionOverview.progress.total,
            totalRange: '0 - 5 000',
          },
        },
      );
    });
    it('should emit event when action started without progress data and filter as "PATTERN"', () => {
      service.sendActionStarted(mockSessionMetadata, {
        ...mockBulkActionOverview,
        filter: { match: 'some query', type: null },
        progress: undefined,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          filter: {
            match: 'PATTERN',
            type: mockBulkActionOverview.filter?.type,
          },
          progress: {},
        },
      );
    });
    it('should emit event when action started without progress and filter', () => {
      service.sendActionStarted(mockSessionMetadata, {
        ...mockBulkActionOverview,
        filter: undefined,
        progress: undefined,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          filter: {
            match: 'PATTERN', // todo: is this expected behavior?
          },
          progress: {},
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionStarted(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionStopped', () => {
    it('should emit event when action paused/stopped', () => {
      service.sendActionStopped(mockSessionMetadata, mockBulkActionOverview);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStopped,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          filter: {
            match: '*',
            type: mockBulkActionOverview.filter.type,
          },
          progress: {
            scanned: mockBulkActionOverview.progress.scanned,
            scannedRange: '0 - 5 000',
            total: mockBulkActionOverview.progress.total,
            totalRange: '0 - 5 000',
          },
          summary: {
            processed: mockBulkActionOverview.summary.processed,
            processedRange: '0 - 5 000',
            succeed: mockBulkActionOverview.summary.succeed,
            succeedRange: '0 - 5 000',
            failed: mockBulkActionOverview.summary.failed,
            failedRange: '0 - 5 000',
          },
        },
      );
    });
    it('should emit event when action paused/stopped without progress, filter and summary', () => {
      service.sendActionStopped(mockSessionMetadata, {
        ...mockBulkActionOverview,
        filter: undefined,
        progress: undefined,
        summary: undefined,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStopped,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          filter: {
            match: 'PATTERN', // todo: is this expected behavior?
          },
          progress: {},
          summary: {},
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionStopped(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionSucceed', () => {
    it('should emit event when action succeed (without progress)', () => {
      service.sendActionSucceed(mockSessionMetadata, mockBulkActionOverview);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsSucceed,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          filter: {
            match: '*',
            type: mockBulkActionOverview.filter.type,
          },
          summary: {
            processed: mockBulkActionOverview.summary.processed,
            processedRange: '0 - 5 000',
            succeed: mockBulkActionOverview.summary.succeed,
            succeedRange: '0 - 5 000',
            failed: mockBulkActionOverview.summary.failed,
            failedRange: '0 - 5 000',
          },
        },
      );
    });
    it('should emit event when action succeed without filter and summary', () => {
      service.sendActionSucceed(mockSessionMetadata, {
        ...mockBulkActionOverview,
        filter: undefined,
        summary: undefined,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsSucceed,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          filter: {
            match: 'PATTERN', // todo: is this expected behavior?
          },
          summary: {},
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionSucceed(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionFailed', () => {
    it('should emit event when action failed (without progress)', () => {
      service.sendActionFailed(
        mockSessionMetadata,
        mockBulkActionOverview,
        mockRedisNoAuthError,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsFailed,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          error: mockRedisNoAuthError,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionFailed(mockSessionMetadata, undefined, undefined);
      expect(sendFailedEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendImportSamplesUploaded', () => {
    it('should emit event when action succeed (without progress)', () => {
      service.sendImportSamplesUploaded(
        mockSessionMetadata,
        mockBulkActionOverview,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ImportSamplesUploaded,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          summary: {
            processed: mockBulkActionOverview.summary.processed,
            processedRange: '0 - 5 000',
            succeed: mockBulkActionOverview.summary.succeed,
            succeedRange: '0 - 5 000',
            failed: mockBulkActionOverview.summary.failed,
            failedRange: '0 - 5 000',
          },
        },
      );
    });
    it('should emit event when action succeed without filter and summary', () => {
      service.sendImportSamplesUploaded(mockSessionMetadata, {
        ...mockBulkActionOverview,
        filter: undefined,
        summary: undefined,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ImportSamplesUploaded,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          summary: {},
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendImportSamplesUploaded(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });
});
