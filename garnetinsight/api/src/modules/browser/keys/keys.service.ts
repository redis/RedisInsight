import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DEFAULT_MATCH,
  RECOMMENDATION_NAMES,
  RedisErrorCodes,
} from 'src/constants';
import { catchAclError } from 'src/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  DeleteKeysResponse,
  GetKeyInfoResponse,
  GetKeysDto,
  GetKeysInfoDto,
  GetKeysWithDetailsResponse,
  KeyTtlResponse,
  RenameKeyDto,
  RenameKeyResponse,
  UpdateKeyTtlDto,
} from 'src/modules/browser/keys/dto';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { ClientMetadata } from 'src/common/models';
import { Scanner } from 'src/modules/browser/keys/scanner/scanner';
import { BrowserHistoryMode, RedisString } from 'src/common/constants';
import { plainToInstance } from 'class-transformer';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { pick } from 'lodash';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { CreateBrowserHistoryDto } from 'src/modules/browser/browser-history/dto';
import { KeyInfoProvider } from 'src/modules/browser/keys/key-info/key-info.provider';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { checkIfKeyNotExists } from 'src/modules/browser/utils';

@Injectable()
export class KeysService {
  private logger = new Logger('KeysService');

  constructor(
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly scanner: Scanner,
    private readonly keyInfoProvider: KeyInfoProvider,
    private readonly browserHistory: BrowserHistoryService,
    private readonly recommendationService: DatabaseRecommendationService,
  ) {}

