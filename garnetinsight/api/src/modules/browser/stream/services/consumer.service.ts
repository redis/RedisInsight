import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import {
  BrowserToolCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  AckPendingEntriesDto,
  AckPendingEntriesResponse,
  ClaimPendingEntriesResponse,
  ClaimPendingEntryDto,
  ConsumerDto,
  DeleteConsumersDto,
  GetConsumersDto,
  GetPendingEntriesDto,
  PendingEntryDto,
} from 'src/modules/browser/stream/dto';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import { RedisClient } from 'src/modules/redis/client';
import { checkIfKeyNotExists } from 'src/modules/browser/utils';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

@Injectable()
export class ConsumerService {
  private logger = new Logger('ConsumerService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  /**
   * Get consumers list inside particular group
   * @param clientMetadata
   * @param dto
   */
  async getConsumers(
    clientMetadata: ClientMetadata,
    dto: GetConsumersDto,
  ): Promise<ConsumerDto[]> {
    try {
      this.logger.debug('Getting consumers list.', clientMetadata);
      const { keyName, groupName } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      return ConsumerService.formatReplyToDto(
        (await client.sendCommand([
          BrowserToolStreamCommands.XInfoConsumers,
          keyName,
          groupName,
        ])) as string[][],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Get consumers list inside particular group
   * @param clientMetadata
   * @param dto
   */
  async deleteConsumers(
    clientMetadata: ClientMetadata,
    dto: DeleteConsumersDto,
  ): Promise<void> {
    try {
      this.logger.debug('Deleting consumers from the group.', clientMetadata);
      const { keyName, groupName, consumerNames } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const toolCommands: Array<
        [
          toolCommand: BrowserToolCommands,
          ...args: Array<string | number | Buffer>,
        ]
      > = consumerNames.map((consumerName) => [
        BrowserToolStreamCommands.XGroupDelConsumer,
        keyName,
        groupName,
        consumerName,
      ]);

      const transactionResults = await client.sendPipeline(toolCommands);
      catchMultiTransactionError(transactionResults);

      return undefined;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Get list of pending entries info for particular consumer
   * @param clientMetadata
   * @param dto
   */
  async getPendingEntries(
    clientMetadata: ClientMetadata,
    dto: GetPendingEntriesDto,
  ): Promise<PendingEntryDto[]> {
    try {
      this.logger.debug('Getting pending entries list.', clientMetadata);
      const { keyName, groupName, start, end, count, consumerName } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      return ConsumerService.formatReplyToPendingEntriesDto(
        (await client.sendCommand([
          BrowserToolStreamCommands.XPending,
          keyName,
          groupName,
          start,
          end,
          count,
          consumerName,
        ])) as string[][],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Acknowledge pending entries
   * @param clientMetadata
   * @param dto
   */
  async ackPendingEntries(
    clientMetadata: ClientMetadata,
    dto: AckPendingEntriesDto,
  ): Promise<AckPendingEntriesResponse> {
    try {
      this.logger.debug('Acknowledging pending entries.', clientMetadata);
      const { keyName, groupName, entries } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const affected = (await client.sendCommand([
        BrowserToolStreamCommands.XAck,
        keyName,
        groupName,
        ...entries,
      ])) as number;

      this.logger.debug(
        'Successfully acknowledged pending entries.',
        clientMetadata,
      );
      return { affected };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Claim pending entries with additional parameters
   * @param clientMetadata
   * @param dto
   */
  async claimPendingEntries(
    clientMetadata: ClientMetadata,
    dto: ClaimPendingEntryDto,
  ): Promise<ClaimPendingEntriesResponse> {
    try {
      this.logger.debug('Claiming pending entries.', clientMetadata);
      const {
        keyName,
        groupName,
        consumerName,
        minIdleTime,
        entries,
        idle,
        time,
        retryCount,
        force,
      } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const args = [keyName, groupName, consumerName, minIdleTime, ...entries];

      if (idle !== undefined) {
        args.push('idle', idle);
      } else if (time !== undefined) {
        args.push('time', time);
      }

      if (retryCount !== undefined) {
        args.push('retrycount', retryCount);
      }

      if (force) {
        args.push('force');
      }

      // Return just an array of IDs of messages successfully claimed, without returning the actual message.
      args.push('justid');

      const affected = (await client.sendCommand(
        [BrowserToolStreamCommands.XClaim, ...args],
        { replyEncoding: 'utf8' },
      )) as string[];

      this.logger.debug(
        'Successfully claimed pending entries.',
        clientMetadata,
      );
      return { affected };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Converts RESP response from Redis
   * [
   *  ['name', 'consumer-1', 'pending', 0, 'idle', 258741],
   *  ['name', 'consumer-2', 'pending', 0, 'idle', 258741],
   *  ...
   * ]
   *
   * to DTO
   *
   * [
   *  {
   *    name: 'consumer-1',
   *    pending: 0,
   *    idle: 258741,
   *  },
   *  {
   *    name: 'consumer-2',
   *    pending: 0,
   *    idle: 258741,
   *  },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToDto(reply: Array<Array<string | number>>): ConsumerDto[] {
    return reply.map(ConsumerService.formatArrayToDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToDto(entry: Array<string | number>): ConsumerDto {
    if (!entry?.length) {
      return null;
    }

    const [, name, , pending, , idle] = entry;

    return plainToInstance(ConsumerDto, {
      name,
      pending,
      idle,
    });
  }

  /**
   * Converts RESP response from Redis
   * [
   *  ['1567352639-0', 'consumer-1', 258741, 2],
   *  ...
   * ]
   *
   * to DTO
   *
   * [
   *  {
   *    id: '1567352639-0',
   *    name: 'consumer-1',
   *    idle: 258741,
   *    delivered: 2,
   *  },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToPendingEntriesDto(
    reply: Array<Array<string | number>>,
  ): PendingEntryDto[] {
    return reply.map(ConsumerService.formatArrayToPendingEntryDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToPendingEntryDto(
    entry: Array<string | number>,
  ): PendingEntryDto {
    if (!entry?.length) {
      return null;
    }

    return plainToInstance(PendingEntryDto, {
      id: `${entry[0]}`,
      consumerName: entry[1],
      idle: +entry[2],
      delivered: +entry[3],
    });
  }
}
