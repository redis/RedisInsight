import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockBulkActionOverview,
  mockDatabase,
  mockRedisNoAuthError,
  mockSessionMetadata,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import { BulkActionConfirmation } from 'src/modules/bulk-actions/constants';
import { Environment } from 'src/modules/database/entities/database.entity';

const productionDatabase = {
  ...mockDatabase,
  environment: Environment.Production,
};

describe('BulkActionsAnalytics', () => {
  let service: BulkActionsAnalytics;
  let sendEventSpy: jest.SpyInstance;
  let sendFailedEventSpy: jest.SpyInstance;

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
      service.sendActionStarted(
        mockSessionMetadata,
        mockBulkActionOverview,
        mockDatabase,
      );

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
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action started without progress data and filter as "PATTERN"', () => {
      service.sendActionStarted(
        mockSessionMetadata,
        {
          ...mockBulkActionOverview,
          filter: { match: 'some query', type: null },
          progress: undefined,
        },
        mockDatabase,
      );

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
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action started without progress and filter', () => {
      service.sendActionStarted(
        mockSessionMetadata,
        {
          ...mockBulkActionOverview,
          filter: undefined,
          progress: undefined,
        },
        mockDatabase,
      );

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
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should emit environment=production when database is production', () => {
      service.sendActionStarted(
        mockSessionMetadata,
        mockBulkActionOverview as unknown as IBulkActionOverview,
        productionDatabase,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        expect.objectContaining({ environment: Environment.Production }),
      );
    });
    it('should round-trip confirmedThrough from overview', () => {
      service.sendActionStarted(
        mockSessionMetadata,
        {
          ...mockBulkActionOverview,
          confirmedThrough: BulkActionConfirmation.TypeToConfirm,
        } as unknown as IBulkActionOverview,
        mockDatabase,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        expect.objectContaining({ confirmedThrough: 'type-to-confirm' }),
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionStarted(mockSessionMetadata, undefined, mockDatabase);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionStopped', () => {
    it('should emit event when action paused/stopped', () => {
      service.sendActionStopped(
        mockSessionMetadata,
        mockBulkActionOverview,
        mockDatabase,
      );

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
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action paused/stopped without progress, filter and summary', () => {
      service.sendActionStopped(
        mockSessionMetadata,
        {
          ...mockBulkActionOverview,
          filter: undefined,
          progress: undefined,
          summary: undefined,
        },
        mockDatabase,
      );

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
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionStopped(mockSessionMetadata, undefined, mockDatabase);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionSucceed', () => {
    it('should emit event when action succeed (without progress)', () => {
      service.sendActionSucceed(
        mockSessionMetadata,
        mockBulkActionOverview,
        mockDatabase,
      );

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
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action succeed without filter and summary', () => {
      service.sendActionSucceed(
        mockSessionMetadata,
        {
          ...mockBulkActionOverview,
          filter: undefined,
          summary: undefined,
        },
        mockDatabase,
      );

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
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionSucceed(mockSessionMetadata, undefined, mockDatabase);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionFailed', () => {
    it('should emit event when action failed (without progress)', () => {
      service.sendActionFailed(
        mockSessionMetadata,
        mockBulkActionOverview,
        mockRedisNoAuthError,
        mockDatabase,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsFailed,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          error: mockRedisNoAuthError,
          environment: Environment.Unspecified,
          confirmedThrough: null,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendActionFailed(
        mockSessionMetadata,
        undefined,
        undefined,
        mockDatabase,
      );
      expect(sendFailedEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendImportSamplesUploaded', () => {
    it('should emit event when action succeed (without progress)', () => {
      service.sendImportSamplesUploaded(
        mockSessionMetadata,
        mockBulkActionOverview,
        mockDatabase,
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
          environment: Environment.Unspecified,
        },
      );
    });
    it('should emit event when action succeed without filter and summary', () => {
      service.sendImportSamplesUploaded(
        mockSessionMetadata,
        {
          ...mockBulkActionOverview,
          filter: undefined,
          summary: undefined,
        },
        mockDatabase,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.ImportSamplesUploaded,
        {
          databaseId: mockBulkActionOverview.databaseId,
          action: mockBulkActionOverview.type,
          duration: mockBulkActionOverview.duration,
          summary: {},
          environment: Environment.Unspecified,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', () => {
      service.sendImportSamplesUploaded(
        mockSessionMetadata,
        undefined,
        mockDatabase,
      );
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });
});
