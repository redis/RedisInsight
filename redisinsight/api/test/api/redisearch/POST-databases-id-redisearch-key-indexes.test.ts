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

const dataSchema = Joi.object({
  key: Joi.string().required(),
}).strict();

const validInputData = {
  key: `${constants.TEST_SEARCH_HASH_KEY_PREFIX_1}1`,
};

const INDEX_SUMMARY_SCHEMA = Joi.object({
  name: Joi.string().required(),
  prefixes: Joi.array().items(Joi.string()).required(),
  key_type: Joi.string().required(),
}).required();

const RESPONSE_SCHEMA = Joi.object({
  indexes: Joi.array().items(INDEX_SUMMARY_SCHEMA).required(),
})
  .required()
  .strict();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/redisearch/key-indexes', () => {
  requirements('!rte.bigData', 'rte.modules.search');
  before(async () => {
    await rte.data.generateRedisearchIndexes(true);
    await localDb.createTestDbInstance(
      rte,
      {},
      { id: constants.TEST_INSTANCE_ID_2 },
    );
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should return matching indexes for a key that matches a prefix',
        data: validInputData,
        responseSchema: RESPONSE_SCHEMA,
        checkFn: async ({ body }) => {
          expect(body.indexes.length).to.be.gte(1);
          const names = body.indexes.map((idx) => idx.name);
          expect(names).to.include(constants.TEST_SEARCH_HASH_INDEX_1);
        },
      },
      {
        name: 'Should return empty indexes for a key that matches no prefix',
        data: {
          key: 'nonexistent_prefix_zzz:1',
        },
        responseSchema: RESPONSE_SCHEMA,
        checkFn: async ({ body }) => {
          expect(body.indexes).to.be.an('array');
        },
      },
      {
        name: 'Should return indexes array with correct structure',
        data: validInputData,
        responseSchema: RESPONSE_SCHEMA,
        checkFn: async ({ body }) => {
          if (body.indexes.length > 0) {
            const idx = body.indexes[0];
            expect(idx).to.have.property('name');
            expect(idx).to.have.property('prefixes');
            expect(idx).to.have.property('key_type');
            expect(idx.prefixes).to.be.an('array');
          }
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
