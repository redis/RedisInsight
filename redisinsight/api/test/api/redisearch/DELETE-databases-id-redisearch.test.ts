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

// API endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/redisearch`,
  );

// Input data schema
const dataSchema = Joi.object({
  index: Joi.string().required(),
}).strict();

const validInputData = {
  index: constants.TEST_SEARCH_HASH_INDEX_1,
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:id/redisearch', () => {
  requirements('!rte.bigData', 'rte.modules.search');

  before(async () => {
    await rte.data.generateRedisearchIndexes(true);
  });

  describe('Main', () => {
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).forEach(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      before(async () => rte.data.generateRedisearchIndexes(true));

      [
        {
          name: 'Should delete index',
          data: validInputData,
          statusCode: 204,
          before: async () => {
            // Verify index exists before deletion
            expect(await rte.client.call('FT._LIST')).to.include(
              constants.TEST_SEARCH_HASH_INDEX_1,
            );
          },
          after: async () => {
            // Verify index is deleted after deletion
            expect(await rte.client.call('FT._LIST')).to.not.include(
              constants.TEST_SEARCH_HASH_INDEX_1,
            );
          },
        },
      ].map(mainCheckFn);
    });

    describe('RediSearch version < 2.10.X', () => {
      requirements('rte.modules.search.version<21000');
      before(async () => rte.data.generateRedisearchIndexes(true));

      [
        {
          name: 'Should return 404 if index does not exist',
          data: { index: 'non-existing-index' },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            message: 'Unknown Index name',
            error: 'Not Found',
          },
        },
      ].map(mainCheckFn);
    });

    describe('RediSearch version >= 2.10.X', () => {
      requirements('rte.modules.search.version>=21000');
      before(async () => rte.data.generateRedisearchIndexes(true));

      [
        {
          name: 'Should return 404 if index does not exist',
          data: { index: 'non-existing-index' },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            message: 'non-existing-index: no such index',
            error: 'Not Found',
          },
        },
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => {
        await rte.data.generateRedisearchIndexes(true);
        await rte.data.setAclUserRules('~* +@all');
      });

      [
        {
          name: 'Should delete regular index',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: validInputData,
          statusCode: 204,
        },
        {
          name: 'Should throw error if no permissions for "FT.DROPINDEX" command',
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
          before: () => {
            // Remove permission for "FT.DROPINDEX" command
            return rte.data.setAclUserRules('~* +@all -FT.DROPINDEX');
          },
        },
      ].map(mainCheckFn);
    });
  });
});
