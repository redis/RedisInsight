import { uniq } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { catchRedisSearchError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import { plainToInstance } from 'class-transformer';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  RedisClient,
  RedisClientConnectionType,
  RedisClientNodeRole,
} from 'src/modules/redis/client';
import {
  IndexInfoDto,
  IndexSummaryDto,
  KeyIndexesDto,
  KeyIndexesResponse,
} from './dto';
import { convertIndexInfoReply } from '../utils/redisIndexInfo';

@Injectable()
export class KeyIndexesService {
  private logger = new Logger('KeyIndexesService');

  constructor(private databaseClientFactory: DatabaseClientFactory) {}

  /**
   * Find all indexes whose prefixes cover the given key.
   * An index with no prefixes matches all keys of its key_type.
   */
  public async getKeyIndexes(
    clientMetadata: ClientMetadata,
    dto: KeyIndexesDto,
  ): Promise<KeyIndexesResponse> {
    this.logger.debug('Getting indexes for key.', clientMetadata);

    try {
      const { key } = dto;
      const keyStr = key instanceof Buffer ? key.toString('utf8') : String(key);

      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const nodes = (await this.getShards(client)) as RedisClient[];

      const listResults = await Promise.all(
        nodes.map(async (node) => node.sendCommand(['FT._LIST'])),
      );

      const indexNames: string[] = uniq(
        (listResults.flat() as Buffer[]).map((idx) => idx.toString('utf8')),
      );

      const matchingIndexes: IndexSummaryDto[] = [];

      const infoResults = await Promise.allSettled(
        indexNames.map(async (name) => {
          const infoReply = (await client.sendCommand(['FT.INFO', name], {
            replyEncoding: 'utf8',
          })) as string[][];

          return {
            name,
            info: convertIndexInfoReply(infoReply) as IndexInfoDto,
          };
        }),
      );

      for (const result of infoResults) {
        if (result.status !== 'fulfilled') {
          continue;
        }

        const { name, info } = result.value;
        const { index_definition: definition } = info;

        if (!definition) {
          continue;
        }

        const { prefixes = [], key_type: keyType = '' } = definition;

        const isMatch =
          prefixes.length === 0 || prefixes.some((p) => keyStr.startsWith(p));

        if (isMatch) {
          matchingIndexes.push(
            plainToInstance(IndexSummaryDto, {
              name,
              prefixes,
              key_type: keyType,
            }),
          );
        }
      }

      return plainToInstance(KeyIndexesResponse, { indexes: matchingIndexes });
    } catch (e) {
      this.logger.error('Failed to get indexes for key', e, clientMetadata);

      throw catchRedisSearchError(e);
    }
  }

  private async getShards(client: RedisClient): Promise<RedisClient[]> {
    if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
      return client.nodes(RedisClientNodeRole.PRIMARY);
    }

    return [client];
  }
}
