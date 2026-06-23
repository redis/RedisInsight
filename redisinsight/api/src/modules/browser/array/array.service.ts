import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RedisErrorCodes } from 'src/constants';
import { RedisString } from 'src/common/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  RedisClient,
  RedisClientCommand,
  RedisClientCommandReply,
} from 'src/modules/redis/client';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { ARRAY_RANGE_MAX_ELEMENTS } from 'src/modules/browser/array/constants';
import {
  toIndexString,
  toRequiredIndexString,
} from 'src/modules/browser/array/utils';
import {
  AggregateArrayDto,
  AggregateArrayResponse,
  ArrayAggregateOperation,
  ArrayCreationMode,
  ArrayElement,
  ArraySearchElement,
  CreateArrayWithExpireDto,
  GetArrayCountResponse,
  GetArrayElementDto,
  GetArrayElementResponse,
  GetArrayLengthResponse,
  GetArrayMultiElementsDto,
  GetArrayMultiElementsResponse,
  GetArrayNextIndexResponse,
  GetArrayRangeDto,
  GetArrayRangeResponse,
  GetArrayScanDto,
  GetArrayScanResponse,
  GetArraySearchDto,
  GetArraySearchResponse,
} from 'src/modules/browser/array/dto';

@Injectable()
export class ArrayService {
  private logger = new Logger('ArrayService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  public async createArray(
    clientMetadata: ClientMetadata,
    dto: CreateArrayWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating array data type.', clientMetadata);
      const { keyName, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      if (expire) {
        await this.createArrayWithExpiration(client, dto);
      } else {
        await this.createSimpleArray(client, dto);
      }

      this.logger.debug('Succeed to create array data type.', clientMetadata);
    } catch (error) {
      this.logger.error(
        'Failed to create array data type.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }

  private assertValidRange(start: string, end: string): void {
    const startBig = BigInt(start);
    const endBig = BigInt(end);
    const span =
      (startBig > endBig ? startBig - endBig : endBig - startBig) + BigInt(1);

    if (span > BigInt(ARRAY_RANGE_MAX_ELEMENTS)) {
      throw new BadRequestException(
        ERROR_MESSAGES.ARRAY_RANGE_TOO_LARGE(ARRAY_RANGE_MAX_ELEMENTS),
      );
    }
  }

  public async getRange(
    clientMetadata: ClientMetadata,
    dto: GetArrayRangeDto,
  ): Promise<GetArrayRangeResponse> {
    try {
      this.logger.debug('Getting array range.', clientMetadata);
      const { keyName, start, end } = dto;

      this.assertValidRange(start, end);

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const elements = (await client.sendCommand([
        BrowserToolArrayCommands.ArGetRange,
        keyName,
        start,
        end,
      ])) as (Buffer | string | null)[];

      this.logger.debug('Succeed to get array range.', clientMetadata);
      return plainToInstance(GetArrayRangeResponse, { keyName, elements });
    } catch (error) {
      this.logger.error('Failed to get array range.', error, clientMetadata);
      if (error instanceof BadRequestException) throw error;
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async createSimpleArray(
    client: RedisClient,
    dto: CreateArrayWithExpireDto,
  ): Promise<void> {
    await client.sendCommand(this.buildCreateCommand(dto));
  }

  public async createArrayWithExpiration(
    client: RedisClient,
    dto: CreateArrayWithExpireDto,
  ): Promise<void> {
    const { keyName, expire } = dto;
    const transactionResults = await client.sendPipeline([
      this.buildCreateCommand(dto),
      [BrowserToolKeysCommands.Expire, keyName, expire] as RedisClientCommand,
    ]);
    catchMultiTransactionError(
      transactionResults as [Error, RedisClientCommandReply][],
    );
  }

  private buildCreateCommand(
    dto: CreateArrayWithExpireDto,
  ): RedisClientCommand {
    // DTO validation guarantees startIndex + values in contiguous mode
    // and elements in sparse mode; defaults only satisfy strict null checks.
    const { keyName, mode, startIndex = '0', values = [], elements = [] } = dto;

    if (mode === ArrayCreationMode.Contiguous) {
      return [BrowserToolArrayCommands.ArSet, keyName, startIndex, ...values];
    }

    return [
      BrowserToolArrayCommands.ArMSet,
      keyName,
      ...elements.flatMap(({ index, value }) => [index, value]),
    ];
  }

  public async scan(
    clientMetadata: ClientMetadata,
    dto: GetArrayScanDto,
  ): Promise<GetArrayScanResponse> {
    try {
      this.logger.debug('Scanning array range.', clientMetadata);
      const { keyName, start, end, limit } = dto;

      // No |end - start| span cap here (unlike ARGETRANGE): ARSCAN skips
      // empty slots server-side and the sparse-array use case routinely
      // spans far more indexes than it returns. LIMIT (capped on the DTO)
      // is the natural backpressure on result-set size.
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const baseArgs = [
        BrowserToolArrayCommands.ArScan as string,
        keyName,
        start,
        end,
      ] as const;
      // typeof 'number' so an explicit JSON null is treated as omitted.
      const hasLimit = typeof limit === 'number';
      const reply = (await client.sendCommand(
        hasLimit ? [...baseArgs, 'LIMIT', limit] : [...baseArgs],
      )) as unknown[];

      // ARSCAN wire shape varies by Redis version / client: Redis 8.8
      // returns nested [[index, value], ...] entries, while some earlier
      // builds surface a flat [index, value, index, value, ...] reply.
      // Detect by sniffing the first element and normalize both. Pairs
      // with a nil half are dropped (populated-only contract).
      const elements: ArrayElement[] = [];
      if (Array.isArray(reply[0])) {
        for (const entry of reply as unknown[][]) {
          if (!entry || entry.length < 2) continue;
          const rawIndex = entry[0];
          const value = entry[1];
          if (rawIndex == null || value == null) continue;
          elements.push({
            index: toRequiredIndexString(rawIndex),
            value: value as Buffer | string,
          });
        }
      } else {
        for (let i = 0; i < reply.length; i += 2) {
          const rawIndex = reply[i];
          const value = reply[i + 1];
          if (rawIndex == null || value == null) continue;
          elements.push({
            index: toRequiredIndexString(rawIndex),
            value: value as Buffer | string,
          });
        }
      }

      this.logger.debug('Succeed to scan array range.', clientMetadata);
      return plainToInstance(GetArrayScanResponse, { keyName, elements });
    } catch (error) {
      this.logger.error('Failed to scan array range.', error, clientMetadata);
      if (error instanceof BadRequestException) throw error;
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async search(
    clientMetadata: ClientMetadata,
    dto: GetArraySearchDto,
  ): Promise<GetArraySearchResponse> {
    try {
      this.logger.debug('Searching array.', clientMetadata);
      const { keyName, predicates, combinator, start, end, nocase, limit } =
        dto;
      // `?? true` (not a destructuring default) so an explicit null body value
      // also falls back — @IsOptional() lets null through, and a default only
      // fills undefined.
      const withValues = dto.withValues ?? true;

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      // ARGREP key start end <CRITERIA value>... [AND|OR] [NOCASE] [WITHVALUES] [LIMIT n]
      // Omitted bounds map to the `-` (first) / `+` (last) shorthands.
      const args: RedisClientCommand = [
        BrowserToolArrayCommands.ArGrep,
        keyName,
        start ?? '-',
        end ?? '+',
        ...predicates.flatMap((predicate) => [
          predicate.criteria,
          predicate.value,
        ]),
      ];
      // The connective only applies with 2+ predicates; when omitted we send
      // nothing so the server applies its own default (OR).
      if (combinator && predicates.length > 1) args.push(combinator);
      if (nocase) args.push('NOCASE');
      if (withValues) args.push('WITHVALUES');
      if (typeof limit === 'number') args.push('LIMIT', limit);

      const reply = (await client.sendCommand(args)) as unknown[];

      // WITHVALUES wire shape varies: Redis 8.8 returns nested
      // [[index, value], ...] entries; some builds surface a flat
      // [index, value, index, value, ...] reply. Without WITHVALUES the reply
      // is a flat list of indexes. Detect by sniffing the first element.
      const elements: ArraySearchElement[] = [];
      if (Array.isArray(reply[0])) {
        for (const entry of reply as unknown[][]) {
          const rawIndex = entry?.[0];
          if (rawIndex == null) continue;
          elements.push({
            index: toRequiredIndexString(rawIndex),
            value: (entry[1] ?? null) as RedisString | null,
          });
        }
      } else if (withValues) {
        for (let i = 0; i < reply.length; i += 2) {
          const rawIndex = reply[i];
          if (rawIndex == null) continue;
          elements.push({
            index: toRequiredIndexString(rawIndex),
            value: (reply[i + 1] ?? null) as RedisString | null,
          });
        }
      } else {
        for (const rawIndex of reply) {
          if (rawIndex == null) continue;
          elements.push({
            index: toRequiredIndexString(rawIndex),
            value: null,
          });
        }
      }

      this.logger.debug('Succeed to search array.', clientMetadata);
      return plainToInstance(GetArraySearchResponse, { keyName, elements });
    } catch (error) {
      this.logger.error('Failed to search array.', error, clientMetadata);
      // A bad RE predicate is client input, not a server fault.
      if (
        error?.message?.includes(RedisErrorCodes.WrongType) ||
        error?.message?.includes(RedisErrorCodes.RegexError)
      ) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getLength(
    clientMetadata: ClientMetadata,
    dto: KeyDto,
  ): Promise<GetArrayLengthResponse> {
    try {
      this.logger.debug('Getting array length.', clientMetadata);
      const { keyName } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const reply = await client.sendCommand([
        BrowserToolArrayCommands.ArLen,
        keyName,
      ]);

      this.logger.debug('Succeed to get array length.', clientMetadata);
      return plainToInstance(GetArrayLengthResponse, {
        keyName,
        length: toRequiredIndexString(reply),
      });
    } catch (error) {
      this.logger.error('Failed to get array length.', error, clientMetadata);
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getCount(
    clientMetadata: ClientMetadata,
    dto: KeyDto,
  ): Promise<GetArrayCountResponse> {
    try {
      this.logger.debug('Getting array count.', clientMetadata);
      const { keyName } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const reply = await client.sendCommand([
        BrowserToolArrayCommands.ArCount,
        keyName,
      ]);

      this.logger.debug('Succeed to get array count.', clientMetadata);
      return plainToInstance(GetArrayCountResponse, {
        keyName,
        count: toRequiredIndexString(reply),
      });
    } catch (error) {
      this.logger.error('Failed to get array count.', error, clientMetadata);
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getNextIndex(
    clientMetadata: ClientMetadata,
    dto: KeyDto,
  ): Promise<GetArrayNextIndexResponse> {
    try {
      this.logger.debug('Getting array next index.', clientMetadata);
      const { keyName } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const reply = await client.sendCommand([
        BrowserToolArrayCommands.ArNext,
        keyName,
      ]);

      this.logger.debug('Succeed to get array next index.', clientMetadata);
      return plainToInstance(GetArrayNextIndexResponse, {
        keyName,
        index: toIndexString(reply),
      });
    } catch (error) {
      this.logger.error(
        'Failed to get array next index.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getElement(
    clientMetadata: ClientMetadata,
    dto: GetArrayElementDto,
  ): Promise<GetArrayElementResponse> {
    try {
      this.logger.debug('Getting array element.', clientMetadata);
      const { keyName, index } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const value = (await client.sendCommand([
        BrowserToolArrayCommands.ArGet,
        keyName,
        index,
      ])) as Buffer | string | null;

      this.logger.debug('Succeed to get array element.', clientMetadata);
      return plainToInstance(GetArrayElementResponse, { keyName, value });
    } catch (error) {
      this.logger.error('Failed to get array element.', error, clientMetadata);
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async aggregate(
    clientMetadata: ClientMetadata,
    dto: AggregateArrayDto,
  ): Promise<AggregateArrayResponse> {
    try {
      this.logger.debug('Aggregating array range.', clientMetadata);
      const { keyName, start, end, operation, value } = dto;

      // Same span cap as ARGETRANGE: AROP scans the dense [start..end] window.
      this.assertValidRange(start, end);

      // MATCH requires a comparison value, but empty strings / empty Buffers
      // are valid — Redis stores zero-length bulk strings as real elements,
      // and the create DTO allows them. Only an omitted value is rejected.
      if (
        operation === ArrayAggregateOperation.Match &&
        (value === undefined || value === null)
      ) {
        throw new BadRequestException(
          ERROR_MESSAGES.ARRAY_MATCH_VALUE_REQUIRED,
        );
      }

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      // MATCH is the only operation with a trailing value arg.
      const args: RedisClientCommand = [
        BrowserToolArrayCommands.ArOp,
        keyName,
        start,
        end,
        operation,
      ];
      if (operation === ArrayAggregateOperation.Match) {
        args.push(value as RedisString);
      }
      const reply = await client.sendCommand(args);

      this.logger.debug('Succeed to aggregate array range.', clientMetadata);
      // AROP returns nil for numeric ops over a range with no numeric values
      // and for bitwise ops over an empty range; surface that as `null` rather
      // than throwing a 500 from toRequiredIndexString.
      return plainToInstance(AggregateArrayResponse, {
        keyName,
        result: toIndexString(reply),
      });
    } catch (error) {
      this.logger.error(
        'Failed to aggregate array range.',
        error,
        clientMetadata,
      );
      if (error instanceof BadRequestException) throw error;
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getMultiElements(
    clientMetadata: ClientMetadata,
    dto: GetArrayMultiElementsDto,
  ): Promise<GetArrayMultiElementsResponse> {
    try {
      this.logger.debug('Getting array multi elements.', clientMetadata);
      const { keyName, indexes } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const elements = (await client.sendCommand([
        BrowserToolArrayCommands.ArMGet,
        keyName,
        ...indexes,
      ])) as (Buffer | string | null)[];

      this.logger.debug('Succeed to get array multi elements.', clientMetadata);
      return plainToInstance(GetArrayMultiElementsResponse, {
        keyName,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get array multi elements.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }
}
