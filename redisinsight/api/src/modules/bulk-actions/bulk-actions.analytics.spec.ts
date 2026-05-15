import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockBulkActionOverview,
  mockDatabase,
  mockDatabaseRepository,
  MockType,
  mockRedisNoAuthError,
  mockSessionMetadata,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import {
  BulkActionConfirmation,
  BulkActionType,
} from 'src/modules/bulk-actions/constants';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';

describe('BulkActionsAnalytics', () => {
  let service: BulkActionsAnalytics;
  let sendEventSpy;
  let sendFailedEventSpy;
  let databaseRepository: MockType<DatabaseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkActionsAnalytics,
        EventEmitter2,
        {
          provide: DatabaseRepository,
          useFactory: mockDatabaseRepository,
        },
      ],
    }).compile();

    service = await module.get(BulkActionsAnalytics);
    databaseRepository = module.get(DatabaseRepository);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
    sendFailedEventSpy = jest.spyOn(service as any, 'sendFailedEvent');
  });

  describe('sendActionStarted', () => {
    it('should emit event when action started (without summary)', async () => {
      await service.sendActionStarted(
        mockSessionMetadata,
        mockBulkActionOverview,
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action started without progress data and filter as "PATTERN"', async () => {
      await service.sendActionStarted(mockSessionMetadata, {
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action started without progress and filter', async () => {
      await service.sendActionStarted(mockSessionMetadata, {
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should emit isProduction=true when database is production', async () => {
      databaseRepository.get.mockResolvedValueOnce({
        ...mockDatabase,
        isProduction: true,
      });

      await service.sendActionStarted(
        mockSessionMetadata,
        mockBulkActionOverview,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        expect.objectContaining({ isProduction: 'true' }),
      );
    });
    it('should round-trip confirmedThrough from overview', async () => {
      await service.sendActionStarted(mockSessionMetadata, {
        ...mockBulkActionOverview,
        confirmedThrough: BulkActionConfirmation.TypeToConfirm,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        expect.objectContaining({ confirmedThrough: 'type-to-confirm' }),
      );
    });
    it('should emit dangerous=false for Upload bulk action', async () => {
      await service.sendActionStarted(mockSessionMetadata, {
        ...mockBulkActionOverview,
        type: BulkActionType.Upload,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.BulkActionsStarted,
        expect.objectContaining({ dangerous: 'false' }),
      );
    });
    it('should not emit event in case of an error and should not fail', async () => {
      await service.sendActionStarted(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionStopped', () => {
    it('should emit event when action paused/stopped', async () => {
      await service.sendActionStopped(
        mockSessionMetadata,
        mockBulkActionOverview,
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action paused/stopped without progress, filter and summary', async () => {
      await service.sendActionStopped(mockSessionMetadata, {
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', async () => {
      await service.sendActionStopped(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionSucceed', () => {
    it('should emit event when action succeed (without progress)', async () => {
      await service.sendActionSucceed(
        mockSessionMetadata,
        mockBulkActionOverview,
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should emit event when action succeed without filter and summary', async () => {
      await service.sendActionSucceed(mockSessionMetadata, {
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', async () => {
      await service.sendActionSucceed(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendActionFailed', () => {
    it('should emit event when action failed (without progress)', async () => {
      await service.sendActionFailed(
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
          isProduction: 'false',
          dangerous: 'true',
          confirmedThrough: null,
        },
      );
    });
    it('should not emit event in case of an error and should not fail', async () => {
      await service.sendActionFailed(mockSessionMetadata, undefined, undefined);
      expect(sendFailedEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendImportSamplesUploaded', () => {
    it('should emit event when action succeed (without progress)', async () => {
      await service.sendImportSamplesUploaded(
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
          isProduction: 'false',
        },
      );
    });
    it('should emit event when action succeed without filter and summary', async () => {
      await service.sendImportSamplesUploaded(mockSessionMetadata, {
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
          isProduction: 'false',
        },
      );
    });
    it('should not emit event in case of an error and should not fail', async () => {
      await service.sendImportSamplesUploaded(mockSessionMetadata, undefined);
      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });
});
