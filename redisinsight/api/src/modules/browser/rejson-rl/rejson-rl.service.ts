import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as JSONBigInt from 'json-bigint';
import { AdditionalRedisModuleName, RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchAclError } from 'src/utils';
import config, { Config } from 'src/utils/config';
import { ClientMetadata } from 'src/common/models';
import {
  CreateRejsonRlWithExpireDto,
  GetRejsonRlDto,
  GetRejsonRlResponseDto,
  ModifyRejsonRlArrAppendDto,
  ModifyRejsonRlSetDto,
  RemoveRejsonRlDto,
  RemoveRejsonRlResponse,
  SafeRejsonRlDataDto,
} from 'src/modules/browser/rejson-rl/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';
import { RedisClient } from 'src/modules/redis/client';
import { DatabaseService } from 'src/modules/database/database.service';

const MODULES_CONFIG = config.get('modules') as Config['modules'];

// Allow JSON keys named 'constructor' and '__proto__' to be preserved since RedisInsight displays arbitrary user data from Redis
const JSONbig = JSONBigInt({
  protoAction: 'preserve',
  constructorAction: 'preserve',
});

@Injectable()
export class RejsonRlService {
  private logger = new Logger('JsonService');

  constructor(
    private databaseClientFactory: DatabaseClientFactory,
    private databaseService: DatabaseService,
  ) {}

  private async prepareJsonPath(
    clientMetadata: ClientMetadata,
    path: string,
  ): Promise<string> {
    const database = await this.databaseService.get(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
    );

    const jsonModule = database.modules?.find(
      (module) => module.name === AdditionalRedisModuleName.RedisJSON,
    );

    // RedisJSON v1 (legacy) uses a different path format.
    // If the module version isn't reported, assume legacy format just to be safe.
    // Ref: https://redis.io/docs/latest/develop/data-types/json/path/#legacy-path-syntax
    if (!jsonModule?.semanticVersion || jsonModule.semanticVersion[0] === '1') {
      if (path.length === 1) {
        return '.';
      }
      return path[0] === '$' ? path.slice(1) : path;
    }

    return path;
  }

