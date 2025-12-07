import {
  expect,
  describe,
  before,
  deps,
  requirements,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${instanceId}/redisearch`);

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:id/redisearch', () => {
  requirements('!rte.bigData', 'rte.modules.search');

  describe('Common', () => {
    before(async () => rte.data.generateRedisearchIndexes(true));

    [
      {
        name: 'Should get index list',
        checkFn: async ({ body }) => {
          expect(body.indexes.length).to.eq(2);
          expect(body.indexes).to.include(
            constants.TEST_SEARCH_HASH_INDEX_1,
            constants.TEST_SEARCH_HASH_INDEX_2,
          );
        },
      },
    ].map(mainCheckFn);
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should get index list',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
      },
      {
        name: 'Should throw error if no permissions for "ft._list" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -ft._list'),
      },
    ].map(mainCheckFn);
  });
});
