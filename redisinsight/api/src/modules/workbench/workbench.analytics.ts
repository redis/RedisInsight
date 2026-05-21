import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';
import { SessionMetadata } from 'src/common/models';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { resolveEnvironment } from 'src/modules/database/utils/resolve-environment';
import { DangerousCommandsProvider } from 'src/modules/database/providers/dangerous-commands.provider';
import { RedisClient } from 'src/modules/redis/client';
import { Environment } from 'src/modules/database/entities/database.entity';
import { CommandExecutionType } from './models/command-execution';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error;
}

export interface WorkbenchCommandEventData {
  command?: string;
  rawMode?: boolean;
}

// All results in a batch share databaseId + command, so environment +
// isDangerous can be resolved once by the batch caller and threaded through.
interface PrefetchedTelemetry {
  environment: Environment;
  isDangerous: 'true' | 'false';
}

@Injectable()
export class WorkbenchAnalytics extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
    private readonly databaseRepository: DatabaseRepository,
    private readonly dangerousCommandsProvider: DangerousCommandsProvider,
  ) {
    super(eventEmitter, commandsService);
  }

  async sendIndexInfoEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    commandExecutionType: CommandExecutionType,
    additionalData: object | null,
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
        environment: await resolveEnvironment(
          this.databaseRepository,
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
    client: RedisClient | undefined,
    additionalData: WorkbenchCommandEventData = {},
  ): Promise<void> {
    try {
      // Resolve once for the whole batch — every result shares databaseId +
      // command, so environment and isDangerous are identical across results.
      const prefetched = await this.prefetchTelemetry(
        sessionMetadata,
        databaseId,
        client,
        additionalData.command,
      );

      await Promise.all(
        results.map((result) =>
          this.sendCommandExecutedEvent(
            sessionMetadata,
            databaseId,
            commandExecutionType,
            result,
            client,
            additionalData,
            prefetched,
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
    client: RedisClient | undefined,
    additionalData: WorkbenchCommandEventData = {},
    prefetched?: PrefetchedTelemetry,
  ): Promise<void> {
    const { status } = result;
    try {
      const { command } = additionalData;
      const { environment, isDangerous } =
        prefetched ??
        (await this.prefetchTelemetry(
          sessionMetadata,
          databaseId,
          client,
          command,
        ));

      if (status === CommandExecutionStatus.Success) {
        const event =
          commandExecutionType === CommandExecutionType.Search
            ? TelemetryEvents.SearchCommandExecuted
            : TelemetryEvents.WorkbenchCommandExecuted;

        this.sendEvent(sessionMetadata, event, {
          databaseId,
          ...(await this.getCommandAdditionalInfo(command)),
          ...additionalData,
          environment,
          isDangerous,
        });
      }
      if (status === CommandExecutionStatus.Fail) {
        await this.sendCommandErrorEvent(
          sessionMetadata,
          databaseId,
          result.error,
          commandExecutionType,
          client,
          additionalData,
          { environment, isDangerous },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  private async prefetchTelemetry(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    client: RedisClient | undefined,
    command: string | undefined,
  ): Promise<PrefetchedTelemetry> {
    const [environment, dangerous] = await Promise.all([
      resolveEnvironment(this.databaseRepository, sessionMetadata, databaseId),
      this.dangerousCommandsProvider.isDangerous(client, command),
    ]);
    return { environment, isDangerous: dangerous ? 'true' : 'false' };
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
    client: RedisClient | undefined,
    additionalData: WorkbenchCommandEventData = {},
    prefetched?: PrefetchedTelemetry,
  ): Promise<void> {
    try {
      const event =
        commandExecutionType === CommandExecutionType.Search
          ? TelemetryEvents.SearchCommandErrorReceived
          : TelemetryEvents.WorkbenchCommandErrorReceived;

      const { command } = additionalData;
      const commandInfo = await this.getCommandAdditionalInfo(command);
      const { environment, isDangerous } =
        prefetched ??
        (await this.prefetchTelemetry(
          sessionMetadata,
          databaseId,
          client,
          command,
        ));

      if (error instanceof HttpException) {
        this.sendFailedEvent(sessionMetadata, event, error, {
          databaseId,
          ...commandInfo,
          ...additionalData,
          environment,
          isDangerous,
        });
      } else {
        this.sendEvent(sessionMetadata, event, {
          databaseId,
          error: error.name,
          command: error?.command?.name,
          ...commandInfo,
          ...additionalData,
          environment,
          isDangerous,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
