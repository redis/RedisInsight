import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientMetadata } from 'src/common/models';
import { RECOMMENDATION_NAMES, unknownCommand } from 'src/constants';
import { CommandsService } from 'src/modules/commands/commands.service';
import {
  CommandExecutionStatus,
  CreateCliClientResponse,
  DeleteClientResponse,
  SendCommandDto,
  SendCommandResponse,
} from 'src/modules/cli/dto/cli.dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  checkHumanReadableCommands,
  splitCliCommandLine,
} from 'src/utils/cli-helper';
import {
  CommandNotSupportedError,
  CommandParsingError,
} from 'src/modules/cli/constants/errors';
import { CliAnalyticsService } from 'src/modules/cli/services/cli-analytics/cli-analytics.service';
import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions';
import { getUnsupportedCommands } from 'src/modules/cli/utils/getUnsupportedCommands';
import { ClientNotFoundErrorException } from 'src/modules/redis/exceptions/client-not-found-error.exception';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RedisClient } from 'src/modules/redis/client';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { v4 as uuidv4 } from 'uuid';
import { getAnalyticsDataFromIndexInfo } from 'src/utils';
import { OutputFormatterManager } from './output-formatter/output-formatter-manager';
import { CliOutputFormatterTypes } from './output-formatter/output-formatter.interface';
import { TextFormatterStrategy } from './output-formatter/strategies/text-formatter.strategy';
import { RawFormatterStrategy } from './output-formatter/strategies/raw-formatter.strategy';

@Injectable()
export class CliBusinessService {
  private logger = new Logger('CliService');

  private outputFormatterManager: OutputFormatterManager;

  constructor(
    private cliAnalyticsService: CliAnalyticsService,
    private recommendationService: DatabaseRecommendationService,
    private readonly commandsService: CommandsService,
    private databaseClientFactory: DatabaseClientFactory,
  ) {
    this.outputFormatterManager = new OutputFormatterManager();
    this.outputFormatterManager.addStrategy(
      CliOutputFormatterTypes.Text,
      new TextFormatterStrategy(),
    );
    this.outputFormatterManager.addStrategy(
      CliOutputFormatterTypes.Raw,
      new RawFormatterStrategy(),
    );
  }

