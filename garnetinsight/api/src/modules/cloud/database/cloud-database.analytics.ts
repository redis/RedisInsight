import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class CloudDatabaseAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCloudFreeDatabaseCreated(
    sessionMetadata: SessionMetadata,
    eventData: object = {},
  ) {
    this.sendEvent(
      sessionMetadata,
      TelemetryEvents.CloudFreeDatabaseCreated,
      eventData,
    );
  }

  sendCloudFreeDatabaseFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
    eventData: object = {},
  ) {
    try {
      this.sendFailedEvent(
        sessionMetadata,
        TelemetryEvents.CloudFreeDatabaseFailed,
        exception,
        eventData,
      );
    } catch (error) {
      // ignore
    }
  }
}
