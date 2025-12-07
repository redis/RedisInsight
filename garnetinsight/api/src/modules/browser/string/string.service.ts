import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RECOMMENDATION_NAMES, RedisErrorCodes } from 'src/constants';
import { catchAclError } from 'src/utils';
import {
  GetStringInfoDto,
  GetStringValueResponse,
  SetStringDto,
  SetStringWithExpireDto,
} from 'src/modules/browser/string/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolStringCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { GetKeyInfoDto } from 'src/modules/browser/keys/dto';
import { ClientMetadata } from 'src/common/models';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { Readable } from 'stream';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient, RedisClientCommand } from 'src/modules/redis/client';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';

@Injectable()
export class StringService {
  private logger = new Logger('StringService');

  constructor(
    private databaseClientFactory: DatabaseClientFactory,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  public async setString(
    clientMetadata: ClientMetadata,
    dto: SetStringWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Setting string key type.', clientMetadata);
      const { keyName, value, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      if (expire) {
        await client.sendCommand([
          BrowserToolStringCommands.Set,
          keyName,
          value,
          'EX',
          `${expire}`,
          'NX',
        ]);
      } else {
        await client.sendCommand([
          BrowserToolStringCommands.Set,
          keyName,
          value,
          'NX',
        ]);
      }

      this.logger.debug('Succeed to set string key type.', clientMetadata);
      return null;
    } catch (error) {
      this.logger.error('Failed to set string key type', error, clientMetadata);
      throw catchAclError(error);
    }
  }

  public async getStringValue(
    clientMetadata: ClientMetadata,
    dto: GetStringInfoDto,
  ): Promise<GetStringValueResponse> {
    try {
      this.logger.debug('Getting string value.', clientMetadata);
      const { keyName, start, end } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      let value;
      if (end) {
        value = await client.sendCommand([
          BrowserToolStringCommands.Getrange,
          keyName,
          `${start}`,
          `${end}`,
        ]);
      } else {
        value = await client.sendCommand([
          BrowserToolStringCommands.Get,
          keyName,
        ]);
      }

      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.STRING_TO_JSON,
        { value, keyName },
      );

      this.logger.debug('Succeed to get string value.', clientMetadata);
      return plainToInstance(GetStringValueResponse, { value, keyName });
    } catch (error) {
      this.logger.error('Failed to get string value.', error, clientMetadata);
      if (error.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async downloadStringValue(
    clientMetadata: ClientMetadata,
    dto: GetKeyInfoDto,
  ): Promise<{ stream: Readable }> {
    const result = await this.getStringValue(clientMetadata, dto);

    const stream = Readable.from(result.value);
    return { stream };
  }

  public async updateStringValue(
    clientMetadata: ClientMetadata,
    dto: SetStringDto,
  ): Promise<void> {
    try {
      this.logger.debug('Updating string value.', clientMetadata);
      const { keyName, value } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const ttl = await client.sendCommand([
        BrowserToolKeysCommands.Ttl,
        keyName,
      ]);
      const result = await client.sendCommand([
        BrowserToolStringCommands.Set,
        keyName,
        value,
        'XX',
      ]);
      if (result && ttl > 0) {
        await client.sendCommand(<RedisClientCommand>[
          BrowserToolKeysCommands.Expire,
          keyName,
          ttl,
        ]);
      }

      this.logger.debug('Succeed to update string value.', clientMetadata);
      return null;
    } catch (error) {
      this.logger.error(
        'Failed to update string value.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }
}