  private async forceGetJson(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<any> {
    const data = (await client.sendCommand(
      [BrowserToolRejsonRlCommands.JsonGet, keyName, path],
      { replyEncoding: 'utf8' },
    )) as string;

    if (data === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return path[0] === '$' ? JSONbig.stringify(JSONbig.parse(data)[0]) : data;
  }

  private async estimateSize(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<number | null> {
    let size = 0;

    try {
      size = (await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonDebug,
        'MEMORY',
        keyName,
        path === '$' ? '.' : path,
      ])) as number;
    } catch (error) {
      this.logger.error('Failed to estimate size of json.', error);
    }

    if (size === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return size;
  }

  private async getObjectKeys(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<string[]> {
    const keys = await client.sendCommand(
      [BrowserToolRejsonRlCommands.JsonObjKeys, keyName, path],
      { replyEncoding: 'utf8' },
    );

    return path[0] === '$' ? keys[0] : keys;
  }

  private async getJsonDataType(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ): Promise<string> {
    const type = await client.sendCommand(
      [BrowserToolRejsonRlCommands.JsonType, keyName, path],
      { replyEncoding: 'utf8' },
    );

    return path[0] === '$' ? type[0] : type;
  }

  private async isUnsafeBigJsonLength(
    client: RedisClient,
    keyName: RedisString,
    path: string,
  ) {
    const type = await this.getJsonDataType(client, keyName, path);

    let length: number | null;

    switch (type) {
      case 'object':
        length = (await client.sendCommand(
          [BrowserToolRejsonRlCommands.JsonObjLen, keyName, path],
          { replyEncoding: 'utf8' },
        )) as number;

        break;
      case 'array':
        length = (await client.sendCommand(
          [BrowserToolRejsonRlCommands.JsonArrLen, keyName, path],
          { replyEncoding: 'utf8' },
        )) as number;

        break;
      default:
        // for the rest types we can safely continue processing
        // Even for big strings since it should be handled by "sizeThreshold" before
        return false;
    }

    if (length === null) {
      throw new BadRequestException(
        `There is no such path: "${path}" in key: "${keyName}"`,
      );
    }

    return (
      MODULES_CONFIG.json.lengthThreshold > 0 &&
      length > MODULES_CONFIG.json.lengthThreshold
    );
  }

  private async getDetails(
    client: RedisClient,
    keyName: RedisString,
    path: string,
    key: string | number,
  ): Promise<any> {
    const details = {
      key,
      path,
      cardinality: 1,
    };

    const objectKeyType = await this.getJsonDataType(client, keyName, path);

    details['type'] = objectKeyType;
    let cardinality;
    switch (objectKeyType) {
      case 'object':
        cardinality = await client.sendCommand(
          [BrowserToolRejsonRlCommands.JsonObjLen, keyName, path],
          { replyEncoding: 'utf8' },
        );

        details['cardinality'] = path[0] === '$' ? cardinality[0] : cardinality;
        break;
      case 'array':
        cardinality = await client.sendCommand(
          [BrowserToolRejsonRlCommands.JsonArrLen, keyName, path],
          { replyEncoding: 'utf8' },
        );

        details['cardinality'] = path[0] === '$' ? cardinality[0] : cardinality;
        break;
      default:
        details['value'] = await this.forceGetJson(client, keyName, path);
    }

    return details;
  }

  private async safeGetJsonByType(
    client: RedisClient,
    keyName: RedisString,
    path: string,
    type: string,
  ): Promise<SafeRejsonRlDataDto[]> {
    const promises = [];
    let objectKeys: string[];
    let arrayLength: number;

    switch (type) {
      case 'object':
        objectKeys = await this.getObjectKeys(client, keyName, path);

        for (const objectKey of objectKeys) {
          const rootPath = path === '.' ? '' : path;
          const childPath = objectKey.includes('"')
            ? `['${objectKey}']`
            : `["${objectKey}"]`;
          const fullObjectKeyPath = `${rootPath}${childPath}`;
          promises.push(
            this.getDetails(client, keyName, fullObjectKeyPath, objectKey),
          );
        }

        return Promise.all(promises);
      case 'array':
        arrayLength = (await client.sendCommand(
          [BrowserToolRejsonRlCommands.JsonArrLen, keyName, path],
          { replyEncoding: 'utf8' },
        )) as number;
        if (Array.isArray(arrayLength)) {
          [arrayLength] = arrayLength;
        }

        for (let i = 0; i < arrayLength; i += 1) {
          const fullObjectKeyPath = `${path === '.' ? '' : path}[${i}]`;
          promises.push(this.getDetails(client, keyName, fullObjectKeyPath, i));
        }

        return Promise.all(promises);
      default:
        return this.forceGetJson(client, keyName, path);
    }
  }

  /**
   * Method to create REJSON-RL type
   * Supports key TTL
   *
   * @param clientMetadata
   * @param dto
   */
  public async create(
    clientMetadata: ClientMetadata,
    dto: CreateRejsonRlWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating REJSON-RL data type.', clientMetadata);
      const { keyName, data, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const path = await this.prepareJsonPath(clientMetadata, '$');

      await checkIfKeyExists(keyName, client);

      await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonSet,
        keyName,
        path,
        data,
        'NX',
      ]);

      if (expire) {
        try {
          await client.sendCommand([
            BrowserToolKeysCommands.Expire,
            keyName,
            expire,
          ]);
        } catch (err) {
          this.logger.error(
            `Unable to set expire ${expire} for REJSON-RL key ${keyName}.`,
            err,
            clientMetadata,
          );
        }
      }

      this.logger.debug(
        'Succeed to create REJSON-RL key type.',
        clientMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to create REJSON-RL key type.',
        error,
        clientMetadata,
      );

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }

  public async getJson(
    clientMetadata: ClientMetadata,
    dto: GetRejsonRlDto,
  ): Promise<GetRejsonRlResponseDto> {
    try {
      this.logger.debug('Getting json by key.', clientMetadata);
      const { keyName, path, forceRetrieve } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const jsonPath = await this.prepareJsonPath(clientMetadata, path);

      const result: GetRejsonRlResponseDto = {
        downloaded: true,
        path,
        data: null,
      };

      // Get value in the path without any checks
      if (forceRetrieve) {
        result.data = await this.forceGetJson(client, keyName, jsonPath);
        return result;
      }

      const jsonSize = await this.estimateSize(client, keyName, jsonPath);

      if (jsonSize > MODULES_CONFIG.json.sizeThreshold) {
        // Additional check for cardinality
        if (await this.isUnsafeBigJsonLength(client, keyName, jsonPath)) {
          throw new BadRequestException(ERROR_MESSAGES.UNSAFE_BIG_JSON_LENGTH);
        }

        const type = await this.getJsonDataType(client, keyName, jsonPath);
        result.downloaded = false;
        result.type = type;
        result.data = await this.safeGetJsonByType(
          client,
          keyName,
          jsonPath,
          type,
        );
      } else {
        result.data = await this.forceGetJson(client, keyName, jsonPath);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get json.', error, clientMetadata);

      if (error.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      // todo: refactor error handling across the project
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to modify REJSON-RL type using JSON.SET command
   * @param clientMetadata
   * @param dto
   */
  public async jsonSet(
    clientMetadata: ClientMetadata,
    dto: ModifyRejsonRlSetDto,
  ): Promise<void> {
    try {
      this.logger.debug('Modifying REJSON-RL data type.', clientMetadata);
      const { keyName, path, data } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const jsonPath = await this.prepareJsonPath(clientMetadata, path);

      await checkIfKeyNotExists(keyName, client);

      await this.getJsonDataType(client, keyName, jsonPath);
      await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonSet,
        keyName,
        jsonPath,
        data,
      ]);

      this.logger.debug(
        'Succeed to modify REJSON-RL key type.',
        clientMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to modify REJSON-RL key type.',
        error,
        clientMetadata,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error.message.includes('index') &&
        error.message.includes('out of range')
      ) {
        throw new NotFoundException(ERROR_MESSAGES.PATH_NOT_EXISTS());
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to modify REJSON-RL type using JSON.ARRAPPEND command
   * @param clientMetadata
   * @param dto
   */
  public async arrAppend(
    clientMetadata: ClientMetadata,
    dto: ModifyRejsonRlArrAppendDto,
  ): Promise<void> {
    try {
      this.logger.debug('Modifying REJSON-RL data type.', clientMetadata);
      const { keyName, path, data } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const jsonPath = await this.prepareJsonPath(clientMetadata, path);

      await checkIfKeyNotExists(keyName, client);

      const result = await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonArrAppend,
        keyName,
        jsonPath,
        ...data,
      ]);

      // JSON.ARRAPEND returns an array of integer replies for each path, the array's new size,
      // or nil, if the matching JSON value is not an array.
      if (jsonPath[0] === '$' && typeof result?.[0] !== 'number') {
        throw new BadRequestException({
          message: `ReplyError: ERR Path ${jsonPath} does not exist or not an array`,
        });
      }

      this.logger.log('Succeed to modify REJSON-RL key type.', clientMetadata);
    } catch (error) {
      this.logger.error(
        'Failed to modify REJSON-RL key type',
        error,
        clientMetadata,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }

  /**
   * Method to remove REJSON-RL path using JSON.DEL command
   * @param clientMetadata
   * @param dto
   */
  public async remove(
    clientMetadata: ClientMetadata,
    dto: RemoveRejsonRlDto,
  ): Promise<RemoveRejsonRlResponse> {
    try {
      this.logger.debug('Removing REJSON-RL data.', clientMetadata);
      const { keyName, path } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const jsonPath = await this.prepareJsonPath(clientMetadata, path);

      await checkIfKeyNotExists(keyName, client);

      const affected = (await client.sendCommand([
        BrowserToolRejsonRlCommands.JsonDel,
        keyName,
        jsonPath,
      ])) as number;

      this.logger.debug('Succeed to remove REJSON-RL path.', clientMetadata);
      return { affected };
    } catch (error) {
      this.logger.error(
        'Failed to remove REJSON-RL path.',
        error,
        clientMetadata,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.message.includes(RedisErrorCodes.UnknownCommand)) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        });
      }

      throw catchAclError(error);
    }
  }
}
