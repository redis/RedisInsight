import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class CloudCapiKeyAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCloudAccountKeyGenerated(sessionMetadata: SessionMetadata) {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.CloudAccountKeyGenerated);
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCloudAccountKeyGenerationFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.CloudAccountKeyGenerationFailed,
      exception,
    );
  }

  sendCloudAccountSecretGenerated(sessionMetadata: SessionMetadata) {
    try {
      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.CloudAccountSecretGenerated,
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCloudAccountSecretGenerationFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.CloudAccountSecretGenerationFailed,
      exception,
    );
  }
}
