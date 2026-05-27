import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { RedisErrorCodes } from 'src/constants';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolArrayCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import {
  AddElementsToArrayDto,
  ArrayElementDto,
  CreateArrayDto,
  DeleteArrayElementsDto,
  DeleteArrayElementsResponse,
  GetArrayElementsDto,
  GetArrayElementsResponse,
} from 'src/modules/browser/array/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient, RedisClientCommand } from 'src/modules/redis/client';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';

@Injectable()
export class ArrayService {
  private logger = new Logger('ArrayService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  public async createArray(
    clientMetadata: ClientMetadata,
    dto: CreateArrayDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating Array data type.', clientMetadata);
      const { keyName, elements, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      // Build ARMSET command: ARMSET key index1 value1 index2 value2 ...
      const armsetArgs: (string | number | Buffer)[] = [keyName];
      elements.forEach(({ index, value }) => {
        armsetArgs.push(index, value);
      });

      const commands: RedisClientCommand[] = [
        [BrowserToolArrayCommands.ArMSet, ...armsetArgs],
      ];

      if (expire) {
        commands.push([
          BrowserToolKeysCommands.Expire,
          keyName,
          expire,
        ] as RedisClientCommand);
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
      this.throwWrongTypeOrAcl(error);
    }
  }

  public async addElements(
    clientMetadata: ClientMetadata,
    dto: AddElementsToArrayDto,
  ): Promise<void> {
    try {
      this.logger.debug(
        'Adding elements to the Array data type.',
        clientMetadata,
      );
      const { keyName, elements } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      // Build ARMSET command: ARMSET key index1 value1 index2 value2 ...
      const armsetArgs: (string | number | Buffer)[] = [keyName];
      elements.forEach(({ index, value }) => {
        armsetArgs.push(index, value);
      });

      await client.sendCommand([
        BrowserToolArrayCommands.ArMSet,
        ...armsetArgs,
      ]);

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
      this.throwWrongTypeOrAcl(error);
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
      const { keyName, cursor = 0, count } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      // Fetch metadata and elements in a single pipeline — all three commands are
      // independent of each other's results so there is no ordering requirement.
      // Issuing ARLEN and ARSCAN in the same pipeline guarantees they reflect the
      // same point-in-time snapshot, so logicalLength is never stale relative to
      // the scan results.
      // ARSCAN key start end [LIMIT limit]: returns [[index, value], ...] pairs.
      // Use Number.MAX_SAFE_INTEGER as the upper bound so LIMIT drives pagination.
      const [[, total = 0], [, logicalLength = 0], [, rawScan]] =
        (await client.sendPipeline([
          [BrowserToolArrayCommands.ArCount, keyName],
          [BrowserToolArrayCommands.ArLen, keyName],
          [
            BrowserToolArrayCommands.ArScan,
            keyName,
            cursor,
            Number.MAX_SAFE_INTEGER,
            'LIMIT',
            count,
          ],
        ])) as [any, any][];

      // Map each [index, value] pair into an ArrayElementDto
      const elements: ArrayElementDto[] = (
        (rawScan ?? []) as [number | Buffer, Buffer][]
      ).map((pair) =>
        plainToInstance(ArrayElementDto, {
          index: Number(pair[0]),
          value: pair[1],
        }),
      );

      // ARSCAN scans the full range [cursor, MAX_SAFE_INTEGER] and returns all
      // populated entries up to LIMIT. Zero results therefore definitively means
      // no more elements exist from this cursor onwards — advance past the last
      // returned index only when there are results and space remains.
      let nextCursor: number | undefined;
      if (elements.length > 0) {
        const candidate = elements[elements.length - 1].index + 1;
        if (candidate < logicalLength) {
          nextCursor = candidate;
        }
      }

      this.logger.debug(
        'Succeed to get elements of the Array data type.',
        clientMetadata,
      );

      return plainToInstance(GetArrayElementsResponse, {
        keyName,
        total,
        logicalLength,
        nextCursor,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get elements of the Array data type.',
        error,
        clientMetadata,
      );
      this.throwWrongTypeOrAcl(error);
    }
  }

  public async deleteElements(
    clientMetadata: ClientMetadata,
    dto: DeleteArrayElementsDto,
  ): Promise<DeleteArrayElementsResponse> {
    try {
      this.logger.debug(
        'Deleting elements from the Array data type.',
        clientMetadata,
      );
      const { keyName, indices } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      if (!indices.length) {
        return { affected: 0 };
      }

      // ARDEL key index1 index2 ... — deletes all specified indices in one call
      const affected = (await client.sendCommand([
        BrowserToolArrayCommands.ArDel,
        keyName,
        ...indices,
      ])) as number;

      this.logger.debug(
        'Succeed to delete elements from the Array data type.',
        clientMetadata,
      );

      return { affected };
    } catch (error) {
      this.logger.error(
        'Failed to delete elements from the Array data type.',
        error,
        clientMetadata,
      );
      this.throwWrongTypeOrAcl(error);
    }
  }

  private throwWrongTypeOrAcl(error: ReplyError): never {
    if (error?.message?.includes(RedisErrorCodes.WrongType)) {
      throw new BadRequestException(error.message);
    }
    throw catchAclError(error);
  }
}
