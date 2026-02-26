import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class AzureAuthAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendAzureSignInSucceeded(sessionMetadata: SessionMetadata) {
    this.sendEvent(sessionMetadata, TelemetryEvents.AzureSignInSucceeded);
  }

  sendAzureSignInFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.AzureSignInFailed,
      exception,
    );
  }
}
