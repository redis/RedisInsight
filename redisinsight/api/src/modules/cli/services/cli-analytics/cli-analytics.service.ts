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

@Injectable()
export class CliAnalyticsService extends CommandTelemetryBaseService {
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
    additionalData: object = {},
  ): Promise<void> {
    try {
      const { dangerous, ...rest } = additionalData as {
        dangerous?: boolean;
        command?: string;
        [k: string]: any;
      };
      this.sendEvent(sessionMetadata, TelemetryEvents.CliCommandExecuted, {
        databaseId,
        ...(await this.getCommandAdditionalInfo(rest['command'])),
        ...rest,
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          databaseId,
        ),
        dangerous: dangerous ? 'true' : 'false',
      });
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandErrorEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    error: ReplyError,
    additionalData: object = {},
  ): Promise<void> {
    try {
      const { dangerous, ...rest } = additionalData as {
        dangerous?: boolean;
        command?: string;
        [k: string]: any;
      };
      this.sendEvent(sessionMetadata, TelemetryEvents.CliCommandErrorReceived, {
        databaseId,
        error: error?.name,
        command: error?.command?.name,
        ...(await this.getCommandAdditionalInfo(rest['command'])),
        ...rest,
        isProduction: await this.resolveIsProduction(
          sessionMetadata,
          databaseId,
        ),
        dangerous: dangerous ? 'true' : 'false',
      });
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendClusterCommandExecutedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    result: ICliExecResultFromNode,
    additionalData: object = {},
  ): Promise<void> {
    const { status, error } = result;
    try {
      const { dangerous, ...rest } = additionalData as {
        dangerous?: boolean;
        command?: string;
        [k: string]: any;
      };
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          sessionMetadata,
          TelemetryEvents.CliClusterNodeCommandExecuted,
          {
            databaseId,
            ...(await this.getCommandAdditionalInfo(rest['command'])),
            ...rest,
            isProduction: await this.resolveIsProduction(
              sessionMetadata,
              databaseId,
            ),
            dangerous: dangerous ? 'true' : 'false',
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
            ...(await this.getCommandAdditionalInfo(rest['command'])),
            ...rest,
            isProduction: await this.resolveIsProduction(
              sessionMetadata,
              databaseId,
            ),
            dangerous: dangerous ? 'true' : 'false',
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
    additionalData: object = {},
  ): Promise<void> {
    this.sendFailedEvent(
      sessionMetadata,
      TelemetryEvents.CliClientConnectionError,
      exception,
      {
        databaseId,
        ...(await this.getCommandAdditionalInfo(additionalData['command'])),
        ...additionalData,
      },
    );
  }
}
