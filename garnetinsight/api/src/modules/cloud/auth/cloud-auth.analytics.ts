import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { CloudSsoFeatureStrategy } from 'src/modules/cloud/cloud-sso.feature.flag';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class CloudAuthAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCloudSignInSucceeded(
    sessionMetadata: SessionMetadata,
    flow: CloudSsoFeatureStrategy,
    action?: string,
  ) {
    this.sendEvent(sessionMetadata, TelemetryEvents.CloudSignInSucceeded, {
      flow,
      action,
    });
  }

  sendCloudSignInFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
    flow?: CloudSsoFeatureStrategy,
    action?: string,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.CloudSignInFailed,
      exception,
      {
        flow,
        action,
        errorDescription: exception?.['options']?.['description'],
      },
    );
  }
}
