import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisString } from 'src/common/constants';
import { ClientMetadata } from 'src/common/models';
import { ReplyError } from 'src/models';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  RedisClientCommand,
  RedisClientCommandReply,
} from 'src/modules/redis/client';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';
import {
  AddArrayElementsDto,
  ArrayElementResponse,
  ArrayInfoResponse,
  ArraySearchPredicate,
  ARRAY_MAX_INDEX,
  CreateArrayWithExpireDto,
  DeleteArrayElementsDto,
  DeleteArrayElementsResponse,
  DeleteArrayRangesDto,
  GetArrayElementDto,
  GetArrayElementResponse,
  GetArrayElementsDto,
  GetArrayElementsResponse,
  SearchArrayElementsDto,
  SetArrayElementDto,
  SetArrayElementResponse,
} from './dto';

@Injectable()
export class ArrayService {
  private readonly logger = new Logger('ArrayService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  public async createArray(
    clientMetadata: ClientMetadata,
    dto: CreateArrayWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating Array data type.', clientMetadata);
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(dto.keyName, client);

      const commands: RedisClientCommand[] = [this.buildArmSetCommand(dto)];
      if (dto.expire) {
        commands.push([
          BrowserToolKeysCommands.Expire,
          dto.keyName,
          dto.expire,
        ]);
      }

      const transactionResults = await client.sendPipeline(commands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug('Succeed to create Array data type.', clientMetadata);
    } catch (error) {
      this.logger.error(
        'Failed to create Array data type.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async addElements(
    clientMetadata: ClientMetadata,
    dto: AddArrayElementsDto,
  ): Promise<void> {
    try {
      this.logger.debug(
        'Adding elements to the Array data type.',
        clientMetadata,
      );
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(dto.keyName, client);
      await client.sendCommand(this.buildArmSetCommand(dto));

      this.logger.debug(
        'Succeed to add elements to Array data type.',
        clientMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to add elements to Array data type.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async getElements(
    clientMetadata: ClientMetadata,
    dto: GetArrayElementsDto,
  ): Promise<GetArrayElementsResponse> {
    try {
      this.logger.debug(
        'Getting elements of the Array data type.',
        clientMetadata,
      );
      const { keyName, start = '0', end = ARRAY_MAX_INDEX, count } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const [[, total = 0], [, logicalLength = '0'], [, rawElements = []]] =
        await client.sendPipeline([
          [BrowserToolArrayCommands.ARCount, keyName],
          [BrowserToolArrayCommands.ARLen, keyName],
          [
            BrowserToolArrayCommands.ARScan,
            keyName,
            start,
            end,
            'LIMIT',
            count,
          ],
        ]);

      const elements = this.parseElementPairs(rawElements);

      return plainToInstance(GetArrayElementsResponse, {
        keyName,
        total: this.toNumber(total),
        logicalLength: this.normalizeIntegerReply(logicalLength),
        nextIndex: this.getNextIndex(elements, count),
        isPaginationSupported: true,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get elements of the Array data type.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async getElement(
    clientMetadata: ClientMetadata,
    dto: GetArrayElementDto,
  ): Promise<GetArrayElementResponse> {
    try {
      this.logger.debug('Getting Array element by index.', clientMetadata);
      const { keyName, index } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const value = await client.sendCommand([
        BrowserToolArrayCommands.ARGet,
        keyName,
        index,
      ]);

      if (value === null) {
        throw new NotFoundException(ERROR_MESSAGES.INDEX_OUT_OF_RANGE());
      }

      return plainToInstance(GetArrayElementResponse, {
        keyName,
        index,
        value,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get Array element by index.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async setElement(
    clientMetadata: ClientMetadata,
    dto: SetArrayElementDto,
  ): Promise<SetArrayElementResponse> {
    try {
      this.logger.debug('Setting Array element by index.', clientMetadata);
      const { keyName, index, value } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);
      await client.sendCommand([
        BrowserToolArrayCommands.ARSet,
        keyName,
        index,
        value,
      ]);

      return plainToInstance(SetArrayElementResponse, { index, value });
    } catch (error) {
      this.logger.error(
        'Failed to set Array element by index.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async deleteElements(
    clientMetadata: ClientMetadata,
    dto: DeleteArrayElementsDto,
  ): Promise<DeleteArrayElementsResponse> {
    try {
      this.logger.debug('Deleting Array elements.', clientMetadata);
      const { keyName, indexes } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);
      const affected = await client.sendCommand([
        BrowserToolArrayCommands.ARDel,
        keyName,
        ...indexes,
      ]);

      return { affected: this.toNumber(affected) };
    } catch (error) {
      this.logger.error(
        'Failed to delete Array elements.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async deleteRanges(
    clientMetadata: ClientMetadata,
    dto: DeleteArrayRangesDto,
  ): Promise<DeleteArrayElementsResponse> {
    try {
      this.logger.debug('Deleting Array ranges.', clientMetadata);
      const { keyName, ranges } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);
      const affected = await client.sendCommand([
        BrowserToolArrayCommands.ARDelRange,
        keyName,
        ...ranges.flatMap(({ start, end }) => [start, end]),
      ]);

      return { affected: this.toNumber(affected) };
    } catch (error) {
      this.logger.error(
        'Failed to delete Array ranges.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async searchElements(
    clientMetadata: ClientMetadata,
    dto: SearchArrayElementsDto,
  ): Promise<GetArrayElementsResponse> {
    try {
      this.logger.debug('Searching Array elements.', clientMetadata);
      const {
        keyName,
        start = '-',
        end = '+',
        predicate = ArraySearchPredicate.Match,
        query,
        noCase,
        count,
      } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const command: RedisClientCommand = [
        BrowserToolArrayCommands.ARGrep,
        keyName,
        start,
        end,
        predicate,
        query,
        'WITHVALUES',
        'LIMIT',
        count,
      ];

      if (noCase) {
        command.push('NOCASE');
      }

      const [[, total = 0], [, logicalLength = '0'], [, rawElements = []]] =
        await client.sendPipeline([
          [BrowserToolArrayCommands.ARCount, keyName],
          [BrowserToolArrayCommands.ARLen, keyName],
          command,
        ]);

      const elements = this.parseElementPairs(rawElements);

      return plainToInstance(GetArrayElementsResponse, {
        keyName,
        total: this.toNumber(total),
        logicalLength: this.normalizeIntegerReply(logicalLength),
        nextIndex: this.getNextIndex(elements, count),
        isPaginationSupported: true,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to search Array elements.',
        error,
        clientMetadata,
      );
      this.throwKnownError(error);
    }
  }

  public async getInfo(
    clientMetadata: ClientMetadata,
    keyName: RedisString,
  ): Promise<ArrayInfoResponse> {
    try {
      this.logger.debug('Getting Array metadata.', clientMetadata);
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);
      const info = await client.sendCommand([
        BrowserToolArrayCommands.ARInfo,
        keyName,
      ]);

      return plainToInstance(ArrayInfoResponse, {
        keyName,
        ...this.parseArrayInfo(info),
      });
    } catch (error) {
      this.logger.error('Failed to get Array metadata.', error, clientMetadata);
      this.throwKnownError(error);
    }
  }

  private buildArmSetCommand(dto: AddArrayElementsDto): RedisClientCommand {
    return [
      BrowserToolArrayCommands.ARMSet,
      dto.keyName,
      ...dto.elements.flatMap(({ index, value }) => [index, value]),
    ];
  }

  private parseElementPairs(
    reply: RedisClientCommandReply,
  ): ArrayElementResponse[] {
    if (!Array.isArray(reply)) {
      return [];
    }

    const elements: ArrayElementResponse[] = [];
    for (let i = 0; i < reply.length - 1; i += 2) {
      elements.push(
        plainToInstance(ArrayElementResponse, {
          index: this.normalizeIntegerReply(reply[i]),
          value: reply[i + 1] as RedisString,
        }),
      );
    }

    return elements;
  }

  private parseArrayInfo(
    reply: RedisClientCommandReply,
  ): Partial<ArrayInfoResponse> {
    const info: Record<string, RedisClientCommandReply> = {};

    if (Array.isArray(reply)) {
      for (let i = 0; i < reply.length - 1; i += 2) {
        info[String(reply[i])] = reply[i + 1];
      }
    } else if (reply && typeof reply === 'object') {
      Object.assign(info, reply);
    }

    return {
      count: this.toNumber(info.count),
      len: this.normalizeIntegerReply(info.len),
      nextInsertIndex: this.normalizeIntegerReply(info['next-insert-index']),
      slices: this.toOptionalNumber(info.slices),
      directorySize: this.toOptionalNumber(info['directory-size']),
      superDirEntries: this.toOptionalNumber(info['super-dir-entries']),
      sliceSize: this.toOptionalNumber(info['slice-size']),
    };
  }

  private getNextIndex(
    elements: ArrayElementResponse[],
    count: number,
  ): string | undefined {
    if (elements.length < count || elements.length === 0) {
      return undefined;
    }

    return this.incrementIndex(elements[elements.length - 1].index);
  }

  private incrementIndex(index: string): string | undefined {
    if (index === ARRAY_MAX_INDEX) {
      return undefined;
    }

    let carry = 1;
    const digits = index.split('');
    for (let i = digits.length - 1; i >= 0 && carry; i -= 1) {
      const next = Number(digits[i]) + carry;
      digits[i] = String(next % 10);
      carry = next > 9 ? 1 : 0;
    }

    return carry ? `1${digits.join('')}` : digits.join('');
  }

  private normalizeIntegerReply(value: RedisClientCommandReply): string {
    if (Buffer.isBuffer(value)) {
      return value.toString();
    }

    if (value === null || value === undefined) {
      return '0';
    }

    return String(value);
  }

  private toNumber(value: RedisClientCommandReply): number {
    return Number(this.normalizeIntegerReply(value));
  }

  private toOptionalNumber(value: RedisClientCommandReply): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return this.toNumber(value);
  }

  private throwKnownError(error: Error): never {
    if (error?.message?.includes(RedisErrorCodes.WrongType)) {
      throw new BadRequestException(error.message);
    }

    throw catchAclError(error as ReplyError);
  }
}
