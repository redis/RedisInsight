import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class RdiPipelineAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendRdiPipelineDeployed(sessionMetadata: SessionMetadata, id: string) {
    this.sendEvent(
      sessionMetadata,
      TelemetryEvents.RdiPipelineDeploymentSucceeded,
      { id },
    );
  }

  sendRdiPipelineDeployFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
    id: string,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.RdiPipelineDeploymentFailed,
      exception,
      { id },
    );
  }

  sendRdiPipelineFetched(
    sessionMetadata: SessionMetadata,
    id: string,
    pipeline: any,
  ) {
    try {
      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.RdiPipelineDeploymentSucceeded,
        {
          id,
          jobsNumber: pipeline?.jobs ? Object.keys(pipeline.jobs).length : 0,
          source: 'server',
        },
      );
    } catch (e) {
      // ignore
    }
  }

  sendRdiPipelineFetchFailed(
    sessionMetadata: SessionMetadata,
    exception: HttpException,
    id: string,
  ) {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.RdiPipelineDeploymentFailed,
      exception,
      { id, source: 'server' },
    );
  }
}
