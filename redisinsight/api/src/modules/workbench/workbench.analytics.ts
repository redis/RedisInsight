import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';
import { SessionMetadata } from 'src/common/models';
import { CommandExecutionType } from './models/command-execution';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error;
}

@Injectable()
export class WorkbenchAnalytics extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
  ) {
    super(eventEmitter, commandsService);
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
      this.sendEvent(
        sessionMetadata,
        TelemetryEvents.WorkbenchIndexInfoSubmitted,
        {
          databaseId,
          ...additionalData,
        },
      );
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandExecutedEvents(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    commandExecutionType: CommandExecutionType,
    results: IExecResult[],
    additionalData: object = {},
  ): Promise<void> {
    try {
      await Promise.all(
        results.map((result) =>
          this.sendCommandExecutedEvent(
            sessionMetadata,
            databaseId,
            commandExecutionType,
            result,
            additionalData,
          ),
        ),
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendCommandExecutedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    commandExecutionType: CommandExecutionType,
    result: IExecResult,
    additionalData: object = {},
  ): Promise<void> {
    const { status } = result;

    try {
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          sessionMetadata,
          commandExecutionType === CommandExecutionType.Search
            ? TelemetryEvents.SearchCommandExecuted
            : TelemetryEvents.WorkbenchCommandExecuted,
          {
            databaseId,
            ...(await this.getCommandAdditionalInfo(additionalData['command'])),
            ...additionalData,
          },
        );
      }
      if (status === CommandExecutionStatus.Fail) {
        this.sendCommandErrorEvent(sessionMetadata, databaseId, result.error, {
          ...(await this.getCommandAdditionalInfo(additionalData['command'])),
          ...additionalData,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCommandDeletedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(sessionMetadata, TelemetryEvents.WorkbenchCommandDeleted, {
      databaseId,
      ...additionalData,
    });
  }

  private sendCommandErrorEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    error: any,
    additionalData: object = {},
  ): void {
    try {
      if (error instanceof HttpException) {
        this.sendFailedEvent(
          sessionMetadata,
          TelemetryEvents.WorkbenchCommandErrorReceived,
          error,
          {
            databaseId,
            ...additionalData,
          },
        );
      } else {
        this.sendEvent(
          sessionMetadata,
          TelemetryEvents.WorkbenchCommandErrorReceived,
          {
            databaseId,
            error: error.name,
            command: error?.command?.name,
            ...additionalData,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
