import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { getRangeForNumber, BULK_ACTIONS_BREAKPOINTS } from 'src/utils';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import { SessionMetadata } from 'src/common/models';
import {
  BulkActionType,
  BulkActionConfirmation,
} from 'src/modules/bulk-actions/constants';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';

@Injectable()
export class BulkActionsAnalytics extends TelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    private readonly databaseRepository: DatabaseRepository,
  ) {
    super(eventEmitter);
  }

  private async resolveIsProduction(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<'true' | 'false'> {
    try {
      const database = await this.databaseRepository.get(
        sessionMetadata,
        databaseId,
      );
      return database?.isProduction ? 'true' : 'false';
    } catch (e) {
      return 'false';
    }
  }

  private isDangerousAction(type: BulkActionType): 'true' | 'false' {
    return type === BulkActionType.Delete || type === BulkActionType.Unlink
      ? 'true'
      : 'false';
  }

  private resolveConfirmedThrough(
    overview: IBulkActionOverview,
  ): BulkActionConfirmation | null {
    return overview.confirmedThrough ?? null;
  }

  async sendActionStarted(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): Promise<void> {
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
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          overview.databaseId,
        ),
        dangerous: this.isDangerousAction(overview.type),
        confirmedThrough: this.resolveConfirmedThrough(overview),
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  async sendActionStopped(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): Promise<void> {
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
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          overview.databaseId,
        ),
        dangerous: this.isDangerousAction(overview.type),
        confirmedThrough: this.resolveConfirmedThrough(overview),
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  async sendActionSucceed(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): Promise<void> {
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
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          overview.databaseId,
        ),
        dangerous: this.isDangerousAction(overview.type),
        confirmedThrough: this.resolveConfirmedThrough(overview),
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  async sendActionFailed(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
    error: HttpException | Error,
  ): Promise<void> {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.BulkActionsFailed, {
        databaseId: overview.databaseId,
        action: overview.type,
        error,
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          overview.databaseId,
        ),
        dangerous: this.isDangerousAction(overview.type),
        confirmedThrough: this.resolveConfirmedThrough(overview),
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  async sendImportSamplesUploaded(
    sessionMetadata: SessionMetadata,
    overview: IBulkActionOverview,
  ): Promise<void> {
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
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          overview.databaseId,
        ),
      });
    } catch (e) {
      // continue regardless of error
    }
  }
}
