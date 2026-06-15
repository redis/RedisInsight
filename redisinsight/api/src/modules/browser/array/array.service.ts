import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RedisErrorCodes } from 'src/constants';
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
  ArrayCreationMode,
  ArrayElement,
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
} from 'src/modules/browser/array/dto';

// Integer/bulk replies for indexes and counts may arrive as Buffer, string,
// number, or bigint depending on the client mode. Normalize to a decimal
// string so the unsigned 64-bit contract is preserved on the wire.
const toIndexString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return String(value);
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
};

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

  // Inputs are validated as canonical decimal strings ≤ 2^64-1, so BigInt()
  // is safe. Ranges are reversible (start > end).
  private assertRangeWithinCap(start: string, end: string): void {
    const startBig = BigInt(start);
    const endBig = BigInt(end);
    const span =
      startBig > endBig
        ? startBig - endBig + BigInt(1)
        : endBig - startBig + BigInt(1);

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

      this.assertRangeWithinCap(start, end);

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
      // ARSET key startIndex value [value ...] — contiguous run from startIndex
      return [BrowserToolArrayCommands.ArSet, keyName, startIndex, ...values];
    }

    // ARMSET key index value [index value ...] — sparse index/value pairs
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

      // ARSCAN skips empty slots in the response but still walks the index
      // range server-side (O(|end-start|+1)). Apply the same span cap as
      // ARGETRANGE so an unbounded range cannot tie up Redis even when LIMIT
      // is omitted; LIMIT remains a complementary result-set cap.
      this.assertRangeWithinCap(start, end);

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      await checkIfKeyNotExists(keyName, client);

      const baseArgs = [
        BrowserToolArrayCommands.ArScan as string,
        keyName,
        start,
        end,
      ] as const;
      // Treat an explicit JSON `null` the same as an omitted limit. @IsOptional()
      // skips downstream validators for null, so the DTO accepts it; forwarding
      // `LIMIT null` to Redis would otherwise surface as a 500.
      const hasLimit = typeof limit === 'number';
      const reply = (await client.sendCommand(
        hasLimit ? [...baseArgs, 'LIMIT', limit] : [...baseArgs],
      )) as unknown[];

      // ARSCAN's wire shape varies by client: some clients surface a flat
      // [index, value, index, value, ...] reply, others group it into
      // [[index, value], [index, value], ...]. Detect by sniffing the first
      // element and normalize both into pairs. Malformed pairs (missing
      // half) are dropped to honor the "populated-only" contract —
      // JSON.stringify would otherwise drop an undefined value and reach
      // the client as `{ index }` with no value.
      const pairs: Array<[unknown, unknown]> = [];
      if (Array.isArray(reply[0])) {
        for (const entry of reply as unknown[][]) {
          if (entry?.length >= 2) pairs.push([entry[0], entry[1]]);
        }
      } else {
        for (let i = 0; i < reply.length; i += 2) {
          pairs.push([reply[i], reply[i + 1]]);
        }
      }

      const elements: ArrayElement[] = [];
      for (const [rawIndex, value] of pairs) {
        if (rawIndex == null || value == null) continue;
        elements.push({
          index: toIndexString(rawIndex),
          value: value as Buffer | string,
        });
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
        length: toIndexString(reply),
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
        count: toIndexString(reply),
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

      // ARNEXT returns nil when the insertion cursor is exhausted. Surface
      // that as `null` so clients can distinguish absence from a real index;
      // folding it through toIndexString would produce the string "null".
      const index =
        reply === null || reply === undefined ? null : toIndexString(reply);

      this.logger.debug('Succeed to get array next index.', clientMetadata);
      return plainToInstance(GetArrayNextIndexResponse, { keyName, index });
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
