import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class SlowLogAnalytics extends TelemetryBaseService {
  private events: Map<TelemetryEvents, Function> = new Map();

  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
    this.events.set(
      TelemetryEvents.SlowlogSetLogSlowerThan,
      this.slowLogLogSlowerThanUpdated.bind(this),
    );
    this.events.set(
      TelemetryEvents.SlowlogSetMaxLen,
      this.slowLogMaxLenUpdated.bind(this),
    );
  }

  updateSlowLogConfig(
    sessionMetadata: SessionMetadata,
    event: TelemetryEvents,
    eventData: any,
  ): void {
    try {
      this.sendEvent(sessionMetadata, event, eventData);
    } catch (e) {
      // continue regardless of error
    }
  }

  slowLogMaxLenUpdated(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    previousValue: number,
    currentValue: number,
  ): void {
    this.updateSlowLogConfig(
      sessionMetadata,
      TelemetryEvents.SlowlogSetMaxLen,
      {
        databaseId,
        previousValue,
        currentValue,
      },
    );
  }

  slowLogLogSlowerThanUpdated(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    previousValue: number,
    currentValue: number,
  ): void {
    this.updateSlowLogConfig(
      sessionMetadata,
      TelemetryEvents.SlowlogSetLogSlowerThan,
      {
        databaseId,
        // convert microseconds to milliseconds
        previousValueInMSeconds: previousValue / 1_000,
        currentValueInMSeconds: currentValue / 1_000,
      },
    );
  }
}
