import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isNull, isArray } from 'lodash';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import {
  CreateListWithExpireDto,
  DeleteListElementsDto,
  DeleteListElementsResponse,
  GetListElementResponse,
  GetListElementsDto,
  GetListElementsResponse,
  ListElementDestination,
  PushElementToListDto,
  PushListElementsResponse,
  SetListElementDto,
  SetListElementResponse,
} from 'src/modules/browser/list/dto';
import { KeyDto } from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolListCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient, RedisClientCommandReply } from 'src/modules/redis/client';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';

@Injectable()
export class ListService {
  private logger = new Logger('ListService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  public async createList(
    clientMetadata: ClientMetadata,
    dto: CreateListWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating list data type.', clientMetadata);
      const { keyName, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      if (expire) {
        await this.createListWithExpiration(client, dto);
      } else {
        await this.createSimpleList(client, dto);
      }

      this.logger.debug('Succeed to create list data type.', clientMetadata);
      return null;
    } catch (error) {
      this.logger.error(
        'Failed to create list data type.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }

  public async pushElement(
    clientMetadata: ClientMetadata,
    dto: PushElementToListDto,
  ): Promise<PushListElementsResponse> {
    try {
      this.logger.debug(
        'Insert element at the tail/head of the list data type.',
        clientMetadata,
      );
      const { keyName, elements, destination } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const total: RedisClientCommandReply = await client.sendCommand([
        BrowserToolListCommands[
          destination === ListElementDestination.Tail ? 'RPushX' : 'LPushX'
        ],
        keyName,
        ...elements,
      ]);
      if (!total) {
        this.logger.error(
          `Failed to inserts element at the ${destination} of the list data type. Key not found. key: ${keyName}`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      this.logger.debug(
        `Succeed to insert element at the ${destination} of the list data type.`,
        clientMetadata,
      );
      return plainToInstance(PushListElementsResponse, { keyName, total });
    } catch (error) {
      this.logger.error(
        'Failed to inserts element to the list data type.',
        error,
        clientMetadata,
      );
      if (error.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getElements(
    clientMetadata: ClientMetadata,
    dto: GetListElementsDto,
  ): Promise<GetListElementsResponse> {
    try {
      this.logger.debug(
        'Getting elements of the list stored at key.',
        clientMetadata,
      );
      const { keyName, offset, count } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const total = await client.sendCommand([
        BrowserToolListCommands.LLen,
        keyName,
      ]);
      if (!total) {
        this.logger.error(
          `Failed to get elements of the list. Key not found. key: ${keyName}`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      const elements = await client.sendCommand([
        BrowserToolListCommands.Lrange,
        keyName,
        offset,
        offset + count - 1,
      ]);

      this.logger.debug('Succeed to get elements of the list.', clientMetadata);
      return plainToInstance(GetListElementsResponse, {
        keyName,
        total,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to to get elements of the list.',
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
   * Get List element by index
   * NotFound exception when redis return null
   * @param clientMetadata
   * @param index
   * @param dto
   */
  public async getElement(
    clientMetadata: ClientMetadata,
    index: number,
    dto: KeyDto,
  ): Promise<GetListElementResponse> {
    try {
      this.logger.debug('Getting List element by index.', clientMetadata);
      const { keyName } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const value = await client.sendCommand([
        BrowserToolListCommands.LIndex,
        keyName,
        index,
      ]);
      if (value === null) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.INDEX_OUT_OF_RANGE()),
        );
      }

      this.logger.debug(
        'Succeed to get List element by index.',
        clientMetadata,
      );
      return plainToInstance(GetListElementResponse, { keyName, value });
    } catch (error) {
      this.logger.error(
        'Failed to to get List element by index.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async setElement(
    clientMetadata: ClientMetadata,
    dto: SetListElementDto,
  ): Promise<SetListElementResponse> {
    try {
      this.logger.debug('Setting the list element at index', clientMetadata);
      const { keyName, element, index } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);
      await client.sendCommand([
        BrowserToolListCommands.LSet,
        keyName,
        index,
        element,
      ]);

      this.logger.debug(
        'Succeed to set the list element at index.',
        clientMetadata,
      );
      return plainToInstance(SetListElementResponse, { index, element });
    } catch (error) {
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      if (error?.message.includes('index out of range')) {
        throw new BadRequestException(error.message);
      }
      this.logger.error(
        'Failed to set the list element at index.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }

  /**
   * Delete and return the elements from the tail/head of list stored at key
   * NotFound exception when redis return null
   * @param clientMetadata
   * @param dto
   */
  public async deleteElements(
    clientMetadata: ClientMetadata,
    dto: DeleteListElementsDto,
  ): Promise<DeleteListElementsResponse> {
    try {
      this.logger.debug(
        'Deleting elements from the list stored at key.',
        clientMetadata,
      );
      const { keyName, count, destination } = dto;
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const execArgs = !!count && count > 1 ? [keyName, count] : [keyName];
      let result;

      if (destination === ListElementDestination.Head) {
        result = await client.sendCommand([
          BrowserToolListCommands.LPop,
          ...execArgs,
        ]);
      } else {
        result = await client.sendCommand([
          BrowserToolListCommands.RPop,
          ...execArgs,
        ]);
      }
      if (isNull(result)) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      return plainToInstance(DeleteListElementsResponse, {
        elements: isArray(result) ? [...result] : [result],
      });
    } catch (error) {
      this.logger.error(
        'Failed to delete elements from the list stored at key.',
        error,
        clientMetadata,
      );
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      if (
        error?.message.includes('wrong number of arguments') &&
        error?.command?.args?.length === 2
      ) {
        throw new BadRequestException(
          ERROR_MESSAGES.REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT(),
        );
      }
      throw catchAclError(error);
    }
  }

  public async createSimpleList(
    client: RedisClient,
    dto: PushElementToListDto,
  ): Promise<void> {
    const { keyName, elements, destination } = dto;
    await client.sendCommand([
      BrowserToolListCommands[
        destination === ListElementDestination.Tail ? 'RPush' : 'LPush'
      ],
      keyName,
      ...elements,
    ]);
  }

  public async createListWithExpiration(
    client: RedisClient,
    dto: CreateListWithExpireDto,
  ): Promise<void> {
    const { keyName, elements, expire, destination } = dto;
    const transactionResults = await client.sendPipeline([
      [
        BrowserToolListCommands[
          destination === ListElementDestination.Tail ? 'RPush' : 'LPush'
        ],
        keyName,
        ...elements,
      ],
      [BrowserToolKeysCommands.Expire, keyName, expire],
    ]);
    catchMultiTransactionError(transactionResults);
  }
}
