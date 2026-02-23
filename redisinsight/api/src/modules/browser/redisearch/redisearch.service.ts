import { isUndefined, toNumber, uniq } from 'lodash';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { catchRedisSearchError } from 'src/utils';
import { ClientMetadata } from 'src/common/models';
import {
  CreateRedisearchIndexDto,
  IndexInfoDto,
  IndexInfoRequestBodyDto,
  ListRedisearchIndexesResponse,
  SearchRedisearchDto,
} from 'src/modules/browser/redisearch/dto';
import { GetKeysWithDetailsResponse } from 'src/modules/browser/keys/dto';
import { DEFAULT_MATCH } from 'src/constants';
import { plainToInstance } from 'class-transformer';
import { BrowserHistoryMode, RedisString } from 'src/common/constants';
import { CreateBrowserHistoryDto } from 'src/modules/browser/browser-history/dto';
import { BrowserHistoryService } from 'src/modules/browser/browser-history/browser-history.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { QueryLibraryService } from 'src/modules/query-library/query-library.service';
import {
  RedisClient,
  RedisClientCommandArgument,
} from 'src/modules/redis/client';
import { convertIndexInfoReply } from '../utils/redisIndexInfo';
import { getShards } from '../utils';
import { IndexDeleteRequestBodyDto } from './dto/index.delete.dto';

@Injectable()
export class RedisearchService {
  private maxSearchResults: Map<string, null | number> = new Map();

  private logger = new Logger('RedisearchService');

  constructor(
    private databaseClientFactory: DatabaseClientFactory,
    private browserHistory: BrowserHistoryService,
    private queryLibraryService: QueryLibraryService,
  ) {}

