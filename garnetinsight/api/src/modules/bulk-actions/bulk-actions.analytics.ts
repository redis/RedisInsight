import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { getRangeForNumber, BULK_ACTIONS_BREAKPOINTS } from 'src/utils';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class BulkActionsAnalytics extends TelemetryBaseService {
  sendActionStarted(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.BulkActionsStarted, {
        databaseId: overview.databaseId,
        action: overview.type,
        duration: overview.duration,
        filter: {
          match: overview.filter?.match === '*' ? '*' : 'PATTERN',
          type: overview.filter?.type,
        },
        progress: {
          scanned: overview.progress?.scanned,
          scannedRange: getRangeForNumber(
            overview.progress?.scanned,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          total: overview.progress?.total,
          totalRange: getRangeForNumber(
            overview.progress?.total,
            BULK_ACTIONS_BREAKPOINTS,
          ),
        },
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  sendActionStopped(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.BulkActionsStopped, {
        databaseId: overview.databaseId,
        action: overview.type,
        duration: overview.duration,
        filter: {
          match: overview.filter?.match === '*' ? '*' : 'PATTERN',
          type: overview.filter?.type,
        },
        progress: {
          scanned: overview.progress?.scanned,
          scannedRange: getRangeForNumber(
            overview.progress?.scanned,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          total: overview.progress?.total,
          totalRange: getRangeForNumber(
            overview.progress?.total,
            BULK_ACTIONS_BREAKPOINTS,
          ),
        },
        summary: {
          processed: overview.summary?.processed,
          processedRange: getRangeForNumber(
            overview.summary?.processed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          succeed: overview.summary?.succeed,
          succeedRange: getRangeForNumber(
            overview.summary?.succeed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          failed: overview.summary?.failed,
          failedRange: getRangeForNumber(
            overview.summary?.failed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
        },
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  sendActionSucceed(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.BulkActionsSucceed, {
        databaseId: overview.databaseId,
        action: overview.type,
        duration: overview.duration,
        filter: {
          match: overview.filter?.match === '*' ? '*' : 'PATTERN',
          type: overview.filter?.type,
        },
        summary: {
          processed: overview.summary?.processed,
          processedRange: getRangeForNumber(
            overview.summary?.processed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          succeed: overview.summary?.succeed,
          succeedRange: getRangeForNumber(
            overview.summary?.succeed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          failed: overview.summary?.failed,
          failedRange: getRangeForNumber(
            overview.summary?.failed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
        },
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  sendActionFailed(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
    error: HttpException | Error,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.BulkActionsFailed, {
        databaseId: overview.databaseId,
        action: overview.type,
        error,
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  sendImportSamplesUploaded(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.ImportSamplesUploaded, {
        databaseId: overview.databaseId,
        action: overview.type,
        duration: overview.duration,
        summary: {
          processed: overview.summary?.processed,
          processedRange: getRangeForNumber(
            overview.summary?.processed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          succeed: overview.summary?.succeed,
          succeedRange: getRangeForNumber(
            overview.summary?.succeed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
          failed: overview.summary?.failed,
          failedRange: getRangeForNumber(
            overview.summary?.failed,
            BULK_ACTIONS_BREAKPOINTS,
          ),
        },
      });
    } catch (e) {
      // continue regardless of error
    }
  }
}
