import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  BrowserToolKeysCommands,
  BrowserToolVectorSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { ClientMetadata } from 'src/common/models';
import { RedisString } from 'src/common/constants';
import {
  CreateVectorSetWithExpireDto,
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SearchVectorSetDto,
  SearchVectorSetResponse,
  GetVectorSetElementDetailsDto,
  UpdateVectorSetElementAttributesDto,
  VectorSetElementResponse,
  SearchResultDto,
} from 'src/modules/browser/vector-set/dto';
import {
  VectorFormat,
  VectorSearchQueryType,
} from 'src/modules/browser/vector-set/constants';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  checkIfKeyExists,
  checkIfKeyNotExists,
} from 'src/modules/browser/utils';
import { RedisClient, RedisClientCommand } from 'src/modules/redis/client';

const DEFAULT_COUNT = 10;

@Injectable()
export class VectorSetService {
  private logger = new Logger('VectorSetService');

  // Cache VRANGE support per client to avoid repeated attempts
  // true = VRANGE supported, false = use VRANDMEMBER
  private vrangeSupportCache = new Map<string, boolean>();

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  /**
   * Get elements using VRANGE (Redis 8.4+)
   * Returns null if VRANGE is not available
   */
  private async getElementsWithVRange(
    client: RedisClient,
    keyName: RedisString,
    count: number,
  ): Promise<{ total: number; elementNames: string[] } | null> {
    try {
      // VRANGE syntax: VRANGE key start end [count]
      const [[, total], [, elementNames]] = (await client.sendPipeline([
        [BrowserToolVectorSetCommands.VCard, keyName],
        [
          BrowserToolVectorSetCommands.VRange,
          keyName,
          '-', // start: minimum
          '+', // end: maximum
          count.toString(),
        ],
      ])) as [[any, number], [any, string[]]];

      return { total, elementNames: elementNames || [] };
    } catch (error) {
      const message = error.message || '';
      // If VRANGE is unknown command, return null to trigger fallback
      if (message.includes('unknown command')) {
        return null;
      }
      // Other errors should propagate
      throw error;
    }
  }

  /**
   * Get elements using VRANDMEMBER (Redis 8.0+)
   * IMPORTANT: Always uses positive count to avoid duplicates
   * "When called with a negative count, returns that many elements, possibly with duplicates"
   */
  private async getElementsWithVRandMember(
    client: RedisClient,
    keyName: RedisString,
    count: number,
  ): Promise<{ total: number; elementNames: string[] }> {
    // Use absolute value of count to avoid duplicates
    const positiveCount = Math.abs(count);

    const [[, total], [, elementNames]] = (await client.sendPipeline([
      [BrowserToolVectorSetCommands.VCard, keyName],
      [
        BrowserToolVectorSetCommands.VRandMember,
        keyName,
        positiveCount.toString(),
      ],
    ])) as [[any, number], [any, string[]]];

    return { total, elementNames: elementNames || [] };
  }

