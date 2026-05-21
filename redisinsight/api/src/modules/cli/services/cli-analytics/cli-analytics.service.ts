import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { ReplyError } from 'src/models';
import {
  CommandExecutionStatus,
  ICliExecResultFromNode,
} from 'src/modules/cli/dto/cli.dto';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';
import { SessionMetadata } from 'src/common/models';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { resolveEnvironment } from 'src/modules/database/utils/resolve-environment';
import { DangerousCommandsProvider } from 'src/modules/database/providers/dangerous-commands.provider';
import { RedisClient } from 'src/modules/redis/client';
import { CliOutputFormatterTypes } from 'src/modules/cli/services/cli-business/output-formatter/output-formatter.interface';

export interface CliCommandEventData {
  command?: string;
  outputFormat?: CliOutputFormatterTypes;
}

@Injectable()
export class CliAnalyticsService extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
    private readonly databaseRepository: DatabaseRepository,
    private readonly dangerousCommandsProvider: DangerousCommandsProvider,
  ) {
    super(eventEmitter, commandsService);
  }

  sendClientCreatedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(sessionMetadata, TelemetryEvents.CliClientCreated, {
      databaseId,
      ...additionalData,
    });
  }

  sendClientCreationFailedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    exception: HttpException,
    additionalData: object = {},
  ): void {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.CliClientCreationFailed,
      exception,
      {
        databaseId,
        ...additionalData,
      },
    );
  }

  sendClientRecreatedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(sessionMetadata, TelemetryEvents.CliClientRecreated, {
      databaseId,
      ...additionalData,
    });
  }

  sendClientDeletedEvent(
    sessionMetadata: SessionMetadata,
    affected: number,
    databaseId: string,
    additionalData: object = {},
  ): void {
    try {
      if (affected > 0) {
        this.sendEvent(sessionMetadata, TelemetryEvents.CliClientDeleted, {
          databaseId,
          ...additionalData,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendIndexInfoEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    additionalData: object,
  ): void {
    if (!additionalData) {
      return;
    }

    try {
      this.sendEvent(sessionMetadata, TelemetryEvents.CliIndexInfoSubmitted, {
        databaseId,
        ...additionalData,
      });
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandExecutedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    client: RedisClient | undefined,
    additionalData: CliCommandEventData = {},
  ): Promise<void> {
    try {
      const { command } = additionalData;
      this.sendEvent(sessionMetadata, TelemetryEvents.CliCommandExecuted, {
        databaseId,
        ...(await this.getCommandAdditionalInfo(command)),
        ...additionalData,
        environment: await resolveEnvironment(
          this.databaseRepository,
          sessionMetadata,
          databaseId,
        ),
        isDangerous: (await this.dangerousCommandsProvider.isDangerous(
          client,
          command,
        ))
          ? 'true'
          : 'false',
      });
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandErrorEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    error: ReplyError,
    client: RedisClient | undefined,
    additionalData: CliCommandEventData = {},
  ): Promise<void> {
    try {
      const { command } = additionalData;
      this.sendEvent(sessionMetadata, TelemetryEvents.CliCommandErrorReceived, {
        databaseId,
        error: error?.name,
        command: error?.command?.name,
        ...(await this.getCommandAdditionalInfo(command)),
        ...additionalData,
        environment: await resolveEnvironment(
          this.databaseRepository,
          sessionMetadata,
          databaseId,
        ),
        isDangerous: (await this.dangerousCommandsProvider.isDangerous(
          client,
          command,
        ))
          ? 'true'
          : 'false',
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendClusterCommandExecutedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    result: ICliExecResultFromNode,
    client: RedisClient | undefined,
    additionalData: CliCommandEventData = {},
  ): Promise<void> {
    const { status, error } = result;
    try {
      const { command } = additionalData;
      const environment = await resolveEnvironment(
        this.databaseRepository,
        sessionMetadata,
        databaseId,
      );
      const isDangerous = (await this.dangerousCommandsProvider.isDangerous(
        client,
        command,
      ))
        ? 'true'
        : 'false';
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          sessionMetadata,
          TelemetryEvents.CliClusterNodeCommandExecuted,
          {
            databaseId,
            ...(await this.getCommandAdditionalInfo(command)),
            ...additionalData,
            environment,
            isDangerous,
          },
        );
      }
      if (status === CommandExecutionStatus.Fail) {
        this.sendEvent(
          sessionMetadata,
          TelemetryEvents.CliCommandErrorReceived,
          {
            databaseId,
            error: error.name,
            command: error?.command?.name,
            ...(await this.getCommandAdditionalInfo(command)),
            ...additionalData,
            environment,
            isDangerous,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendConnectionErrorEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    exception: HttpException,
    additionalData: CliCommandEventData = {},
  ): Promise<void> {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.CliClientConnectionError,
      exception,
      {
        databaseId,
        ...(await this.getCommandAdditionalInfo(additionalData.command)),
        ...additionalData,
      },
    );
  }
}
