import { uniq } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { catchRedisSearchError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import { plainToInstance } from 'class-transformer';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient } from 'src/modules/redis/client';
import {
  IndexInfoDto,
  IndexSummaryDto,
  KeyIndexesDto,
  KeyIndexesResponse,
} from './dto';
import { convertIndexInfoReply } from '../utils/redisIndexInfo';
import { getShards } from '../utils';

interface IndexEntry {
  name: string;
  info: IndexInfoDto;
}

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

      const indexNames = await this.listIndexNames(client);
      const entries = await this.fetchIndexesInfo(client, indexNames);
      const matchingIndexes = this.findMatchingIndexes(keyStr, entries);

      return plainToInstance(KeyIndexesResponse, { indexes: matchingIndexes });
    } catch (e) {
      this.logger.error('Failed to get indexes for key', e, clientMetadata);

      throw catchRedisSearchError(e);
    }
  }

  private async listIndexNames(client: RedisClient): Promise<string[]> {
    const nodes = await getShards(client);

    const listResults = await Promise.all(
      nodes.map(async (node) => node.sendCommand(['FT._LIST'])),
    );

    return uniq(
      (listResults.flat() as Buffer[]).map((idx) => idx.toString('hex')),
    ).map((hex) => Buffer.from(hex, 'hex').toString('utf8'));
  }

  private async fetchIndexesInfo(
    client: RedisClient,
    indexNames: string[],
  ): Promise<IndexEntry[]> {
    const results = await Promise.allSettled(
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

    return results
      .filter(
        (r): r is PromiseFulfilledResult<IndexEntry> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value);
  }

  private findMatchingIndexes(
    keyStr: string,
    entries: IndexEntry[],
  ): IndexSummaryDto[] {
    const matching: IndexSummaryDto[] = [];

    for (const { name, info } of entries) {
      const { index_definition: definition } = info;

      if (!definition) {
        continue;
      }

      const { prefixes = [], key_type: keyType = '' } = definition;

      const isMatch =
        prefixes.length === 0 || prefixes.some((p) => keyStr.startsWith(p));

      if (isMatch) {
        matching.push(
          plainToInstance(IndexSummaryDto, {
            name,
            prefixes,
            key_type: keyType,
          }),
        );
      }
    }

    return matching;
  }
}