  /**
   * Create a new vector set with elements
   */
  public async createVectorSet(
    clientMetadata: ClientMetadata,
    dto: CreateVectorSetWithExpireDto,
  ): Promise<void> {
    try {
      this.logger.debug('Creating VectorSet data type.', clientMetadata);
      const { keyName, elements, expire } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyExists(keyName, client);

      // Build VADD commands for each element
      // VADD syntax: VADD key (FP32 | VALUES count) vector element [options]
      const commands: RedisClientCommand[] = elements.map((element) => {
        const format = element.format ?? VectorFormat.VALUES;

        if (format === VectorFormat.FP32) {
          // FP32 format: binary blob
          const vectorBlob = element.vector as RedisString;
          return [
            BrowserToolVectorSetCommands.VAdd,
            keyName,
            'FP32',
            vectorBlob,
            element.name,
          ];
        }

        // VALUES format: array of numbers
        const vectorArray = element.vector as number[];
        return [
          BrowserToolVectorSetCommands.VAdd,
          keyName,
          'VALUES',
          vectorArray.length.toString(),
          ...vectorArray.map(String),
          element.name,
        ];
      });

      // Add EXPIRE command if needed
      if (expire) {
        commands.push([BrowserToolKeysCommands.Expire, keyName, expire]);
      }

      const transactionResults = await client.sendPipeline(commands);
      catchMultiTransactionError(transactionResults);

      this.logger.debug(
        'Succeed to create VectorSet data type.',
        clientMetadata,
      );
    } catch (error) {
      if (error?.message.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      this.logger.error(
        'Failed to create VectorSet data type.',
        error,
        clientMetadata,
      );
      throw catchAclError(error);
    }
  }

  /**
   * Get elements from a vector set (names only for initial load)
   * Uses VRANGE (Redis 8.4+) or VRANDMEMBER (Redis 8.0-8.3) based on availability
   */
  public async getElements(
    clientMetadata: ClientMetadata,
    dto: GetVectorSetElementsDto,
  ): Promise<GetVectorSetElementsResponse> {
    try {
      this.logger.debug(
        'Getting elements of the VectorSet data type stored at key.',
        clientMetadata,
      );
      const { keyName, count = DEFAULT_COUNT } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const clientId = client.id;
      let result: { total: number; elementNames: string[] };
      let usedCommand: 'VRANGE' | 'VRANDMEMBER';

      // Check cache for VRANGE support
      const cachedVRangeSupport = this.vrangeSupportCache.get(clientId);

      if (cachedVRangeSupport === false) {
        // Known: VRANGE not supported, use VRANDMEMBER directly
        result = await this.getElementsWithVRandMember(client, keyName, count);
        usedCommand = 'VRANDMEMBER';
      } else {
        // Try VRANGE first (either cached as supported, or unknown)
        const vrangeResult = await this.getElementsWithVRange(
          client,
          keyName,
          count,
        );

        if (vrangeResult !== null) {
          // VRANGE succeeded
          this.vrangeSupportCache.set(clientId, true);
          result = vrangeResult;
          usedCommand = 'VRANGE';
        } else {
          // VRANGE not available, fallback to VRANDMEMBER
          this.vrangeSupportCache.set(clientId, false);
          result = await this.getElementsWithVRandMember(
            client,
            keyName,
            count,
          );
          usedCommand = 'VRANDMEMBER';
        }
      }

      const { total, elementNames } = result;

      if (total === 0 || total === null) {
        throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
      }

      const elements = elementNames.map((name) =>
        plainToInstance(VectorSetElementResponse, { name }),
      );

      this.logger.debug(
        `Succeed to get elements using ${usedCommand}.`,
        clientMetadata,
      );

      return plainToInstance(GetVectorSetElementsResponse, {
        keyName,
        total,
        elements,
      });
    } catch (error) {
      this.logger.error(
        'Failed to get elements of the VectorSet data type.',
        error,
        clientMetadata,
      );
      if (error.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  /**
   * Delete elements from a vector set
   */
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

      // VREM each element
      const commands: RedisClientCommand[] = elements.map((element) => [
        BrowserToolVectorSetCommands.VRem,
        keyName,
        element,
      ]);

      const results = await client.sendPipeline(commands);
      const affected = results.reduce(
        (sum, [err, result]) => sum + (err ? 0 : (result as number)),
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
      if (error.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  /**
   * Search vector set using similarity search (VSIM)
   */
  public async search(
    clientMetadata: ClientMetadata,
    dto: SearchVectorSetDto,
  ): Promise<SearchVectorSetResponse> {
    try {
      this.logger.debug(
        'Searching VectorSet for similar elements.',
        clientMetadata,
      );
      const {
        keyName,
        queryType = VectorSearchQueryType.VALUES,
        element,
        vector,
        count = 10,
        ef,
        filter,
        withScores = true,
        withAttribs = false,
      } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      // Build VSIM command based on query type
      const command: RedisClientCommand = [
        BrowserToolVectorSetCommands.VSim,
        keyName,
      ];

      // Add query based on type
      switch (queryType) {
        case VectorSearchQueryType.ELE:
          command.push('ELE', element);
          break;
        case VectorSearchQueryType.FP32:
          command.push('FP32', vector as RedisString);
          break;
        case VectorSearchQueryType.VALUES:
        default:
          const vectorArray = vector as number[];
          command.push('VALUES', vectorArray.length.toString());
          command.push(...vectorArray.map(String));
          break;
      }

      // Add COUNT
      command.push('COUNT', count.toString());

      // Add optional EF parameter
      if (ef !== undefined) {
        command.push('EF', ef.toString());
      }

      // Add optional filter
      if (filter) {
        command.push('FILTER', filter);
      }

      // Add WITHSCORES if requested
      if (withScores) {
        command.push('WITHSCORES');
      }

      // Add WITHATTRIBS if requested
      if (withAttribs) {
        command.push('WITHATTRIBS');
      }

      const response = (await client.sendCommand(command)) as string[];

      // Parse response based on options
      const results = this.parseSearchResponse(
        response,
        withScores,
        withAttribs,
      );

      this.logger.debug('Succeed to search VectorSet.', clientMetadata);

      return plainToInstance(SearchVectorSetResponse, {
        keyName,
        results,
      });
    } catch (error) {
      this.logger.error('Failed to search VectorSet.', error, clientMetadata);
      if (error.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  /**
   * Parse VSIM response based on options
   */
  private parseSearchResponse(
    response: RedisString[],
    withScores: boolean,
    withAttribs: boolean,
  ): SearchResultDto[] {
    const results: SearchResultDto[] = [];
    if (!response) return results;

    // Determine step size based on options
    // No options: [name1, name2, ...]
    // WITHSCORES: [name1, score1, name2, score2, ...]
    // WITHATTRIBS: [name1, attrs1, name2, attrs2, ...]
    // WITHSCORES + WITHATTRIBS: [name1, score1, attrs1, name2, score2, attrs2, ...]
    let step = 1;
    if (withScores) step += 1;
    if (withAttribs) step += 1;

    for (let i = 0; i < response.length; i += step) {
      const resultData: {
        name: RedisString;
        score?: number;
        attributes?: Record<string, any>;
      } = {
        name: response[i],
      };

      let offset = 1;
      if (withScores) {
        resultData.score = parseFloat(String(response[i + offset]));
        offset += 1;
      }
      if (withAttribs) {
        const attrsJson = response[i + offset];
        resultData.attributes = attrsJson ? JSON.parse(String(attrsJson)) : null;
      }

      results.push(plainToInstance(SearchResultDto, resultData));
    }

    return results;
  }

  /**
   * Get element vector (VEMB)
   */
  public async getElementVector(
    clientMetadata: ClientMetadata,
    dto: GetVectorSetElementDetailsDto,
  ): Promise<{ vector: number[] }> {
    try {
      this.logger.debug(
        'Getting element vector from VectorSet.',
        clientMetadata,
      );
      const { keyName, element } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const response = (await client.sendCommand([
        BrowserToolVectorSetCommands.VEmb,
        keyName,
        element,
      ])) as string[];

      if (!response) {
        throw new NotFoundException('Element not found in vector set');
      }

      // VEMB returns array of floats as strings
      const vector = response.map((v) => parseFloat(v));

      this.logger.debug('Succeed to get element vector.', clientMetadata);

      return { vector };
    } catch (error) {
      this.logger.error('Failed to get element vector.', error, clientMetadata);
      if (error.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  /**
   * Get element attributes (VGETATTR)
   */
  public async getElementAttributes(
    clientMetadata: ClientMetadata,
    dto: GetVectorSetElementDetailsDto,
  ): Promise<{ attributes: Record<string, any> | null }> {
    try {
      this.logger.debug(
        'Getting element attributes from VectorSet.',
        clientMetadata,
      );
      const { keyName, element } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await checkIfKeyNotExists(keyName, client);

      const response = (await client.sendCommand([
        BrowserToolVectorSetCommands.VGetAttr,
        keyName,
        element,
      ])) as string | null;

      // VGETATTR returns JSON string or null
      const attributes = response ? JSON.parse(response) : null;

      this.logger.debug('Succeed to get element attributes.', clientMetadata);

      return { attributes };
    } catch (error) {
      this.logger.error(
        'Failed to get element attributes.',
        error,
        clientMetadata,
      );
      if (error.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }

  /**
   * Update element attributes (VSETATTR)
   */
  public async updateElementAttributes(
    clientMetadata: ClientMetadata,
    dto: UpdateVectorSetElementAttributesDto,
  ): Promise<void> {
    try {
      this.logger.debug(
        'Updating element attributes in VectorSet.',
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
        JSON.stringify(attributes),
      ]);

      this.logger.debug(
        'Succeed to update element attributes.',
        clientMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to update element attributes.',
        error,
        clientMetadata,
      );
      if (error.message?.includes(RedisErrorCodes.WrongType)) {
        throw new BadRequestException(error.message);
      }
      throw catchAclError(error);
    }
  }
}
