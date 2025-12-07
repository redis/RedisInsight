import { Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class CustomTutorialAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendImportSucceeded(sessionMetadata: SessionMetadata, data: any = {}): void {
    this.sendEvent(
      sessionMetadata,
      TelemetryEvents.WorkbenchEnablementAreaImportSucceeded,
      {
        manifest: data?.manifest ? 'yes' : 'no',
      },
    );
  }

  sendImportFailed(sessionMetadata: SessionMetadata, e: Error): void {
    this.sendEvent(
      sessionMetadata,
      TelemetryEvents.WorkbenchEnablementAreaImportFailed,
      {
        error: e?.constructor?.name || 'UncaughtError',
      },
    );
  }
}
