import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { chunk } from 'lodash';
import { catchAclError, catchMultiTransactionError } from 'src/utils';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BrowserToolVectorSetCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import {
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  VectorSetElementDto,
} from 'src/modules/browser/vector-set/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
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

      // Fetch embeddings and attributes for each element using pipelining
      const elements = await this.fetchElementDetails(
        client,
        keyName,
        elementNames,
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

  private async fetchElementDetails(
    client: RedisClient,
    keyName: Buffer | string,
    elementNames: string[],
  ): Promise<VectorSetElementDto[]> {
    if (!elementNames.length) {
      return [];
    }

    // Build pipeline commands for VEMB and VGETATTR
    const pipelineCommands: RedisClientCommand[] = [];
    for (const name of elementNames) {
      pipelineCommands.push([BrowserToolVectorSetCommands.VEmb, keyName, name]);
      pipelineCommands.push([
        BrowserToolVectorSetCommands.VGetAttr,
        keyName,
        name,
      ]);
    }

    const results = await client.sendPipeline(pipelineCommands);

    const resultPairs = chunk(results, 2);

    return elementNames.map((name, i) => {
      const [embResult, attrResult] = resultPairs[i];

      const vector = embResult[1]
        ? (embResult[1] as string[]).map((v) => parseFloat(v))
        : undefined;

      const attributes = attrResult[1] as string | undefined;

      return plainToInstance(VectorSetElementDto, {
        name,
        vector,
        attributes: attributes || undefined,
      });
    });
  }
}
