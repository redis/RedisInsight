import { uniq } from 'lodash';
import { Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import {
  DatabaseImportResponse,
  DatabaseImportResult,
} from 'src/modules/database-import/dto/database-import.response';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class DatabaseImportAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendImportResults(
    sessionMetadata: SessionMetadata,
    importResult: DatabaseImportResponse,
  ): void {
    if (importResult.success?.length) {
      this.sendEvent(sessionMetadata, TelemetryEvents.DatabaseImportSucceeded, {
        succeed: importResult.success.length,
      });
    }

    if (importResult.fail?.length) {
      this.sendEvent(sessionMetadata, TelemetryEvents.DatabaseImportFailed, {
        failed: importResult.fail.length,
        errors: DatabaseImportAnalytics.getUniqueErrorNamesFromResults(
          importResult.fail,
        ),
      });
    }

    if (importResult.partial?.length) {
      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.DatabaseImportPartiallySucceeded,
        {
          partially: importResult.partial.length,
          errors: DatabaseImportAnalytics.getUniqueErrorNamesFromResults(
            importResult.partial,
          ),
        },
      );
    }
  }

  sendImportFailed(sessionMetadata: SessionMetadata, e: Error): void {
    this.sendEvent(sessionMetadata, TelemetryEvents.DatabaseImportParseFailed, {
      error: e?.constructor?.name || 'UncaughtError',
    });
  }

  static getUniqueErrorNamesFromResults(results: DatabaseImportResult[]) {
    return uniq(
      [].concat(
        ...results.map((res) =>
          (res?.errors || []).map(
            (error) => error?.constructor?.name || 'UncaughtError',
          ),
        ),
      ),
    );
  }
}