  public async getKeys(
    clientMetadata: ClientMetadata,
    dto: GetKeysDto,
  ): Promise<GetKeysWithDetailsResponse[]> {
    try {
      this.logger.debug('Getting keys with details.', clientMetadata);

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const scanner = this.scanner.getStrategy(client.getConnectionType());
      const result = await scanner.getKeys(client, dto);

      // Do not save default match "*"
      if (dto.match !== DEFAULT_MATCH) {
        await this.browserHistory.create(
          clientMetadata,
          plainToInstance(CreateBrowserHistoryDto, {
            filter: pick(dto, 'type', 'match'),
            mode: BrowserHistoryMode.Pattern,
          }),
        );
      }

      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.USE_SMALLER_KEYS,
        result[0]?.total,
      );

      return result.map((nodeResult) =>
        plainToInstance(GetKeysWithDetailsResponse, nodeResult),
      );
    } catch (error) {
      this.logger.error(
        `Failed to get keys with details info. ${error.message}.`,
        error,
        clientMetadata,
      );
      if (
        error.message.includes(RedisErrorCodes.CommandSyntaxError) &&
        dto.type
      ) {
        throw new BadRequestException(
          ERROR_MESSAGES.SCAN_PER_KEY_TYPE_NOT_SUPPORT(),
        );
      }
      throw catchAclError(error);
    }
  }

  /**
   * Fetch additional keys info (type, size, ttl)
   * For standalone instances will use pipeline
   * For cluster instances will use single commands
   * @param clientMetadata
   * @param dto
   */
  public async getKeysInfo(
    clientMetadata: ClientMetadata,
    dto: GetKeysInfoDto,
  ): Promise<GetKeyInfoResponse[]> {
    try {
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const scanner = this.scanner.getStrategy(client.getConnectionType());
      const result = await scanner.getKeysInfo(
        client,
        dto.keys,
        dto.type,
        dto.includeSize,
        dto.includeTTL,
      );

      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.SEARCH_JSON,
        { keys: result, client, databaseId: clientMetadata.databaseId },
      );

      return plainToInstance(GetKeyInfoResponse, result);
    } catch (error) {
      this.logger.error(
        `Failed to get keys info: ${error.message}.`,
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }

  public async getKeyInfo(
    clientMetadata: ClientMetadata,
    key: RedisString,
    includeSize: boolean = false,
  ): Promise<GetKeyInfoResponse> {
    try {
      this.logger.debug('Getting key info.', clientMetadata);
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const type = (await client.sendCommand(
        [BrowserToolKeysCommands.Type, key],
        {
          replyEncoding: 'utf8',
        },
      )) as string;

      if (type === 'none') {
        this.logger.error(
          `Failed to get key info. Not found key: ${key}`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      const result = await this.keyInfoProvider
        .getStrategy(type)
        .getInfo(client, key, type, includeSize);
      this.logger.debug('Succeed to get key info', clientMetadata);

      this.recommendationService.checkMulti(
        clientMetadata,
        [
          RECOMMENDATION_NAMES.BIG_SETS,
          RECOMMENDATION_NAMES.BIG_STRINGS,
          RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST,
        ],
        result,
      );

      return plainToInstance(GetKeyInfoResponse, result);
    } catch (error) {
      this.logger.error('Failed to get key info.', error, clientMetadata);
      throw catchAclError(error);
    }
  }

  /**
   * Delete multiple keys
   * @param clientMetadata
   * @param keys
   */
  public async deleteKeys(
    clientMetadata: ClientMetadata,
    keys: RedisString[],
  ): Promise<DeleteKeysResponse> {
    try {
      this.logger.debug('Deleting keys', clientMetadata);

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const result = (await client.sendCommand([
        BrowserToolKeysCommands.Del,
        ...keys,
      ])) as number;

      if (!result) {
        this.logger.error(
          'Failed to delete keys. Not Found keys',
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      this.logger.debug('Succeed to delete keys', clientMetadata);

      return { affected: result };
    } catch (error) {
      this.logger.error('Failed to delete keys.', error, clientMetadata);
      throw catchAclError(error);
    }
  }

  /**
   * Rename particular key
   * @param clientMetadata
   * @param dto
   */
  public async renameKey(
    clientMetadata: ClientMetadata,
    dto: RenameKeyDto,
  ): Promise<RenameKeyResponse> {
    try {
      this.logger.debug('Renaming key', clientMetadata);
      const { keyName, newKeyName } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const result = await client.sendCommand([
        BrowserToolKeysCommands.RenameNX,
        keyName,
        newKeyName,
      ]);

      if (!result) {
        this.logger.error(
          `Failed to rename key. ${ERROR_MESSAGES.NEW_KEY_NAME_EXIST} key: ${newKeyName}`,
        );
        return Promise.reject(
          new BadRequestException(ERROR_MESSAGES.NEW_KEY_NAME_EXIST),
        );
      }
      this.logger.debug('Succeed to rename key', clientMetadata);
      return plainToInstance(RenameKeyResponse, { keyName: newKeyName });
    } catch (error) {
      this.logger.error('Failed to rename key.', error, clientMetadata);
      throw catchAclError(error);
    }
  }

  public async updateTtl(
    clientMetadata: ClientMetadata,
    dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    if (dto.ttl === -1) {
      return await this.removeKeyExpiration(clientMetadata, dto);
    }
    return await this.setKeyExpiration(clientMetadata, dto);
  }

  /**
   * Set ttl for particular key
   * @param clientMetadata
   * @param dto
   */
  public async setKeyExpiration(
    clientMetadata: ClientMetadata,
    dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    try {
      this.logger.debug('Setting a timeout on key.', clientMetadata);
      const { keyName, ttl } = dto;

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const result = await client.sendCommand([
        BrowserToolKeysCommands.Expire,
        keyName,
        ttl,
      ]);

      if (!result) {
        this.logger.error(
          `Failed to set a timeout on key. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${keyName}`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      this.logger.debug('Succeed to set a timeout on key.', clientMetadata);
      return {
        ttl: ttl >= 0 ? ttl : -2,
      };
    } catch (error) {
      this.logger.error(
        'Failed to set a timeout on key.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }

  /**
   * Remove existing ttl for particular key
   * @param clientMetadata
   * @param dto
   */
  public async removeKeyExpiration(
    clientMetadata: ClientMetadata,
    dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    try {
      this.logger.debug(
        'Removing the existing timeout on key.',
        clientMetadata,
      );

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const currentTtl = await client.sendCommand([
        BrowserToolKeysCommands.Ttl,
        dto.keyName,
      ]);

      if (currentTtl === -2) {
        this.logger.error(
          `Failed to remove the existing timeout on key. ${ERROR_MESSAGES.KEY_NOT_EXIST} key: ${dto.keyName}`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      if (currentTtl > 0) {
        await client.sendCommand([
          BrowserToolKeysCommands.Persist,
          dto.keyName,
        ]);
      }

      this.logger.debug(
        'Succeed to remove the existing timeout on key.',
        clientMetadata,
      );
      return { ttl: -1 };
    } catch (error) {
      this.logger.error(
        'Failed to remove the existing timeout on key.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }
}
