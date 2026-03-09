import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { catchAclError } from 'src/utils';
import { RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BrowserToolVectorSetCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { plainToInstance } from 'class-transformer';
import { ClientMetadata } from 'src/common/models';
import {
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  VectorSetElementDto,
} from 'src/modules/browser/vector-set/dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient, RedisClientCommand } from 'src/modules/redis/client';

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

      if (!total && total !== 0) {
        this.logger.error(
          `Failed to get elements of the VectorSet data type. Not Found key: ${keyName}.`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST),
        );
      }

      // Get element names using VRANGE
      const elementNames = (await client.sendCommand([
        BrowserToolVectorSetCommands.VRange,
        keyName,
        start || '-',
        end || '+',
        count,
      ])) as string[];

      // Fetch embeddings and attributes for each element using pipelining
      const elements = await this.fetchElementDetails(
        client,
        keyName,
        elementNames,
      );

      // Determine next cursor for pagination
      let nextCursor: string | undefined;
      if (elementNames.length === count && elementNames.length > 0) {
        // Use exclusive range starting after last element
        nextCursor = `(${elementNames[elementNames.length - 1]}`;
      }

      this.logger.debug(
        'Succeed to get elements of the VectorSet data type.',
        clientMetadata,
      );
      return plainToInstance(GetVectorSetElementsResponse, {
        keyName,
        total,
        nextCursor,
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

    // Parse results: each element has 2 results (VEMB, VGETATTR)
    const elements: VectorSetElementDto[] = [];
    for (let i = 0; i < elementNames.length; i++) {
      const name = elementNames[i];
      const embResult = results[i * 2];
      const attrResult = results[i * 2 + 1];

      // embResult is [error, value], parse vector values
      const vector = embResult[1]
        ? (embResult[1] as string[]).map((v) => parseFloat(v))
        : undefined;

      // attrResult is [error, value]
      const attributes = attrResult[1] as string | undefined;

      elements.push(
        plainToInstance(VectorSetElementDto, {
          name,
          vector,
          attributes: attributes || undefined,
        }),
      );
    }

    return elements;
  }
}
