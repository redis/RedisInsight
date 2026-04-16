import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BrowserToolVectorSetCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import {
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  GetVectorSetElementDetailsDto,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SetVectorSetElementAttributeDto,
  SetVectorSetElementAttributeResponse,
  VectorSetElementDto,
  VectorSetElementKeyDto,
  VECTOR_EMBEDDING_MAX_DISPLAY_LENGTH,
} from 'src/modules/browser/vector-set/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { Readable } from 'stream';
import {
  RedisClient,
  RedisClientCommand,
  RedisFeature,
} from 'src/modules/redis/client';
import { checkIfKeyNotExists } from 'src/modules/browser/utils';

@Injectable()
export class VectorSetService {
  private logger = new Logger('VectorSetService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  public async createVectorSet(
    clientMetadata: ClientMetadata,
    dto: CreateVectorSetDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating VectorSet data type.', clientMetadata);
      const { keyName, elements, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      const commands: RedisClientCommand[] = elements.map((element) =>
        this.buildVaddCommand(keyName, element),
      );

      if (expire) {
        commands.push([
          BrowserToolKeysCommands.Expire,
          keyName,
          expire,
        ] as RedisClientCommand);
      }

      const transactionResults = await client.sendPipeline(commands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug(
        'Succeed to create VectorSet data type.',
        clientMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to create VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async addElements(
    clientMetadata: ClientMetadata,
    dto: AddElementsToVectorSetDto,
  ): Promise<void> {
    try {
      this.logger.debug(
        'Adding elements to the VectorSet data type.',
        clientMetadata,
      );
      const { keyName, elements } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const commands: RedisClientCommand[] = elements.map((element) =>
        this.buildVaddCommand(keyName, element),
      );

      const transactionResults = await client.sendPipeline(commands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug(
        'Succeed to add elements to VectorSet data type.',
        clientMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to add elements to VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getElements(
    clientMetadata: ClientMetadata,
    dto: GetVectorSetElementsDto,
  ): Promise<GetVectorSetElementsResponse> {
    try {
      this.logger.debug(
        'Getting elements of the VectorSet data type stored at key.',
        clientMetadata,
      );
      const { keyName, start, end, count } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      // Get total count using VCARD
      const total = (await client.sendCommand([
        BrowserToolVectorSetCommands.VCard,
        keyName,
      ])) as number;

      if (!total) {
        this.logger.error(
          `Failed to get elements of the VectorSet data type. Not Found key: ${keyName}.`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      const isVRangeSupported = await client.isFeatureSupported(
        RedisFeature.VRangeCommand,
      );

      let elementNames: string[];
      let nextCursor: string | undefined;

      if (isVRangeSupported) {
        elementNames = (await client.sendCommand([
          BrowserToolVectorSetCommands.VRange,
          keyName,
          start || '-',
          end || '+',
          count,
        ])) as string[];

        if (elementNames.length === count && elementNames.length > 0) {
          nextCursor = `(${elementNames[elementNames.length - 1]}`;
        }
      } else {
        elementNames = (await client.sendCommand([
          BrowserToolVectorSetCommands.VRandMember,
          keyName,
          count,
        ])) as string[];
      }

      const elements = elementNames.map((name) =>
        plainToInstance(VectorSetElementDto, { name }),
      );

      this.logger.debug(
        'Succeed to get elements of the VectorSet data type.',
        clientMetadata,
      );
      return plainToInstance(GetVectorSetElementsResponse, {
        keyName,
        total,
        nextCursor,
        isPaginationSupported: isVRangeSupported,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get elements of the VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async deleteElements(
    clientMetadata: ClientMetadata,
    dto: DeleteVectorSetElementsDto,
  ): Promise<DeleteVectorSetElementsResponse> {
    try {
      this.logger.debug(
        'Deleting elements from the VectorSet data type.',
        clientMetadata,
      );
      const { keyName, elements } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      if (!elements.length) {
        return { affected: 0 };
      }

      const pipelineCommands: RedisClientCommand[] = elements.map((element) => [
        BrowserToolVectorSetCommands.VRem,
        keyName,
        element,
      ]);

      const pipelineResults = await client.sendPipeline(pipelineCommands);
      catchMultiTransactionError(pipelineResults);

      // Pipeline returns one [error, reply] pair per VREM. Each reply is how many
      // members that call removed (0 or 1). Sum them for the API response total.
      const affected = pipelineResults.reduce(
        (removedSoFar, [, membersRemovedByThisCommand]) =>
          removedSoFar + (membersRemovedByThisCommand as number),
        0,
      );

      this.logger.debug(
        'Succeed to delete elements from the VectorSet data type.',
        clientMetadata,
      );
      return { affected };
    } catch (error) {
      this.logger.error(
        'Failed to delete elements from the VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async getElementDetails(
    clientMetadata: ClientMetadata,
    dto: GetVectorSetElementDetailsDto,
  ): Promise<VectorSetElementDto> {
    try {
      this.logger.debug(
        'Getting element details in the VectorSet data type.',
        clientMetadata,
      );
      const { keyName, element } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const details = await this.fetchElementDetails(
        client,
        keyName,
        element.toString(),
      );

      this.logger.debug(
        'Succeed to get element details in the VectorSet data type.',
        clientMetadata,
      );

      return plainToInstance(VectorSetElementDto, details);
    } catch (error) {
      this.logger.error(
        'Failed to get element details in the VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async setElementAttribute(
    clientMetadata: ClientMetadata,
    dto: SetVectorSetElementAttributeDto,
  ): Promise<SetVectorSetElementAttributeResponse> {
    try {
      this.logger.debug(
        'Setting element attribute in the VectorSet data type.',
        clientMetadata,
      );
      const { keyName, element, attributes } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      await client.sendCommand([
        BrowserToolVectorSetCommands.VSetAttr,
        keyName,
        element,
        attributes,
      ]);

      const storedAttributes = (await client.sendCommand([
        BrowserToolVectorSetCommands.VGetAttr,
        keyName,
        element,
      ])) as string | undefined;

      this.logger.debug(
        'Succeed to set element attribute in the VectorSet data type.',
        clientMetadata,
      );

      return plainToInstance(SetVectorSetElementAttributeResponse, {
        attributes: storedAttributes,
      });
    } catch (error) {
      this.logger.error(
        'Failed to set element attribute in the VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  public async downloadEmbedding(
    clientMetadata: ClientMetadata,
    dto: VectorSetElementKeyDto,
  ): Promise<{ stream: Readable }> {
    try {
      this.logger.debug('Downloading vector embedding.', clientMetadata);
      const { keyName, element } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const rawVector = (await client.sendCommand([
        BrowserToolVectorSetCommands.VEmb,
        keyName,
        element,
      ])) as string[];

      const formatted = rawVector ? `[${rawVector.join(', ')}]` : '[]';

      const stream = Readable.from(formatted);
      return { stream };
    } catch (error) {
      this.logger.error(
        'Failed to download vector embedding.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  private async fetchElementDetails(
    client: RedisClient,
    keyName: Buffer | string,
    elementName: string,
  ): Promise<VectorSetElementDto> {
    const results = await client.sendPipeline([
      [BrowserToolVectorSetCommands.VEmb, keyName, elementName],
      [BrowserToolVectorSetCommands.VGetAttr, keyName, elementName],
    ]);

    const [embErr, rawEmb] = results[0];
    const [attrErr, rawAttr] = results[1];

    if (embErr) throw embErr;
    if (attrErr) throw attrErr;

    const rawVector = rawEmb
      ? (rawEmb as string[]).map((v) => parseFloat(v))
      : undefined;

    const vectorTruncated =
      rawVector !== undefined &&
      rawVector.length > VECTOR_EMBEDDING_MAX_DISPLAY_LENGTH;

    const vector = vectorTruncated
      ? rawVector.slice(0, VECTOR_EMBEDDING_MAX_DISPLAY_LENGTH)
      : rawVector;

    return plainToInstance(VectorSetElementDto, {
      name: elementName,
      vector,
      vectorTruncated: vectorTruncated || undefined,
      attributes: (rawAttr as string) || undefined,
    });
  }
}
