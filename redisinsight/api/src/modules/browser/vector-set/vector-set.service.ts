import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  BrowserToolKeysCommands,
  BrowserToolVectorSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import {
  AddElementsToVectorSetDto,
  CreateVectorSetDto,
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SearchVectorSetDto,
  SearchVectorSetMatchDto,
  SearchVectorSetResponse,
  SetVectorSetElementAttributeDto,
  SetVectorSetElementAttributeResponse,
  VectorSetElementDetailsDto,
  VectorSetElementKeyDto,
  VECTOR_EMBEDDING_MAX_DISPLAY_LENGTH,
  AddVectorSetElementDto,
} from 'src/modules/browser/vector-set/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { Readable } from 'stream';
import {
  RedisClient,
  RedisClientCommand,
  RedisFeature,
} from 'src/modules/redis/client';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';

/**
 * Stride of `VSIM ... WITHSCORES WITHATTRIBS` replies. The flat reply array
 * contains 3 entries per match in the order `(name, score, attributes|null)`.
 */
const VSIM_REPLY_STRIDE = 3;

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

      this.logger.debug(
        'Succeed to get elements of the VectorSet data type.',
        clientMetadata,
      );
      return plainToInstance(GetVectorSetElementsResponse, {
        keyName,
        total,
        nextCursor,
        isPaginationSupported: isVRangeSupported,
        elementNames,
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
    dto: VectorSetElementKeyDto,
  ): Promise<VectorSetElementDetailsDto> {
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

      return plainToInstance(VectorSetElementDetailsDto, details);
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

  public async similaritySearch(
    clientMetadata: ClientMetadata,
    dto: SearchVectorSetDto,
  ): Promise<SearchVectorSetResponse> {
    try {
      this.logger.debug(
        'Running similarity search on the VectorSet data type.',
        clientMetadata,
      );
      const { keyName } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const command = this.buildVsimCommand(keyName, dto);
      const reply = (await client.sendCommand(command)) as Array<
        string | Buffer | null
      >;

      const elements = this.parseVsimReply(reply);

      this.logger.debug(
        'Succeed to run similarity search on the VectorSet data type.',
        clientMetadata,
      );

      return plainToInstance(SearchVectorSetResponse, {
        keyName,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to run similarity search on the VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error?.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  private buildVaddCommand(
    keyName: Buffer | string,
    element: AddVectorSetElementDto,
  ): RedisClientCommand {
    const args: Array<string | number | Buffer> = [
      BrowserToolVectorSetCommands.VAdd,
      keyName,
    ];

    // Dispatch explicitly on each payload rather than assuming `vectorValues`
    // is defined. DTO validation should already guarantee exactly one of the
    // two is present, but we stay defensive so any future internal caller
    // that bypasses class-validator still fails loudly instead of crashing on
    // an `undefined.length` read or silently dropping one of the two inputs.
    const hasVectorFp32 =
      typeof element.vectorFp32 === 'string' && element.vectorFp32.length > 0;
    const hasVectorValues =
      Array.isArray(element.vectorValues) && element.vectorValues.length > 0;

    if (hasVectorFp32 && hasVectorValues) {
      throw new BadRequestException(
        'Vector element must supply either `vectorValues` (number[]) or `vectorFp32` (base64 string), not both.',
      );
    }

    if (hasVectorFp32) {
      args.push(
        'FP32',
        Buffer.from(element.vectorFp32, 'base64'),
        element.name,
      );
    } else if (hasVectorValues) {
      args.push(
        'VALUES',
        element.vectorValues.length,
        ...element.vectorValues.map(String),
        element.name,
      );
    } else {
      throw new BadRequestException(
        'Vector element requires either `vectorValues` (number[]) or `vectorFp32` (base64 string).',
      );
    }

    if (element.attributes !== undefined) {
      args.push('SETATTR', element.attributes);
    }

    return args as RedisClientCommand;
  }

  private buildVsimCommand(
    keyName: Buffer | string,
    dto: SearchVectorSetDto,
  ): RedisClientCommand {
    const args: Array<string | number | Buffer> = [
      BrowserToolVectorSetCommands.VSim,
      keyName,
    ];

    // Exactly one of `elementName`, `vectorValues`, `vectorFp32` must be
    // present. DTO validation should already enforce this, but stay defensive
    // so any future internal caller that bypasses class-validator fails loudly.
    const hasElementName =
      dto.elementName !== undefined &&
      dto.elementName !== null &&
      ((typeof dto.elementName === 'string' && dto.elementName.length > 0) ||
        Buffer.isBuffer(dto.elementName));
    const hasVectorFp32 =
      typeof dto.vectorFp32 === 'string' && dto.vectorFp32.length > 0;
    const hasVectorValues =
      Array.isArray(dto.vectorValues) && dto.vectorValues.length > 0;

    const queryModeCount =
      Number(hasElementName) + Number(hasVectorFp32) + Number(hasVectorValues);

    if (queryModeCount > 1) {
      throw new BadRequestException(
        'Vector similarity search must supply exactly one of `elementName`, `vectorValues`, or `vectorFp32`.',
      );
    }
    if (queryModeCount === 0) {
      throw new BadRequestException(
        'Vector similarity search requires one of `elementName`, `vectorValues`, or `vectorFp32`.',
      );
    }

    if (hasElementName) {
      args.push('ELE', dto.elementName as string | Buffer);
    } else if (hasVectorFp32) {
      args.push('FP32', Buffer.from(dto.vectorFp32, 'base64'));
    } else {
      args.push(
        'VALUES',
        dto.vectorValues.length,
        ...dto.vectorValues.map(String),
      );
    }

    // WITHSCORES and WITHATTRIBS are always appended so the response shape is
    // stable; they are intentionally not part of the DTO.
    args.push('WITHSCORES', 'WITHATTRIBS');

    if (dto.count !== undefined) {
      args.push('COUNT', dto.count);
    }

    if (dto.filter !== undefined && dto.filter !== '') {
      args.push('FILTER', dto.filter);
    }

    return args as RedisClientCommand;
  }

  private parseVsimReply(
    reply: Array<string | Buffer | null> | null | undefined,
  ): SearchVectorSetMatchDto[] {
    if (!reply || reply.length === 0) {
      return [];
    }

    // Defensive: drop any trailing partial tuple. Redis is expected to always
    // return a multiple of `VSIM_REPLY_STRIDE`, so this only protects against
    // unexpected server-side bugs.
    const remainder = reply.length % VSIM_REPLY_STRIDE;
    const usableLength =
      remainder === 0 ? reply.length : reply.length - remainder;
    if (remainder !== 0) {
      this.logger.warn(
        `VSIM reply length ${reply.length} is not a multiple of ${VSIM_REPLY_STRIDE}; dropping trailing partial tuple.`,
      );
    }

    const matches: SearchVectorSetMatchDto[] = [];
    for (let i = 0; i < usableLength; i += VSIM_REPLY_STRIDE) {
      const name = reply[i] as string | Buffer;
      const rawScore = reply[i + 1];
      const rawAttributes = reply[i + 2];

      const score =
        typeof rawScore === 'number' ? rawScore : parseFloat(String(rawScore));

      const match: SearchVectorSetMatchDto = { name, score };
      if (rawAttributes !== null && rawAttributes !== undefined) {
        match.attributes =
          typeof rawAttributes === 'string'
            ? rawAttributes
            : String(rawAttributes);
      }
      matches.push(match);
    }
    return matches;
  }

  private async fetchElementDetails(
    client: RedisClient,
    keyName: Buffer | string,
    elementName: string,
  ): Promise<VectorSetElementDetailsDto> {
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

    return plainToInstance(VectorSetElementDetailsDto, {
      name: elementName,
      vector,
      vectorTruncated: vectorTruncated || undefined,
      attributes: (rawAttr as string) || undefined,
    });
  }
}
