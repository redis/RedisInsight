import {
  expect,
  describe,
  deps,
  before,
  getMainCheckFn,
  requirements,
} from '../deps';
import { analysisSchema } from './constants';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/analysis`);

const responseSchema = analysisSchema;
const mainCheckFn = getMainCheckFn(endpoint);
let repository;
let recommendationRepository;

describe('POST /databases/:instanceId/analysis', () => {
  // todo: skip for RE for now since scan 0 count 10000 might return cursor and 0 keys multiple times
  requirements('!rte.re');

  before(async () => {
    repository = await localDb.getRepository(
      localDb.repositories.DATABASE_ANALYSIS,
    );
    recommendationRepository = await localDb.getRepository(
      localDb.repositories.DATABASE_RECOMMENDATION,
    );

    await localDb.generateNDatabaseAnalysis(
      {
        databaseId: constants.TEST_INSTANCE_ID,
      },
      30,
      true,
    );

    await rte.data.generateKeys(true);
  });

  [
    {
      name: 'Should create new database analysis and clean history up to 5',
      data: {
        delimiter: '-',
      },
      statusCode: 201,
      responseSchema,
      before: async () => {
        expect(await repository.count()).to.eq(30);
      },
      checkFn: async ({ body }) => {
        expect(body.totalKeys.total).to.gt(0);
        expect(body.totalMemory.total).to.gt(0);
        expect(body.topKeysNsp.length).to.gt(0);
        expect(body.topMemoryNsp.length).to.gt(0);
        expect(body.topKeysLength.length).to.gt(0);
        expect(body.topKeysMemory.length).to.gt(0);
        expect(body.expirationGroups.length).to.gt(0);
        expect(body.db).to.gte(0);
      },
      after: async () => {
        expect(await repository.count()).to.eq(5);
      },
    },
    {
      name: 'Should create new database analysis w/o namespaces',
      data: {
        delimiter: 'somestrangedelimiter',
      },
      statusCode: 201,
      responseSchema,
      checkFn: async ({ body }) => {
        expect(body.totalKeys.total).to.gt(0);
        expect(body.totalMemory.total).to.gt(0);
        expect(body.topKeysNsp.length).to.eq(0);
        expect(body.topMemoryNsp.length).to.eq(0);
        expect(body.topKeysLength.length).to.gt(0);
        expect(body.topKeysMemory.length).to.gt(0);
        expect(body.expirationGroups.length).to.gt(0);
        expect(body.db).to.gte(0);
      },
      after: async () => {
        expect(await repository.count()).to.eq(5);
      },
    },
    {
      name: 'Should create new database analysis with applied filter',
      data: {
        delimiter: '-',
        filter: {
          match: constants.TEST_STRING_KEY_1,
          count: 10_000_000,
        },
      },
      statusCode: 201,
      responseSchema,
      checkFn: async ({ body }) => {
        expect(body.delimiter).to.eq('-');
        expect(body.progress.total).to.gt(0);
        expect(body.progress.scanned).to.gte(10_000_000);
        expect(body.progress.processed).to.eq(1);
        expect(body.filter).to.deep.eq({
          match: constants.TEST_STRING_KEY_1,
          count: 10_000_000,
        });
        expect(body.totalKeys).to.deep.eq({
          total: 1,
          types: [
            {
              type: 'string',
              total: 1,
            },
          ],
        });
        expect(body.totalMemory.total).to.gt(0);
        expect(body.totalMemory.types.length).to.eq(1);
        expect(body.totalMemory.types[0].total).to.gt(0);
        expect(body.totalMemory.types[0].type).to.eq('string');

        expect(body.topKeysNsp.length).to.eq(1);
        expect(
          constants.TEST_STRING_KEY_1.indexOf(body.topKeysNsp[0].nsp),
        ).to.eq(0);
        expect(body.topKeysNsp[0].keys).to.eq(1);
        expect(body.topKeysNsp[0].memory).to.gt(0);
        expect(body.topKeysNsp[0].types.length).to.eq(1);
        expect(body.topKeysNsp[0].types[0].type).to.eq('string');
        expect(body.topKeysNsp[0].types[0].memory).to.gt(0);
        expect(body.topKeysNsp[0].types[0].keys).to.eq(1);

        expect(body.topMemoryNsp.length).to.eq(1);
        expect(
          constants.TEST_STRING_KEY_1.indexOf(body.topMemoryNsp[0].nsp),
        ).to.eq(0);
        expect(body.topMemoryNsp[0].keys).to.eq(1);
        expect(body.topMemoryNsp[0].memory).to.gt(0);
        expect(body.topMemoryNsp[0].types.length).to.eq(1);
        expect(body.topMemoryNsp[0].types[0].type).to.eq('string');
        expect(body.topMemoryNsp[0].types[0].memory).to.gt(0);
        expect(body.topMemoryNsp[0].types[0].keys).to.eq(1);

        expect(body.topKeysMemory.length).to.eq(1);
        expect(body.topKeysMemory[0].name).to.eq(constants.TEST_STRING_KEY_1);
        expect(body.topKeysMemory[0].type).to.eq('string');
        expect(body.topKeysMemory[0].ttl).to.eq(-1);
        expect(body.topKeysMemory[0].memory).to.gt(0);
        expect(body.topKeysMemory[0].length).to.gt(0);

        expect(body.topKeysLength.length).to.eq(1);
        expect(body.topKeysLength[0].name).to.eq(constants.TEST_STRING_KEY_1);
        expect(body.topKeysLength[0].type).to.eq('string');
        expect(body.topKeysLength[0].ttl).to.eq(-1);
        expect(body.topKeysLength[0].memory).to.gt(0);
        expect(body.topKeysLength[0].length).to.gt(0);

        expect(body.expirationGroups.length).to.eq(8);
        for (let i = 1; i < 8; i++) {
          expect(body.expirationGroups[i].label).to.be.a('string');
          expect(body.expirationGroups[i].total).to.eq(0);
          expect(body.expirationGroups[i].threshold).to.gt(0);
        }
        expect(body.expirationGroups[0].label).to.eq('No Expiry');
        expect(body.expirationGroups[0].total).to.gt(0);
        expect(body.expirationGroups[0].threshold).to.eq(0);
        expect(body.db).to.eq(0);
      },
      after: async () => {
        expect(await repository.count()).to.eq(5);
      },
    },
  ].map(mainCheckFn);

  describe('recommendations', () => {
    requirements('!rte.bigData');

    beforeEach(async () => {
      await rte.data.truncate();
    });

    describe('useSmallerKeys recommendation', () => {
      // generate 1M keys take a lot of time
      requirements('!rte.type=CLUSTER');

      [
        {
          name: 'Should create new database analysis with useSmallerKeys recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            await rte.data.truncate();
            const KEYS_NUMBER = 1_000_006;
            await rte.data.generateNKeys(KEYS_NUMBER, false);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_SMALLER_KEYS_DATABASE_ANALYSIS_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
      ].map(mainCheckFn);
    });

    describe('combineSmallStringsToHashes recommendation', () => {
      // can not generate strings only in one node
      requirements('!rte.type=CLUSTER');

      [
        {
          name: 'Should create new database analysis with combineSmallStringsToHashes recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            await rte.data.generateHugeNumberOfTinyStringKeys(10);
          },
          checkFn: async ({ body }) => {
            // can not predict keys order, params.keys is random
            const recommendationNames = body.recommendations.map(
              (rec) => rec.name,
            );
            expect(recommendationNames).to.include.deep.members([
              constants.TEST_COMBINE_SMALL_STRING_TO_HASHES_RECOMMENDATION.name,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
      ].map(mainCheckFn);
    });

    describe('redisVersion recommendation', () => {
      // todo find solution for redis pass
      requirements('rte.version <= 6', '!rte.pass');
      [
        {
          name: 'Should create new database analysis with redisVersion recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_REDIS_VERSION_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
      ].map(mainCheckFn);
    });

    describe('recommendations with ReJSON', () => {
      requirements('rte.modules.rejson');
      [
        {
          name: 'Should create new database analysis with searchJSON recommendation',
          data: {
            delimiter: '-',
          },
          before: async () => {
            const NUMBERS_REJSONS = 1;
            await rte.data.generateNReJSONs(NUMBERS_REJSONS, true);
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              {
                ...constants.TEST_SEARCH_JSON_RECOMMENDATION,
                params: {
                  keys: [
                    {
                      data: [
                        ...Buffer.from(`${constants.TEST_RUN_ID}_rejson_key_0`),
                      ],
                      type: 'Buffer',
                    },
                  ],
                },
              },
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
        {
          name: 'Should create new database analysis with searchIndexes recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            const jsonValue = JSON.stringify(constants.TEST_REJSON_VALUE_1);
            await rte.data.sendCommand('ZADD', [
              constants.TEST_ZSET_KEY_1,
              constants.TEST_ZSET_MEMBER_1_SCORE,
              constants.TEST_ZSET_MEMBER_1,
            ]);
            await rte.data.sendCommand('json.set', [
              constants.TEST_ZSET_MEMBER_1,
              '.',
              jsonValue,
            ]);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              {
                ...constants.TEST_SEARCH_INDEXES_RECOMMENDATION,
                params: {
                  keys: [
                    {
                      data: [...Buffer.from(constants.TEST_ZSET_KEY_1)],
                      type: 'Buffer',
                    },
                  ],
                },
              },
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
        {
          name: 'Should create new database analysis with searchHash recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            for (let index = 0; index <= 51; index++) {
              await rte.data.sendCommand('HSET', [
                constants.TEST_HASH_KEY_1 + index,
                constants.TEST_HASH_FIELD_1_NAME,
                constants.TEST_HASH_FIELD_1_VALUE,
                constants.TEST_HASH_FIELD_2_NAME,
                constants.TEST_HASH_FIELD_2_VALUE,
                constants.TEST_HASH_FIELD_3_NAME,
                constants.TEST_HASH_FIELD_3_VALUE,
              ]);
            }
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              {
                ...constants.TEST_SEARCH_HASH_RECOMMENDATION,
              },
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
      ].map(mainCheckFn);
    });

    describe('searchIndexes recommendation', () => {
      requirements('!rte.pass');
      [
        {
          name: 'Should create new database analysis with searchIndexes recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            await rte.data.sendCommand('ZADD', [
              constants.TEST_ZSET_KEY_1,
              constants.TEST_ZSET_MEMBER_1_SCORE,
              constants.TEST_ZSET_MEMBER_1,
            ]);
            await rte.data.sendCommand('HSET', [
              constants.TEST_ZSET_MEMBER_1,
              constants.TEST_HASH_FIELD_1_NAME,
              constants.TEST_HASH_FIELD_1_VALUE,
            ]);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              {
                ...constants.TEST_SEARCH_INDEXES_RECOMMENDATION,
                params: {
                  keys: [
                    {
                      data: [...Buffer.from(constants.TEST_ZSET_KEY_1)],
                      type: 'Buffer',
                    },
                  ],
                },
              },
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
      ].map(mainCheckFn);
    });

    describe('searchHash recommendation', () => {
      requirements('!rte.pass');
      [
        {
          name: 'Should create new database analysis with searchHash recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            for (let index = 0; index <= 51; index++) {
              await rte.data.sendCommand('HSET', [
                constants.TEST_HASH_KEY_1 + index,
                constants.TEST_HASH_FIELD_1_NAME,
                constants.TEST_HASH_FIELD_1_VALUE,
                constants.TEST_HASH_FIELD_2_NAME,
                constants.TEST_HASH_FIELD_2_VALUE,
                constants.TEST_HASH_FIELD_3_NAME,
                constants.TEST_HASH_FIELD_3_VALUE,
              ]);
            }
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              {
                ...constants.TEST_SEARCH_HASH_RECOMMENDATION,
              },
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
      ].map(mainCheckFn);
    });

    describe('RTS recommendation', () => {
      requirements('!rte.pass');
      [
        {
          name: 'Should create new database analysis with RTS recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            await rte.data.sendCommand('ZADD', [
              constants.TEST_ZSET_KEY_2,
              constants.TEST_ZSET_TIMESTAMP_SCORE,
              constants.TEST_ZSET_MEMBER_1,
            ]);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              {
                ...constants.TEST_RTS_RECOMMENDATION,
                params: {
                  keys: [
                    {
                      data: [...Buffer.from(constants.TEST_ZSET_KEY_2)],
                      type: 'Buffer',
                    },
                  ],
                },
              },
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
        {
          name: 'Should create new database analysis with RTS recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            await rte.data.sendCommand('ZADD', [
              constants.TEST_ZSET_KEY_3,
              constants.TEST_ZSET_MEMBER_1_SCORE,
              constants.TEST_ZSET_TIMESTAMP_MEMBER,
            ]);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              {
                ...constants.TEST_RTS_RECOMMENDATION,
                params: {
                  keys: [
                    {
                      data: [...Buffer.from(constants.TEST_ZSET_KEY_3)],
                      type: 'Buffer',
                    },
                  ],
                },
              },
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          },
        },
      ].map(mainCheckFn);
    });

    describe('sync recommendations', () => {
      [
        {
          name: 'Should create new recommendation in repository',
          data: {
            delimiter: '-',
          },
          before: async () => {
            await recommendationRepository.clear();

            const entities: any = await recommendationRepository.findBy({
              name: constants.TEST_COMPRESSION_FOR_LIST_RECOMMENDATION.name,
            });
            expect(entities.length).to.eq(0);

            const NUMBERS_OF_LIST_ELEMENTS = 1001;
            await rte.data.generateHugeElementsForListKey(
              NUMBERS_OF_LIST_ELEMENTS,
              true,
            );
          },
          statusCode: 201,
          responseSchema,
          after: async () => {
            // wait when recommendation will be saved
            setTimeout(async () => {
              const entities: any = await recommendationRepository.findBy({
                name: constants.TEST_COMPRESSION_FOR_LIST_RECOMMENDATION.name,
                params: {
                  keys: [
                    {
                      data: [...Buffer.from(constants.TEST_LIST_KEY_1)],
                      type: 'Buffer',
                    },
                  ],
                },
              });
              expect(entities.length).to.eq(1);
            }, 5000);
          },
        },
        {
          name: 'Should not create duplicate recommendation',
          data: {
            delimiter: '-',
          },
          before: async () => {
            const entities: any = await recommendationRepository.findBy({
              name: constants.TEST_COMPRESSION_FOR_LIST_RECOMMENDATION.name,
            });
            expect(entities.length).to.eq(1);

            const NUMBERS_OF_LIST_ELEMENTS = 1001;
            await rte.data.generateHugeElementsForListKey(
              NUMBERS_OF_LIST_ELEMENTS,
              true,
            );
          },
          statusCode: 201,
          responseSchema,
          after: async () => {
            const entities: any = await recommendationRepository.findBy({
              name: constants.TEST_COMPRESSION_FOR_LIST_RECOMMENDATION.name,
            });
            expect(entities.length).to.eq(1);
          },
        },
      ].map(mainCheckFn);
    });

    [
      {
        name: 'Should create new database analysis with increaseSetMaxIntsetEntries recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_SET_MEMBERS = 513;
          await rte.data.generateHugeNumberOfMembersForSetKey(
            NUMBERS_OF_SET_MEMBERS,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            {
              ...constants.TEST_INCREASE_SET_MAX_INTSET_ENTRIES_RECOMMENDATION,
              params: {
                keys: [
                  {
                    data: [...Buffer.from(constants.TEST_SET_KEY_1)],
                    type: 'Buffer',
                  },
                ],
              },
            },
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        },
      },
      {
        name: 'Should create new database analysis with hashHashtableToZiplist recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_HASH_FIELDS = 513;
          await rte.data.generateHugeNumberOfFieldsForHashKey(
            NUMBERS_OF_HASH_FIELDS,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            {
              ...constants.TEST_HASH_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
              params: {
                keys: [
                  {
                    data: [...Buffer.from(constants.TEST_HASH_KEY_1)],
                    type: 'Buffer',
                  },
                ],
              },
            },
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        },
      },
      {
        name: 'Should create new database analysis with compressionForList recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_LIST_ELEMENTS = 1001;
          await rte.data.generateHugeElementsForListKey(
            NUMBERS_OF_LIST_ELEMENTS,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            {
              ...constants.TEST_COMPRESSION_FOR_LIST_RECOMMENDATION,
              params: {
                keys: [
                  {
                    data: [...Buffer.from(constants.TEST_LIST_KEY_1)],
                    type: 'Buffer',
                  },
                ],
              },
            },
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        },
      },
      {
        name: 'Should create new database analysis with bigStrings recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const BIG_STRING_MEMORY = 100_001;
          const bigStringValue = Buffer.alloc(
            BIG_STRING_MEMORY,
            'a',
          ).toString();

          await rte.data.sendCommand('set', [
            constants.TEST_STRING_KEY_1,
            bigStringValue,
          ]);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            {
              ...constants.TEST_BIG_STRINGS_RECOMMENDATION,
              params: {
                keys: [
                  {
                    data: [...Buffer.from(constants.TEST_STRING_KEY_1)],
                    type: 'Buffer',
                  },
                ],
              },
            },
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        },
      },
      {
        name: 'Should create new database analysis with zSetHashtableToZiplist recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_ZSET_MEMBERS = 129;
          await rte.data.generateHugeMembersForSortedListKey(
            NUMBERS_OF_ZSET_MEMBERS,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            {
              ...constants.TEST_ZSET_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
              params: {
                keys: [
                  {
                    data: [...Buffer.from(constants.TEST_ZSET_KEY_1)],
                    type: 'Buffer',
                  },
                ],
              },
            },
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        },
      },
      {
        name: 'Should create new database analysis with bigSets recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_SET_MEMBERS = 1_001;
          await rte.data.generateHugeNumberOfMembersForSetKey(
            NUMBERS_OF_SET_MEMBERS,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            {
              ...constants.TEST_BIG_SETS_RECOMMENDATION,
              params: {
                keys: [
                  {
                    data: [...Buffer.from(constants.TEST_SET_KEY_1)],
                    type: 'Buffer',
                  },
                ],
              },
            },
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        },
      },
      {
        name: 'Should create new database analysis with luaScript recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          await rte.data.generateNCachedScripts(11, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_LUA_DATABASE_ANALYSIS_RECOMMENDATION,
          ]);
        },
        after: async () => {
          await rte.data.sendCommand('script', ['flush']);
          expect(await repository.count()).to.eq(5);
        },
      },
    ].map(mainCheckFn);
  });
});