  /**
   * Get list of all available redisearch indexes
   * @param clientMetadata
   */
  public async list(
    clientMetadata: ClientMetadata,
  ): Promise<ListRedisearchIndexesResponse> {
    this.logger.debug('Getting all redisearch indexes.', clientMetadata);

    try {
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);
      const nodes = await getShards(client);

      const res = await Promise.all(
        nodes.map(async (node) => node.sendCommand(['FT._LIST'])),
      );

      return plainToInstance(ListRedisearchIndexesResponse, {
        indexes: uniq([].concat(...res).map((idx) => idx.toString('hex'))).map(
          (idx) => Buffer.from(idx, 'hex'),
        ),
      });
    } catch (e) {
      this.logger.error('Failed to get redisearch indexes', e, clientMetadata);

      throw catchRedisSearchError(e);
    }
  }

  /**
   * Creates redisearch index
   * @param clientMetadata
   * @param dto
   */
  public async createIndex(
    clientMetadata: ClientMetadata,
    dto: CreateRedisearchIndexDto,
  ): Promise<void> {
    this.logger.debug('Creating redisearch index.', clientMetadata);

    try {
      const { index, type, prefixes, fields } = dto;

      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      try {
        const indexInfo = await client.sendCommand(['FT.INFO', index], {
          replyEncoding: 'utf8',
        });

        if (indexInfo) {
          this.logger.error(
            `Failed to create redisearch index. ${ERROR_MESSAGES.REDISEARCH_INDEX_EXIST}`,
            clientMetadata,
          );
          return Promise.reject(
            new ConflictException(ERROR_MESSAGES.REDISEARCH_INDEX_EXIST),
          );
        }
      } catch (error) {
        const noIndexMessages = ['unknown index name', 'no such index'];

        if (
          !noIndexMessages.some((keyword) =>
            error.message?.toLowerCase().includes(keyword),
          )
        ) {
          throw error;
        }
      }

      const nodes = await getShards(client);

      const commandArgs: any[] = [index, 'ON', type];

      if (prefixes && prefixes.length) {
        commandArgs.push('PREFIX', prefixes.length, ...prefixes);
      }

      commandArgs.push(
        'SCHEMA',
        ...[].concat(...fields.map((field) => [field.name, field.type])),
      );

      await Promise.all(
        nodes.map(async (node) => {
          try {
            await node.sendCommand(['FT.CREATE', ...commandArgs], {
              replyEncoding: 'utf8',
            });
          } catch (e) {
            if (
              !e.message.includes('MOVED') &&
              !e.message.includes('already exists')
            ) {
              throw e;
            }
          }
        }),
      );

      return undefined;
    } catch (e) {
      this.logger.error('Failed to create redisearch index', e, clientMetadata);

      throw catchRedisSearchError(e);
    }
  }

  /**
   * Gets the info of a given index
   * @param clientMetadata
   * @param dto
   */
  public async getInfo(
    clientMetadata: ClientMetadata,
    dto: IndexInfoRequestBodyDto,
  ): Promise<IndexInfoDto> {
    this.logger.debug('Getting index info', clientMetadata);

    try {
      const { index } = dto;

      if (!index) {
        throw new Error('Index was not provided');
      }

      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const infoReply = (await client.sendCommand(['FT.INFO', index], {
        replyEncoding: 'utf8',
      })) as string[][];

      return plainToInstance(IndexInfoDto, convertIndexInfoReply(infoReply));
    } catch (e) {
      this.logger.error('Failed to get index info', e, clientMetadata);

      throw catchRedisSearchError(e);
    }
  }

  /**
   * Search for key names using RediSearch module
   * Response is the same as for keys "scan" to have the same behaviour in the browser
   * @param clientMetadata
   * @param dto
   */
  public async search(
    clientMetadata: ClientMetadata,
    dto: SearchRedisearchDto,
  ): Promise<GetKeysWithDetailsResponse> {
    this.logger.debug('Searching keys using redisearch.', clientMetadata);

    try {
      const { index, query, offset, limit } = dto;

      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      if (isUndefined(this.maxSearchResults.get(clientMetadata.databaseId))) {
        try {
          const [[, maxSearchResults]] = (await client.sendCommand(
            ['FT.CONFIG', 'GET', 'MAXSEARCHRESULTS'],
            { replyEncoding: 'utf8' },
          )) as [[string, string]];

          this.maxSearchResults.set(
            clientMetadata.databaseId,
            toNumber(maxSearchResults),
          );
        } catch (error) {
          this.maxSearchResults.set(clientMetadata.databaseId, null);
        }
      }
      // Workaround: recalculate limit to not query more then MAXSEARCHRESULTS
      let safeLimit = limit;
      const maxSearchResult = this.maxSearchResults.get(
        clientMetadata.databaseId,
      );

      if (maxSearchResult && offset + limit > maxSearchResult) {
        safeLimit =
          offset <= maxSearchResult ? maxSearchResult - offset : limit;
      }

      const [total, ...keyNames] = (await client.sendCommand([
        'FT.SEARCH',
        index,
        query,
        'NOCONTENT',
        'LIMIT',
        offset,
        safeLimit,
      ])) as [number, RedisString[]];

      let type;
      if (keyNames.length) {
        type = await client.sendCommand(
          ['TYPE', keyNames[0] as unknown as RedisClientCommandArgument],
          { replyEncoding: 'utf8' },
        );
      }

      // Do not save default match "*"
      if (query !== DEFAULT_MATCH) {
        await this.browserHistory.create(
          clientMetadata,
          plainToInstance(CreateBrowserHistoryDto, {
            filter: { match: query, type: null },
            mode: BrowserHistoryMode.Redisearch,
          }),
        );
      }

      return plainToInstance(GetKeysWithDetailsResponse, {
        cursor: limit + offset >= total ? 0 : limit + offset,
        total,
        scanned: keyNames.length + offset,
        keys: keyNames.map((name) => ({ name, type })),
        maxResults: maxSearchResult,
      });
    } catch (e) {
      this.logger.error(
        'Failed to search keys using redisearch index',
        e,
        clientMetadata,
      );

      throw catchRedisSearchError(e, { searchLimit: dto.limit });
    }
  }

  public async deleteIndex(
    clientMetadata: ClientMetadata,
    dto: IndexDeleteRequestBodyDto,
  ): Promise<void> {
    this.logger.debug('Deleting redisearch index ', clientMetadata);

    try {
      const { index } = dto;
      const client: RedisClient =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      await client.sendCommand(['FT.DROPINDEX', index], {
        replyEncoding: 'utf8',
      });

      try {
        const indexName =
          index instanceof Buffer ? index.toString('utf8') : String(index);
        await this.queryLibraryService.deleteByIndex(
          clientMetadata.sessionMetadata,
          clientMetadata.databaseId,
          indexName,
        );
      } catch (e) {
        this.logger.error(
          'Failed to cleanup query library items after index deletion',
          e,
          clientMetadata,
        );
      }

      this.logger.debug(
        'Successfully deleted redisearch index ',
        clientMetadata,
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete redisearch index ',
        error,
        clientMetadata,
      );

      throw catchRedisSearchError(error);
    }
  }
}
