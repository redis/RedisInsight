import { Injectable, Logger } from '@nestjs/common';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import {
  ArrayCreationMode,
  CreateArrayWithExpireDto,
} from 'src/modules/browser/array/dto';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  RedisClient,
  RedisClientCommand,
  RedisClientCommandReply,
} from 'src/modules/redis/client';
import { checkIfKeyExists } from 'src/modules/browser/utils';

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
}
