import { Injectable, Logger } from '@nestjs/common';
import { get } from 'lodash';
import * as semverCompare from 'node-version-compare';
import { checkTimestamp } from 'src/utils';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { Key } from 'src/modules/database-analysis/models';
import {
  RedisString,
  LUA_SCRIPT_RECOMMENDATION_COUNT,
  BIG_HASHES_RECOMMENDATION_LENGTH,
  USE_SMALLER_KEYS_RECOMMENDATION_TOTAL,
  COMPRESS_HASH_FIELD_NAMES_RECOMMENDATION_LENGTH,
  COMBINE_SMALL_STRINGS_TO_HASHES_RECOMMENDATION_MEMORY,
  COMBINE_SMALL_STRINGS_TO_HASHES_RECOMMENDATION_KEYS_COUNT,
  COMPRESSION_FOR_LIST_RECOMMENDATION_LENGTH,
  BIG_SETS_RECOMMENDATION_LENGTH,
  BIG_AMOUNT_OF_CONNECTED_CLIENTS_RECOMMENDATION_CLIENTS,
  BIG_STRINGS_RECOMMENDATION_MEMORY,
  REDIS_VERSION_RECOMMENDATION_VERSION,
  SEARCH_INDEXES_RECOMMENDATION_KEYS_FOR_CHECK,
  SEARCH_HASH_RECOMMENDATION_KEYS_FOR_CHECK,
  SEARCH_HASH_RECOMMENDATION_KEYS_LENGTH,
  RTS_KEYS_FOR_CHECK,
} from 'src/common/constants';
import { convertMultilineReplyToObject } from 'src/modules/redis/utils';
import {
  RedisClient,
  RedisClientConnectionType,
} from 'src/modules/redis/client';

@Injectable()
export class RecommendationProvider {
  private logger = new Logger('RecommendationProvider');

  /**
   * Check lua script recommendation
   * @param redisClient
   */
  async determineLuaScriptRecommendation(
    redisClient: RedisClient,
  ): Promise<Recommendation> {
    try {
      const info = await redisClient.getInfo('memory');
      const nodesNumbersOfCachedScripts = get(
        info,
        'memory.number_of_cached_scripts',
      );

      return parseInt(nodesNumbersOfCachedScripts, 10) >
        LUA_SCRIPT_RECOMMENDATION_COUNT
        ? { name: RECOMMENDATION_NAMES.LUA_SCRIPT }
        : null;
    } catch (err) {
      this.logger.error('Can not determine Lua script recommendation', err);
      return null;
    }
  }

  /**
   * Check big hashes recommendation
   * @param keys
   */
  async determineBigHashesRecommendation(keys: Key[]): Promise<Recommendation> {
    try {
      const bigHash = keys.find(
        (key) =>
          key.type === RedisDataType.Hash &&
          key.length > BIG_HASHES_RECOMMENDATION_LENGTH,
      );
      return bigHash
        ? {
            name: RECOMMENDATION_NAMES.BIG_HASHES,
            params: { keys: [bigHash.name] },
          }
        : null;
    } catch (err) {
      this.logger.error('Can not determine Big Hashes recommendation', err);
      return null;
    }
  }

  /**
   * Check use smaller keys recommendation
   * @param total
   */
  async determineBigTotalRecommendation(
    total: number,
  ): Promise<Recommendation> {
    return total > USE_SMALLER_KEYS_RECOMMENDATION_TOTAL
      ? { name: RECOMMENDATION_NAMES.USE_SMALLER_KEYS }
      : null;
  }

  /**
   * Check logical databases recommendation
   * @param redisClient
   */
  async determineLogicalDatabasesRecommendation(
    redisClient: RedisClient,
  ): Promise<Recommendation> {
    if (redisClient.getConnectionType() === RedisClientConnectionType.CLUSTER) {
      return null;
    }
    try {
      const info = await redisClient.getInfo('keyspace');
      const keyspace = get(info, 'keyspace', {});
      const databasesWithKeys = Object.values(keyspace).filter((db) => {
        const { keys } = convertMultilineReplyToObject(db as string, ',', '=');
        return parseInt(keys, 10) > 0;
      });
      return databasesWithKeys.length > 1
        ? { name: RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine Logical database recommendation',
        err,
      );
      return null;
    }
  }

