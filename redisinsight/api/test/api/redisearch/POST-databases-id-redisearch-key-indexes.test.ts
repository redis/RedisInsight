import {
  expect,
  describe,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';

const { server, request, constants, rte, localDb } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/redisearch/key-indexes`,
  );

// A hash key, a JSON key and a string key that all share one prefix, with a
// hash index and a json index scoped to that prefix. This lets us assert that
// an index only covers a key whose TYPE matches the index definition - not
// merely its prefix (RI-8316).
const TYPE_MATCH_PREFIX = `${constants.TEST_RUN_ID}_ki:`;
const HASH_KEY = `${TYPE_MATCH_PREFIX}hash`;
const JSON_KEY = `${TYPE_MATCH_PREFIX}json`;
const STRING_KEY = `${TYPE_MATCH_PREFIX}string`;
const HASH_INDEX = `${constants.TEST_RUN_ID}_ki_hash_idx`;
const JSON_INDEX = `${constants.TEST_RUN_ID}_ki_json_idx`;

const dataSchema = Joi.object({
  key: Joi.string().required(),
}).strict();

const validInputData = {
  key: HASH_KEY,
};

// Not `.required()`: the endpoint returns an empty `indexes` array for a key
// no index covers, and `array().items(X.required())` would reject that.
const INDEX_SUMMARY_SCHEMA = Joi.object({
  name: Joi.string().required(),
  prefixes: Joi.array().items(Joi.string().allow('')).required(),
  key_type: Joi.string().required(),
});

const RESPONSE_SCHEMA = Joi.object({
  indexes: Joi.array().items(INDEX_SUMMARY_SCHEMA).required(),
})
  .required()
  .strict();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/redisearch/key-indexes', () => {
  requirements('!rte.bigData', 'rte.modules.search');
  before(async () => {
    const data = rte.data;

    await data.generateRedisearchIndexes(true);
    await localDb.createTestDbInstance(
      rte,
      {},
      { id: constants.TEST_INSTANCE_ID_2 },
    );

    // Three keys of different types under one shared prefix.
    await data.sendCommand('hset', [HASH_KEY, 'field', 'value']);
    await data.sendCommand('set', [STRING_KEY, 'value']);
    await data.sendCommand('json.set', [
      JSON_KEY,
      '.',
      JSON.stringify({ field: 'value' }),
    ]);

    // One index per type, both scoped to the shared prefix.
    await data.sendCommand('ft.create', [
      HASH_INDEX,
      'on',
      'hash',
      'prefix',
      '1',
      TYPE_MATCH_PREFIX,
      'schema',
      'field',
      'text',
    ]);
    await data.sendCommand('ft.create', [
      JSON_INDEX,
      'on',
      'json',
      'prefix',
      '1',
      TYPE_MATCH_PREFIX,
      'schema',
      '$.field',
      'as',
      'field',
      'text',
    ]);
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should match a hash key to the hash index by prefix and type, not the same-prefix json index',
        data: { key: HASH_KEY },
        responseSchema: RESPONSE_SCHEMA,
        checkFn: async ({ body }) => {
          const names = body.indexes.map((idx) => idx.name);
          // Prefix and type both match.
          expect(names).to.include(HASH_INDEX);
          // Same prefix, different type - must not match.
          expect(names).to.not.include(JSON_INDEX);
        },
      },
      {
        name: 'Should match a json key to the json index by prefix and type, not the same-prefix hash index',
        data: { key: JSON_KEY },
        responseSchema: RESPONSE_SCHEMA,
        checkFn: async ({ body }) => {
          const names = body.indexes.map((idx) => idx.name);
          // Prefix and type both match.
          expect(names).to.include(JSON_INDEX);
          // Same prefix, different type - must not match (RI-8316).
          expect(names).to.not.include(HASH_INDEX);
        },
      },
      {
        name: 'Should not match any index for a key whose type is neither hash nor json',
        data: { key: STRING_KEY },
        responseSchema: RESPONSE_SCHEMA,
        checkFn: async ({ body }) => {
          // The string key shares the prefix of both indexes, but its type
          // matches neither, so nothing covers it.
          expect(body.indexes).to.eql([]);
        },
      },
    ].forEach(mainCheckFn);
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should get key indexes',
        data: validInputData,
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
      },
      {
        name: 'Should throw error if no permissions for "ft._list" command',
        data: validInputData,
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -ft._list'),
      },
    ].forEach(mainCheckFn);
  });
});
