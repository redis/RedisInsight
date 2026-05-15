import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';
import { SessionMetadata } from 'src/common/models';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
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
    private readonly databaseRepository: DatabaseRepository,
  ) {
    super(eventEmitter, commandsService);
  }

  private async resolveIsProduction(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<'true' | 'false'> {
    try {
      const database = await this.databaseRepository.get(
        sessionMetadata,
        databaseId,
      );
      return database?.isProduction ? 'true' : 'false';
    } catch (e) {
      return 'false';
    }
  }

  async sendIndexInfoEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    commandExecutionType: CommandExecutionType,
    additionalData: object,
  ): Promise<void> {
    if (!additionalData) {
      return;
    }

    try {
      const event =
        commandExecutionType === CommandExecutionType.Search
          ? TelemetryEvents.SearchIndexInfoSubmitted
          : TelemetryEvents.WorkbenchIndexInfoSubmitted;

      this.sendEvent(sessionMetadata, event, {
        databaseId,
        ...additionalData,
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          databaseId,
        ),
      });
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
      const { dangerous, ...rest } = additionalData as {
        dangerous?: boolean;
        command?: string;
        [k: string]: any;
      };
      if (status === CommandExecutionStatus.Success) {
        const event =
          commandExecutionType === CommandExecutionType.Search
            ? TelemetryEvents.SearchCommandExecuted
            : TelemetryEvents.WorkbenchCommandExecuted;

        this.sendEvent(sessionMetadata, event, {
          databaseId,
          ...(await this.getCommandAdditionalInfo(rest['command'])),
          ...rest,
          isProduction: await this.resolveIsProduction(
            sessionMetadata,
            databaseId,
          ),
          dangerous: dangerous ? 'true' : 'false',
        });
      }
      if (status === CommandExecutionStatus.Fail) {
        await this.sendCommandErrorEvent(
          sessionMetadata,
          databaseId,
          result.error,
          commandExecutionType,
          {
            ...(await this.getCommandAdditionalInfo(rest['command'])),
            ...rest,
            dangerous,
          },
        );
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

  private async sendCommandErrorEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    error: any,
    commandExecutionType: CommandExecutionType,
    additionalData: object = {},
  ): Promise<void> {
    try {
      const event =
        commandExecutionType === CommandExecutionType.Search
          ? TelemetryEvents.SearchCommandErrorReceived
          : TelemetryEvents.WorkbenchCommandErrorReceived;

      const { dangerous, ...rest } = additionalData as {
        dangerous?: boolean;
        [k: string]: any;
      };
      const isProduction = await this.resolveIsProduction(
        sessionMetadata,
        databaseId,
      );
      const dangerousStr: 'true' | 'false' = dangerous ? 'true' : 'false';

      if (error instanceof HttpException) {
        this.sendFailedEvent(sessionMetadata, event, error, {
          databaseId,
          ...rest,
          isProduction,
          dangerous: dangerousStr,
        });
      } else {
        this.sendEvent(sessionMetadata, event, {
          databaseId,
          error: error.name,
          command: error?.command?.name,
          ...rest,
          isProduction,
          dangerous: dangerousStr,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
