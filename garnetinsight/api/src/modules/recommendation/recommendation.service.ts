import { Injectable } from '@nestjs/common';
import { difference } from 'lodash';
import { RecommendationProvider } from 'src/modules/recommendation/providers/recommendation.provider';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { RedisString } from 'src/common/constants';
import { Key } from 'src/modules/database-analysis/models';
import { RedisClient } from 'src/modules/redis/client';

// TODO: do we need info and libraries?
interface RecommendationInput {
  client?: RedisClient;
  keys?: Key[];
  info?: RedisString;
  total?: number;
  globalClient?: RedisClient;
  exclude?: string[];
  indexes?: string[];
  libraries?: string[];
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly recommendationProvider: RecommendationProvider,
  ) {}

  /**
   * Get recommendations
   * @param dto
   */
  public async getRecommendations(
    dto: RecommendationInput,
  ): Promise<Recommendation[]> {
    // generic solution, if somewhere we will sent info, we don't need determined some recommendations
    const { client, keys, total, globalClient, exclude, indexes } = dto;

    const recommendations: Map<string, () => Promise<Recommendation | null>> =
      new Map([
        [
          RECOMMENDATION_NAMES.LUA_SCRIPT,
          async () =>
            await this.recommendationProvider.determineLuaScriptRecommendation(
              client,
            ),
        ],
        [
          RECOMMENDATION_NAMES.BIG_HASHES,
          async () =>
            await this.recommendationProvider.determineBigHashesRecommendation(
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.USE_SMALLER_KEYS,
          async () =>
            await this.recommendationProvider.determineBigTotalRecommendation(
              total,
            ),
        ],
        [
          RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES,
          async () =>
            await this.recommendationProvider.determineLogicalDatabasesRecommendation(
              client,
            ),
        ],
        [
          RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES,
          async () =>
            await this.recommendationProvider.determineCombineSmallStringsToHashesRecommendation(
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES,
          async () =>
            await this.recommendationProvider.determineIncreaseSetMaxIntsetEntriesRecommendation(
              client,
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.HASH_HASHTABLE_TO_ZIPLIST,
          async () =>
            await this.recommendationProvider.determineHashHashtableToZiplistRecommendation(
              client,
              keys,
            ),
        ],
        [RECOMMENDATION_NAMES.COMPRESS_HASH_FIELD_NAMES, () => null],
        [
          RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST,
          async () =>
            await this.recommendationProvider.determineCompressionForListRecommendation(
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.BIG_STRINGS,
          async () =>
            await this.recommendationProvider.determineBigStringsRecommendation(
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.ZSET_HASHTABLE_TO_ZIPLIST,
          async () =>
            await this.recommendationProvider.determineZSetHashtableToZiplistRecommendation(
              client,
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.BIG_SETS,
          async () =>
            await this.recommendationProvider.determineBigSetsRecommendation(
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
          async () =>
            await this.recommendationProvider.determineConnectionClientsRecommendation(
              client,
            ),
        ],
        [
          RECOMMENDATION_NAMES.RTS,
          async () =>
            await this.recommendationProvider.determineRTSRecommendation(
              client,
              keys,
            ),
        ],
        [
          RECOMMENDATION_NAMES.REDIS_VERSION,
          async () =>
            await this.recommendationProvider.determineRedisVersionRecommendation(
              client,
            ),
        ],
        [
          RECOMMENDATION_NAMES.SEARCH_INDEXES,
          async () =>
            await this.recommendationProvider.determineSearchIndexesRecommendation(
              client,
              keys,
              globalClient,
            ),
        ],
        [
          RECOMMENDATION_NAMES.SET_PASSWORD,
          async () =>
            await this.recommendationProvider.determineSetPasswordRecommendation(
              client,
            ),
        ],
        [
          RECOMMENDATION_NAMES.SEARCH_HASH,
          async () =>
            await this.recommendationProvider.determineSearchHashRecommendation(
              keys,
              indexes,
            ),
        ],
        // it is live time recommendation (will add later)
        [RECOMMENDATION_NAMES.STRING_TO_JSON, () => null],
        [
          RECOMMENDATION_NAMES.SEARCH_JSON,
          async () =>
            await this.recommendationProvider.determineSearchJSONRecommendation(
              keys,
              indexes,
            ),
        ],
        [RECOMMENDATION_NAMES.SEARCH_VISUALIZATION, () => null],
        [RECOMMENDATION_NAMES.TRY_RDI, () => null],
      ]);

    const recommendationsToDetermine = difference(
      Object.values(RECOMMENDATION_NAMES),
      exclude,
    );

    return Promise.all(
      recommendationsToDetermine.map((recommendation) =>
        recommendations.get(recommendation)(),
      ),
    );
  }
}
