import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { SessionMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';
import { Environment } from 'src/modules/database/entities/database.entity';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error;
}

@Injectable()
export class ProfilerAnalyticsService extends TelemetryBaseService {
  private events: Map<TelemetryEvents, Function> = new Map();

  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
    this.events.set(
      TelemetryEvents.ProfilerLogDownloaded,
      this.sendLogDownloaded.bind(this),
    );
    this.events.set(
      TelemetryEvents.ProfilerLogDeleted,
      this.sendLogDeleted.bind(this),
    );
  }

  sendLogDeleted(
    sessionMetadata: SessionMetadata,
    database: Database,
    fileSizeBytes: number,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.ProfilerLogDeleted, {
        databaseId: database.id,
        fileSizeBytes,
        environment: database.environment ?? Environment.Unspecified,
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  sendLogDownloaded(
    sessionMetadata: SessionMetadata,
    database: Database,
    fileSizeBytes: number,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.ProfilerLogDownloaded, {
        databaseId: database.id,
        fileSizeBytes,
        environment: database.environment ?? Environment.Unspecified,
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  sendProfilerStartedEvent(
    sessionMetadata: SessionMetadata,
    database: Database,
  ): void {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.ProfilerStarted, {
        databaseId: database.id,
        environment: database.environment ?? Environment.Unspecified,
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  getEventsEmitters(): Map<TelemetryEvents, Function> {
    return this.events;
  }
}
