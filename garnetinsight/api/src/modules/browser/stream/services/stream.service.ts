import { chunk, flatMap, map } from 'lodash';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { SortOrder } from 'src/constants/sort';
import {
  BrowserToolCommands,
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  AddStreamEntriesDto,
  AddStreamEntriesResponse,
  CreateStreamDto,
  GetStreamEntriesDto,
  GetStreamEntriesResponse,
  DeleteStreamEntriesDto,
  DeleteStreamEntriesResponse,
  StreamEntryDto,
  StreamEntryFieldDto,
} from 'src/modules/browser/stream/dto';
import { RedisErrorCodes } from 'src/constants';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';

@Injectable()
export class StreamService {
  private logger = new Logger('StreamService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  /**
   * Get stream entries
   * Could be used for lazy loading with "start", "end" and "count" parameters
   * Could be sorted using "sortOrder" in ASC and DESC order
   *
   * @param clientMetadata
   * @param dto
   */
  public async getEntries(
    clientMetadata: ClientMetadata,
    dto: GetStreamEntriesDto,
  ): Promise<GetStreamEntriesResponse> {
    try {
      this.logger.debug(
        'Getting entries of the Stream data type stored at key.',
        clientMetadata,
      );
      const { keyName, sortOrder } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const info = convertArrayReplyToObject(
        (await client.sendCommand([
          BrowserToolStreamCommands.XInfoStream,
          keyName,
        ])) as string[],
      );

      let entries = [];
      if (sortOrder && sortOrder === SortOrder.Asc) {
        entries = await this.getRange(client, dto);
      } else {
        entries = await this.getRevRange(client, dto);
      }

      this.logger.debug(
        'Succeed to get entries from the stream.',
        clientMetadata,
      );

      return plainToInstance(GetStreamEntriesResponse, {
        keyName,
        total: info['length'],
        lastGeneratedId: info['last-generated-id'].toString(),
        firstEntry: StreamService.formatArrayToDto(info['first-entry']),
        lastEntry: StreamService.formatArrayToDto(info['last-entry']),
        entries,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get entries from the stream.',
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
   * Return specified number of entries in the time range in ASC order
   *
   * @param client
   * @param dto
   */
  public async getRange(
    client: RedisClient,
    dto: GetStreamEntriesDto,
  ): Promise<StreamEntryDto[]> {
    const { keyName, start, end, count } = dto;

    const execResult = (await client.sendCommand([
      BrowserToolStreamCommands.XRange,
      keyName,
      start,
      end,
      'COUNT',
      count,
    ])) as string[];

    return StreamService.formatReplyToDto(execResult);
  }

  /**
   * Return specified number of entries in the time range in DESC order
   *
   * @param client
   * @param dto
   */
  public async getRevRange(
    client: RedisClient,
    dto: GetStreamEntriesDto,
  ): Promise<StreamEntryDto[]> {
    const { keyName, start, end, count } = dto;

    const execResult = (await client.sendCommand([
      BrowserToolStreamCommands.XRevRange,
      keyName,
      end,
      start,
      'COUNT',
      count,
    ])) as string[];

    return StreamService.formatReplyToDto(execResult);
  }

  /**
   * Create streams with\without expiration time and add multiple entries in a transaction
   * @param clientMetadata
   * @param dto
   */
  public async createStream(
    clientMetadata: ClientMetadata,
    dto: CreateStreamDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating stream data type.', clientMetadata);
      const { keyName, entries } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      const entriesArray = entries.map((entry) => [
        entry.id,
        ...flatMap(map(entry.fields, (field) => [field.name, field.value])),
      ]);

      const toolCommands: Array<
        [
          toolCommand: BrowserToolCommands,
          ...args: Array<string | number | Buffer>,
        ]
      > = entriesArray.map((entry) => [
        BrowserToolStreamCommands.XAdd,
        keyName,
        ...entry,
      ]);

      if (dto.expire) {
        toolCommands.push([
          BrowserToolKeysCommands.Expire,
          keyName,
          dto.expire,
        ]);
      }

      const transactionResults = await client.sendPipeline(toolCommands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug('Succeed to create stream.', clientMetadata);
      return undefined;
    } catch (error) {
      this.logger.error('Failed to create stream.', error, clientMetadata);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error?.message.includes(RedisErrorCodes.WrongType) ||
        error?.message.includes('ID specified in XADD is equal or smaller')
      ) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Add entries to the existing stream and return entries IDs list
   * @param clientMetadata
   * @param dto
   */
  public async addEntries(
    clientMetadata: ClientMetadata,
    dto: AddStreamEntriesDto,
  ): Promise<AddStreamEntriesResponse> {
    try {
      this.logger.debug('Adding entries to stream.', clientMetadata);
      const { keyName, entries } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const entriesArray = entries.map((entry) => [
        entry.id,
        ...flatMap(map(entry.fields, (field) => [field.name, field.value])),
      ]);

      const toolCommands: Array<
        [
          toolCommand: BrowserToolCommands,
          ...args: Array<string | number | Buffer>,
        ]
      > = entriesArray.map((entry) => [
        BrowserToolStreamCommands.XAdd,
        keyName,
        ...entry,
      ]);

      const transactionResults = await client.sendPipeline(toolCommands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug(
        'Succeed to add entries to the stream.',
        clientMetadata,
      );
      return plainToInstance(AddStreamEntriesResponse, {
        keyName,
        entries: transactionResults.map((entryResult) =>
          entryResult[1].toString(),
        ),
      });
    } catch (error) {
      this.logger.error(
        'Failed to add entries to the stream.',
        error,
        clientMetadata,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error?.message.includes(RedisErrorCodes.WrongType) ||
        error?.message.includes('ID specified in XADD is equal or smaller')
      ) {
        throw new BadRequestException(error.message);
      }

      throw catchAclError(error);
    }
  }

  /**
   * Delete entries from the existing stream and return number of deleted entries
   * @param clientMetadata
   * @param dto
   */
  public async deleteEntries(
    clientMetadata: ClientMetadata,
    dto: DeleteStreamEntriesDto,
  ): Promise<DeleteStreamEntriesResponse> {
    try {
      this.logger.debug(
        'Deleting entries from the Stream data type.',
        clientMetadata,
      );
      const { keyName, entries } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const result = (await client.sendCommand([
        BrowserToolStreamCommands.XDel,
        keyName,
        ...entries,
      ])) as number;

      this.logger.debug(
        'Succeed to delete entries from the Stream data type.',
        clientMetadata,
      );
      return { affected: result };
    } catch (error) {
      this.logger.error(
        'Failed to delete entries from the Stream data type.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  /**
   * Converts RESP response from Redis
   * [
   *   [ '1650985323741-0', [ 'field', 'value' ] ],
   *   [ '1650985351882-0', [ 'field', 'value2' ] ],
   *   ...
   * ]
   *
   * to DTO
   *
   * [
   *   { id: '1650985323741-0', fields: [ ['field', 'value'] ] },
   *   { id: '1650985351882-0', fields: [ ['field', 'value2 ] },
   *   ...
   * ]
   * @param reply
   */
  static formatReplyToDto(reply: Array<string | string[]>): StreamEntryDto[] {
    return reply.map(StreamService.formatArrayToDto);
  }

  /**
   * Format single reply entry to DTO
   * @param entry
   */
  static formatArrayToDto(entry: Array<string>): StreamEntryDto {
    if (!entry?.length) {
      return null;
    }

    return {
      id: entry[0].toString(),
      fields: chunk(entry[1] || [], 2).map((field) =>
        plainToInstance(StreamEntryFieldDto, {
          name: field[0],
          value: field[1],
        }),
      ),
    };
  }
}