  /**
   * Method to create new redis client and return uuid
   * @param clientMetadata
   */
  public async getClient(
    clientMetadata: ClientMetadata,
  ): Promise<CreateCliClientResponse> {
    this.logger.debug('Create Redis client for CLI.', clientMetadata);
    try {
      const uuid = uuidv4();
      await this.databaseClientFactory.getOrCreateClient({
        ...clientMetadata,
        uniqueId: uuid,
      });

      this.logger.debug(
        'Succeed to create Redis client for CLI.',
        clientMetadata,
      );
      this.cliAnalyticsService.sendClientCreatedEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
      );
      return { uuid };
    } catch (error) {
      this.logger.error(
        'Failed to create redis client for CLI.',
        error,
        clientMetadata,
      );
      this.cliAnalyticsService.sendClientCreationFailedEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
        error,
      );
      throw error;
    }
  }

  /**
   * Method to close exist client and create a new one
   * @param clientMetadata
   */
  public async reCreateClient(
    clientMetadata: ClientMetadata,
  ): Promise<CreateCliClientResponse> {
    this.logger.debug('re-create Redis client for CLI.', clientMetadata);
    try {
      await this.databaseClientFactory.deleteClient(clientMetadata);

      const uuid = uuidv4();
      await this.databaseClientFactory.getOrCreateClient({
        ...clientMetadata,
        uniqueId: uuid,
      });

      this.logger.debug(
        'Succeed to re-create Redis client for CLI.',
        clientMetadata,
      );
      this.cliAnalyticsService.sendClientRecreatedEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
      );
      return { uuid };
    } catch (error) {
      this.logger.error(
        'Failed to re-create redis client for CLI.',
        error,
        clientMetadata,
      );
      this.cliAnalyticsService.sendClientCreationFailedEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
        error,
      );
      throw error;
    }
  }

  /**
   * Method to close exist redis client
   * @param clientMetadata
   */
  public async deleteClient(
    clientMetadata: ClientMetadata,
  ): Promise<DeleteClientResponse> {
    this.logger.debug('Deleting Redis client for CLI.', clientMetadata);
    try {
      const affected = (await this.databaseClientFactory.deleteClient(
        clientMetadata,
      )) as unknown as number;
      this.logger.debug(
        'Succeed to delete Redis client for CLI.',
        clientMetadata,
      );

      if (affected) {
        this.cliAnalyticsService.sendClientDeletedEvent(
          clientMetadata.sessionMetadata,
          affected,
          clientMetadata.databaseId,
        );
      }
      return { affected };
    } catch (error) {
      this.logger.error(
        'Failed to delete Redis client for CLI.',
        error,
        clientMetadata,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Method to execute cli command for redis client and return result
   * @param clientMetadata
   * @param dto
   */
  public async sendCommand(
    clientMetadata: ClientMetadata,
    dto: SendCommandDto,
  ): Promise<SendCommandResponse> {
    this.logger.debug('Executing redis CLI command.', clientMetadata);
    const { command: commandLine } = dto;
    const outputFormat = dto.outputFormat || CliOutputFormatterTypes.Raw;
    let command: string = unknownCommand;
    let args: string[] = [];

    try {
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const formatter = this.outputFormatterManager.getStrategy(outputFormat);
      [command, ...args] = splitCliCommandLine(commandLine);
      const replyEncoding = checkHumanReadableCommands(`${command} ${args[0]}`)
        ? 'utf8'
        : undefined;
      this.checkUnsupportedCommands(`${command} ${args[0]}`);

      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.SEARCH_VISUALIZATION,
        command,
      );

      const reply = await client.sendCommand([command, ...args], {
        replyEncoding,
      });

      this.cliAnalyticsService.sendCommandExecutedEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
        {
          command,
          outputFormat,
        },
      );

      if (command.toLowerCase() === 'ft.info') {
        this.cliAnalyticsService.sendIndexInfoEvent(
          clientMetadata.sessionMetadata,
          clientMetadata.databaseId,
          getAnalyticsDataFromIndexInfo(reply as string[]),
        );
      }

      this.logger.debug(
        'Succeed to execute redis CLI command.',
        clientMetadata,
      );

      return {
        response: formatter.format(reply),
        status: CommandExecutionStatus.Success,
      };
    } catch (error) {
      this.logger.error(
        'Failed to execute redis CLI command.',
        error,
        clientMetadata,
      );

      if (
        error instanceof CommandParsingError ||
        error instanceof CommandNotSupportedError ||
        error?.name === 'ReplyError'
      ) {
        this.cliAnalyticsService.sendCommandErrorEvent(
          clientMetadata.sessionMetadata,
          clientMetadata.databaseId,
          error,
          {
            command,
            outputFormat,
          },
        );

        return { response: error.message, status: CommandExecutionStatus.Fail };
      }

      this.cliAnalyticsService.sendConnectionErrorEvent(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
        error,
        {
          command,
          outputFormat,
        },
      );

      if (
        error instanceof EncryptionServiceErrorException ||
        error instanceof ClientNotFoundErrorException
      ) {
        throw error;
      }

      return { response: error.message, status: CommandExecutionStatus.Fail };
    }
  }

  private checkUnsupportedCommands(commandLine: string) {
    const unsupportedCommand = getUnsupportedCommands().find((command) =>
      commandLine.toLowerCase().startsWith(command),
    );
    if (unsupportedCommand) {
      throw new CommandNotSupportedError(
        ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          unsupportedCommand.toUpperCase(),
        ),
      );
    }
  }
}
