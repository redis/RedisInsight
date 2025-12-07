import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RedisErrorCodes } from 'src/constants';
import {
  catchAclError,
  catchMultiTransactionError,
  isTruncatedString,
} from 'src/utils';
import {
  BrowserToolCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { KeyDto } from 'src/modules/browser/keys/dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  ConsumerGroupDto,
  CreateConsumerGroupsDto,
  DeleteConsumerGroupsDto,
  DeleteConsumerGroupsResponse,
  UpdateConsumerGroupDto,
} from 'src/modules/browser/stream/dto';
import { plainToInstance } from 'class-transformer';
import { RedisString } from 'src/common/constants';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import { checkIfKeyNotExists } from 'src/modules/browser/utils';

@Injectable()
export class ConsumerGroupService {
  private logger = new Logger('ConsumerGroupService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  /**
   * Get consumer groups list for particular stream
   * In addition fetch pending messages info for each group
   * !May be slow on huge streams as 'XPENDING' command tagged with as @slow
   * @param clientMetadata
   * @param dto
   */
  async getGroups(
    clientMetadata: ClientMetadata,
    dto: KeyDto,
  ): Promise<ConsumerGroupDto[]> {
    try {
      this.logger.debug('Getting consumer groups list.', clientMetadata);
      const { keyName } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const groups = ConsumerGroupService.formatReplyToDto(
        (await client.sendCommand([
          BrowserToolStreamCommands.XInfoGroups,
          keyName,
        ])) as string[][],
      );

      return await Promise.all(
        groups.map((group) => this.getGroupInfo(client, dto, group)),
      );
    } catch (error) {
      this.logger.error(
        'Error getting consumer groups list',
        error,
        clientMetadata,
      );
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
   * Get consumer group pending info using 'XPENDING' command
   * @param client
   * @param dto
   * @param group
   */
  async getGroupInfo(
    client: RedisClient,
    dto: KeyDto,
    group: ConsumerGroupDto,
  ): Promise<ConsumerGroupDto> {
    let info = ['n/a', 'n/a', 'n/a'];

    if (!isTruncatedString(group.name)) {
      info = (await client.sendCommand([
        BrowserToolStreamCommands.XPending,
        dto.keyName,
        group.name,
      ])) as string[];
    }

    return plainToInstance(ConsumerGroupDto, {
      ...group,
      smallestPendingId: info?.[1] || null,
      greatestPendingId: info?.[2] || null,
    });
  }

  /**
   * Create consumer group(s)
   * @param clientMetadata
   * @param dto
   */
  async createGroups(
    clientMetadata: ClientMetadata,
    dto: CreateConsumerGroupsDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating consumer groups.', clientMetadata);
      const { keyName, consumerGroups } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const toolCommands: Array<
        [
          toolCommand: BrowserToolCommands,
          ...args: Array<string | number | Buffer>,
        ]
      > = consumerGroups.map((group) => [
        BrowserToolStreamCommands.XGroupCreate,
        keyName,
        group.name,
        group.lastDeliveredId,
      ]);

      const transactionResults = await client.sendPipeline(toolCommands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug('Stream consumer group(s) created.', clientMetadata);
      return undefined;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      if (error?.message.includes(RedisErrorCodes.BusyGroup)) {
        throw new ConflictException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Updates last delivered id for Consumer Group
   * @param clientMetadata
   * @param dto
   */
  async updateGroup(
    clientMetadata: ClientMetadata,
    dto: UpdateConsumerGroupDto,
  ): Promise<void> {
    try {
      this.logger.debug('Updating consumer group.', clientMetadata);
      const { keyName, name, lastDeliveredId } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      await client.sendCommand([
        BrowserToolStreamCommands.XGroupSetId,
        keyName,
        name,
        lastDeliveredId,
      ]);

      this.logger.debug('Consumer group was updated.', clientMetadata);
      return undefined;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      if (error?.message.includes(RedisErrorCodes.NoGroup)) {
        throw new NotFoundException(ERROR_MESSAGES.CONSUMER_GROUP_NOT_FOUND);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Delete consumer groups in batch
   * @param clientMetadata
   * @param dto
   */
  async deleteGroup(
    clientMetadata: ClientMetadata,
    dto: DeleteConsumerGroupsDto,
  ): Promise<DeleteConsumerGroupsResponse> {
    try {
      this.logger.debug('Deleting consumer group.', clientMetadata);
      const { keyName, consumerGroups } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const toolCommands: Array<
        [
          toolCommand: BrowserToolCommands,
          ...args: Array<string | number | Buffer>,
        ]
      > = consumerGroups.map((group) => [
        BrowserToolStreamCommands.XGroupDestroy,
        keyName,
        group,
      ]);

      const transactionResults = await client.sendPipeline(toolCommands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug(
        'Consumer group(s) successfully deleted.',
        clientMetadata,
      );
      return { affected: toolCommands.length };
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
   * Converts RESP response from Redis
   * [
   *  ['name', 'g1', 'consumers', 0, 'pending', 0, 'last-delivered-id', '1653034260278-0'],
   *  ['name', 'g2', 'consumers', 0, 'pending', 0, 'last-delivered-id', '1653034260278-0'],
   *  ...
   * ]
   *
   * to DTO
   *
   * [
   *  {
   *    name: 'g1',
   *    consumers: 0,
   *    pending: 0,
   *    lastDeliveredId: '1653034260278-0'
   *  },
   *  {
   *    name: 'g2',
   *    consumers: 0,
   *    pending: 0,
   *    lastDeliveredId: '1653034260278-0'
   *  },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToDto(
    reply: Array<Array<string | number>>,
  ): ConsumerGroupDto[] {
    return reply.map(ConsumerGroupService.formatArrayToDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToDto(
    entry: Array<RedisString | number>,
  ): ConsumerGroupDto {
    if (!entry?.length) {
      return null;
    }

    const [, name, , consumers, , pending, , lastDeliveredId] = entry;

    return plainToInstance(ConsumerGroupDto, {
      name,
      consumers,
      pending,
      lastDeliveredId: lastDeliveredId.toString(),
      smallestPendingId: null,
      greatestPendingId: null,
    });
  }
}