  /**
   * Check combine small strings to hashes recommendation
   * @param keys
   */
  async determineCombineSmallStringsToHashesRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const smallString = keys.filter(
        (key) =>
          key.type === RedisDataType.String &&
          key.memory < COMBINE_SMALL_STRINGS_TO_HASHES_RECOMMENDATION_MEMORY,
      );
      return smallString.length >=
        COMBINE_SMALL_STRINGS_TO_HASHES_RECOMMENDATION_KEYS_COUNT
        ? {
            name: RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES,
            params: { keys: [smallString[0].name] },
          }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine Combine small strings to hashes recommendation',
        err,
      );
      return null;
    }
  }

  /**
   * Check increase set max intset entries recommendation
   * @param keys
   * @param redisClient
   */
  async determineIncreaseSetMaxIntsetEntriesRecommendation(
    redisClient: RedisClient,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const [, setMaxIntsetEntries] = (await redisClient.sendCommand(
        ['config', 'get', 'set-max-intset-entries'],
        { replyEncoding: 'utf8' },
      )) as string[];

      if (!setMaxIntsetEntries) {
        return null;
      }
      const setMaxIntsetEntriesNumber = parseInt(setMaxIntsetEntries, 10);
      const bigSet = keys.find(
        (key) =>
          key.type === RedisDataType.Set &&
          key.length > setMaxIntsetEntriesNumber,
      );
      return bigSet
        ? {
            name: RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES,
            params: { keys: [bigSet.name] },
          }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine Increase set max intset entries recommendation',
        err,
      );
      return null;
    }
  }
  /**
   * Check convert hashtable to ziplist recommendation
   * @param keys
   * @param redisClient
   */

  async determineHashHashtableToZiplistRecommendation(
    redisClient: RedisClient,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const [, hashMaxZiplistEntries] = (await redisClient.sendCommand(
        ['config', 'get', 'hash-max-ziplist-entries'],
        { replyEncoding: 'utf8' },
      )) as string[];
      const hashMaxZiplistEntriesNumber = parseInt(hashMaxZiplistEntries, 10);
      const bigHash = keys.find(
        (key) =>
          key.type === RedisDataType.Hash &&
          key.length > hashMaxZiplistEntriesNumber,
      );
      return bigHash
        ? {
            name: RECOMMENDATION_NAMES.HASH_HASHTABLE_TO_ZIPLIST,
            params: { keys: [bigHash.name] },
          }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine Convert hashtable to ziplist recommendation',
        err,
      );
      return null;
    }
  }

  /**
   * Check compress hash field names recommendation
   * @param keys
   */
  async determineCompressHashFieldNamesRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigHash = keys.find(
        (key) =>
          key.type === RedisDataType.Hash &&
          key.length > COMPRESS_HASH_FIELD_NAMES_RECOMMENDATION_LENGTH,
      );
      return bigHash
        ? {
            name: RECOMMENDATION_NAMES.COMPRESS_HASH_FIELD_NAMES,
            params: { keys: [bigHash.name] },
          }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine Compress hash field names recommendation',
        err,
      );
      return null;
    }
  }

  /**
   * Check compression for list recommendation
   * @param keys
   */
  async determineCompressionForListRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigList = keys.find(
        (key) =>
          key.type === RedisDataType.List &&
          key.length > COMPRESSION_FOR_LIST_RECOMMENDATION_LENGTH,
      );
      return bigList
        ? {
            name: RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST,
            params: { keys: [bigList.name] },
          }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine Compression for list recommendation',
        err,
      );
      return null;
    }
  }

  /**
   * Check big strings recommendation
   * @param keys
   */
  async determineBigStringsRecommendation(
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const bigString = keys.find(
        (key) =>
          key.type === RedisDataType.String &&
          key.memory > BIG_STRINGS_RECOMMENDATION_MEMORY,
      );
      return bigString
        ? {
            name: RECOMMENDATION_NAMES.BIG_STRINGS,
            params: { keys: [bigString.name] },
          }
        : null;
    } catch (err) {
      this.logger.error('Can not determine Big strings recommendation', err);
      return null;
    }
  }

  /**
   * Check zSet hashtable to ziplist recommendation
   * @param keys
   * @param redisClient
   */

  async determineZSetHashtableToZiplistRecommendation(
    redisClient: RedisClient,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      const [, zSetMaxZiplistEntries] = (await redisClient.sendCommand(
        ['config', 'get', 'zset-max-ziplist-entries'],
        { replyEncoding: 'utf8' },
      )) as string[];
      const zSetMaxZiplistEntriesNumber = parseInt(zSetMaxZiplistEntries, 10);
      const bigHash = keys.find(
        (key) =>
          key.type === RedisDataType.ZSet &&
          key.length > zSetMaxZiplistEntriesNumber,
      );
      return bigHash
        ? {
            name: RECOMMENDATION_NAMES.ZSET_HASHTABLE_TO_ZIPLIST,
            params: { keys: [bigHash.name] },
          }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine ZSet hashtable to ziplist recommendation',
        err,
      );
      return null;
    }
  }

  /**
   * Check big sets recommendation
   * @param keys
   */

  async determineBigSetsRecommendation(keys: Key[]): Promise<Recommendation> {
    try {
      const bigSet = keys.find(
        (key) =>
          key.type === RedisDataType.Set &&
          key.length > BIG_SETS_RECOMMENDATION_LENGTH,
      );
      return bigSet
        ? {
            name: RECOMMENDATION_NAMES.BIG_SETS,
            params: { keys: [bigSet.name] },
          }
        : null;
    } catch (err) {
      this.logger.error('Can not determine Big sets recommendation', err);
      return null;
    }
  }

  /**
   * Check big connected clients recommendation
   * @param redisClient
   */

  async determineConnectionClientsRecommendation(
    redisClient: RedisClient,
  ): Promise<Recommendation> {
    try {
      const info = await redisClient.getInfo('clients');
      const connectedClients = parseInt(
        get(info, 'clients.connected_clients'),
        10,
      );

      return connectedClients >
        BIG_AMOUNT_OF_CONNECTED_CLIENTS_RECOMMENDATION_CLIENTS
        ? { name: RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS }
        : null;
    } catch (err) {
      this.logger.error(
        'Can not determine Connection clients recommendation',
        err,
      );
      return null;
    }
  }

  /**
   * Check search JSON recommendation
   * @param keys
   * @param indexes
   */
  async determineSearchJSONRecommendation(
    keys: Key[],
    indexes?: string[],
  ): Promise<Recommendation> {
    try {
      if (indexes?.length) {
        return null;
      }
      const jsonKey = keys.find((key) => key.type === RedisDataType.JSON);

      return jsonKey
        ? {
            name: RECOMMENDATION_NAMES.SEARCH_JSON,
            params: { keys: [jsonKey.name] },
          }
        : null;
    } catch (err) {
      this.logger.error('Can not determine search json recommendation', err);
      return null;
    }
  }

  /**
   * Check redis version recommendation
   * @param redisClient
   */

  async determineRedisVersionRecommendation(
    redisClient: RedisClient,
  ): Promise<Recommendation> {
    try {
      const info = await redisClient.getInfo('server');
      const version = get(info, 'server.redis_version');
      return semverCompare(version, REDIS_VERSION_RECOMMENDATION_VERSION) >= 0
        ? null
        : { name: RECOMMENDATION_NAMES.REDIS_VERSION };
    } catch (err) {
      this.logger.error('Can not determine redis version recommendation', err);
      return null;
    }
  }

  /**
   * Check set password recommendation
   * @param redisClient
   */

  async determineSetPasswordRecommendation(
    redisClient: RedisClient,
  ): Promise<Recommendation> {
    try {
      const users = (await redisClient.sendCommand(['acl', 'list'], {
        replyEncoding: 'utf8',
      })) as string[];

      const nopassUser = users.some((user) => user.split(' ')[3] === 'nopass');

      return nopassUser ? { name: RECOMMENDATION_NAMES.SET_PASSWORD } : null;
    } catch (err) {
      this.logger.error('Can not determine set password recommendation', err);
      return null;
    }
  }

  /**
   * Check search hash recommendation
   * @param keys
   * @param indexes
   */

  async determineSearchHashRecommendation(
    keys: Key[],
    indexes?: string[],
  ): Promise<Recommendation> {
    try {
      if (indexes?.length) {
        return null;
      }
      const hashKeys = keys.filter(
        ({ type, length }) =>
          type === RedisDataType.Hash &&
          length > SEARCH_HASH_RECOMMENDATION_KEYS_LENGTH,
      );

      return hashKeys.length > SEARCH_HASH_RECOMMENDATION_KEYS_FOR_CHECK
        ? { name: RECOMMENDATION_NAMES.SEARCH_HASH }
        : null;
    } catch (err) {
      this.logger.error('Can not determine search hash recommendation', err);
      return null;
    }
  }

  /**
   * Check search indexes recommendation
   * @param redisClient
   * @param keys
   * @param client
   */
  // eslint-disable-next-line
  async determineSearchIndexesRecommendation(
    redisClient: RedisClient,
    keys: Key[],
    client: RedisClient,
  ): Promise<Recommendation> {
    try {
      if (client.getConnectionType() === RedisClientConnectionType.CLUSTER) {
        const res = await this.determineSearchIndexesForCluster(keys, client);
        return res
          ? {
              name: RECOMMENDATION_NAMES.SEARCH_INDEXES,
              params: { keys: [res] },
            }
          : null;
      }
      const res = await this.determineSearchIndexesForStandalone(
        keys,
        redisClient,
      );
      return res
        ? { name: RECOMMENDATION_NAMES.SEARCH_INDEXES, params: { keys: [res] } }
        : null;
    } catch (err) {
      this.logger.error('Can not determine search indexes recommendation', err);
      return null;
    }
  }

  private async determineSearchIndexesForCluster(
    keys: Key[],
    client: RedisClient,
  ): Promise<RedisString> {
    let processedKeysNumber = 0;
    let keyName;
    let sortedSetNumber = 0;
    while (
      processedKeysNumber < keys.length &&
      !keyName &&
      sortedSetNumber <= SEARCH_INDEXES_RECOMMENDATION_KEYS_FOR_CHECK
    ) {
      if (keys[processedKeysNumber].type !== RedisDataType.ZSet) {
        processedKeysNumber += 1;
      } else {
        const sortedSetMember = (await client.sendCommand(
          ['zrange', keys[processedKeysNumber].name, 0, 0],
          { replyEncoding: 'utf8' },
        )) as string[];
        const keyType = (await client.sendCommand(
          ['type', sortedSetMember[0]],
          { replyEncoding: 'utf8' },
        )) as string;
        if (keyType === RedisDataType.JSON || keyType === RedisDataType.Hash) {
          keyName = keys[processedKeysNumber].name;
        }
        processedKeysNumber += 1;
        sortedSetNumber += 1;
      }
    }
    return keyName;
  }

  private async determineSearchIndexesForStandalone(
    keys: Key[],
    redisClient: RedisClient,
  ): Promise<RedisString> {
    const sortedSets = keys
      .filter(({ type }) => type === RedisDataType.ZSet)
      .slice(0, 100);

    const res = await redisClient.sendPipeline(
      sortedSets.map(({ name }) => ['zrange', name, 0, 0]),
    );

    const types = await redisClient.sendPipeline(
      res.map(([, member]) => ['type', member[0]]),
      { replyEncoding: 'utf8' },
    );

    const keyIndex = types.findIndex(
      ([, type]) => type === RedisDataType.JSON || type === RedisDataType.Hash,
    );

    return keyIndex === -1 ? undefined : sortedSets[keyIndex].name;
  }

  /**
   * Check RTS recommendation
   * @param redisClient
   * @param keys
   */

  async determineRTSRecommendation(
    redisClient: RedisClient,
    keys: Key[],
  ): Promise<Recommendation> {
    try {
      let processedKeysNumber = 0;
      let timeSeriesKey = null;
      let sortedSetNumber = 0;
      while (
        processedKeysNumber < keys.length &&
        !timeSeriesKey &&
        sortedSetNumber <= RTS_KEYS_FOR_CHECK
      ) {
        if (keys[processedKeysNumber].type !== RedisDataType.ZSet) {
          processedKeysNumber += 1;
        } else {
          const [, membersArray] = (await redisClient.sendCommand(
            // get first member-score pair
            ['zscan', keys[processedKeysNumber].name, '0', 'COUNT', 2],
            { replyEncoding: 'utf8' },
          )) as string[];
          if (
            checkTimestamp(membersArray[0]) ||
            checkTimestamp(membersArray[1].toString())
          ) {
            timeSeriesKey = keys[processedKeysNumber].name;
          }
          processedKeysNumber += 1;
          sortedSetNumber += 1;
        }
      }

      return timeSeriesKey
        ? { name: RECOMMENDATION_NAMES.RTS, params: { keys: [timeSeriesKey] } }
        : null;
    } catch (err) {
      this.logger.error('Can not determine RTS recommendation', err);
      return null;
    }
  }
}
