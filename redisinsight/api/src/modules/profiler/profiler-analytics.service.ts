import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { SessionMetadata } from 'src/common/models';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { resolveEnvironment } from 'src/modules/database/utils/resolve-environment';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error;
}

@Injectable()
export class ProfilerAnalyticsService extends TelemetryBaseService {
  private events: Map<TelemetryEvents, Function> = new Map();

  constructor(
    protected eventEmitter: EventEmitter2,
    private readonly databaseRepository: DatabaseRepository,
  ) {
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

  async sendLogDeleted(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    fileSizeBytes: number,
  ): Promise<void> {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.ProfilerLogDeleted, {
        databaseId,
        fileSizeBytes,
        environment: await resolveEnvironment(
          this.databaseRepository,
          sessionMetadata,
          databaseId,
        ),
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  async sendLogDownloaded(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    fileSizeBytes: number,
  ): Promise<void> {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.ProfilerLogDownloaded, {
        databaseId,
        fileSizeBytes,
        environment: await resolveEnvironment(
          this.databaseRepository,
          sessionMetadata,
          databaseId,
        ),
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  async sendProfilerStartedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.ProfilerStarted, {
        databaseId,
        environment: await resolveEnvironment(
          this.databaseRepository,
          sessionMetadata,
          databaseId,
        ),
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  getEventsEmitters(): Map<TelemetryEvents, Function> {
    return this.events;
  }
}
