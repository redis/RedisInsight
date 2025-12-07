import { numberWithSpaces } from 'src/utils/base.helper';
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
  JoiRedisString,
} from '../deps';
const { server, request, constants, rte, localDb } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/redisearch/search`,
  );

// input data schema
const dataSchema = Joi.object({
  index: Joi.string().allow('').required(),
  query: Joi.string().allow('').required(),
  limit: Joi.number().integer(),
  offset: Joi.number().integer(),
}).strict();

const validInputData = {
  index: constants.TEST_SEARCH_HASH_INDEX_1,
  query: '*',
  limit: 10,
  offset: 0,
};

const responseSchema = Joi.object({
  cursor: Joi.number().integer().required(),
  scanned: Joi.number().integer().required(),
  total: Joi.number().integer().required(),
  maxResults: Joi.number().integer().allow(null).required(),
  keys: Joi.array()
    .items(
      Joi.object({
        name: JoiRedisString.required(),
        type: Joi.string(),
      }),
    )
    .required(),
})
  .required()
  .strict(true);
const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/redisearch/search', () => {
  requirements('!rte.bigData', 'rte.modules.search');
  before(async () => {
    await rte.data.generateRedisearchIndexes(true);
    await localDb.createTestDbInstance(
      rte,
      {},
      { id: constants.TEST_INSTANCE_ID_2 },
    );
  });

  describe('Main', () => {
    before(() => rte.data.setRedisearchConfig('MAXSEARCHRESULTS', '10000'));
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should search data (limit 10)',
          data: validInputData,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.keys.length).to.eq(10);
            expect(body.cursor).to.eq(10);
            expect(body.scanned).to.eq(10);
            expect(body.total).to.eq(2000);
            expect(body.maxResults).to.gte(10000);
          },
        },
        {
          name: 'Should search 100 entries (continue from previous 10)',
          data: {
            ...validInputData,
            offset: 10,
            limit: 100,
          },
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.keys.length).to.eq(100);
            expect(body.cursor).to.eq(110);
            expect(body.scanned).to.eq(110);
            expect(body.total).to.eq(2000);
            expect(body.maxResults).to.gte(10000);
          },
        },
      ].map(mainCheckFn);
    });

    describe('maxSearchResults', () => {
      [
        {
          name: 'Should modify limit to not exceed available search limitation',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
          data: {
            ...validInputData,
            offset: 0,
            limit: 10,
          },
          checkFn: async ({ body }) => {
            expect(body.keys.length).to.eq(1);
            expect(body.cursor).to.eq(10);
            expect(body.scanned).to.eq(1);
            expect(body.total).to.eq(2000);
            expect(body.maxResults).to.gte(1);
          },
          before: async () => {
            await rte.data.setRedisearchConfig('MAXSEARCHRESULTS', '1');
          },
        },
        {
          name: 'Should return custom error message if MAXSEARCHRESULTS less than request.limit',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
          data: {
            ...validInputData,
            offset: 10,
            limit: 10,
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
            message: `Set MAXSEARCHRESULTS to at least ${numberWithSpaces(validInputData.limit)}.`,
          },
          before: async () => {
            await rte.data.setRedisearchConfig('MAXSEARCHRESULTS', '1');
          },
        },
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => {
        await rte.data.setRedisearchConfig('MAXSEARCHRESULTS', '10000');
        await rte.data.setAclUserRules('~* +@all');
      });

      [
        {
          name: 'Should return response with maxResults = null if no permissions for "ft.config" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: validInputData,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.keys.length).to.eq(10);
            expect(body.cursor).to.eq(10);
            expect(body.scanned).to.eq(10);
            expect(body.total).to.eq(2000);
            expect(body.maxResults).to.eq(null);
          },
          before: () => rte.data.setAclUserRules('~* +@all -ft.config'),
        },
        {
          name: 'Should search',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: validInputData,
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "ft.search" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
            index: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -ft.search'),
        },
      ].map(mainCheckFn);
    });
  });
});
