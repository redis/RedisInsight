import {
  expect,
  describe,
  it,
  deps,
  validateApiCall,
  after,
  requirements,
  before,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(`/${constants.API.DATABASES}/${instanceId}/slow-logs`);

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

describe('DELETE /databases/:instanceId/slow-logs', () => {
  describe('Common', () => {
    beforeEach(async () => {
      await rte.data.executeCommandAll('config', [
        'set',
        'slowlog-log-slower-than',
        0,
      ]);
      await rte.client.get(constants.TEST_STRING_KEY_1);
    });

    after(async () => {
      await rte.data.executeCommandAll('config', [
        'set',
        'slowlog-log-slower-than',
        10000,
      ]);
    });

    [
      {
        name: 'Check that slowlog cleaned up',
        before: async () => {
          await rte.data.executeCommandAll('config', [
            'set',
            'slowlog-log-slower-than',
            10000000000,
          ]);
          expect((await rte.client.call('slowlog', 'get')).length).to.gt(0);
        },
        after: async () => {
          expect((await rte.client.call('slowlog', 'get')).length).to.eq(0);
        },
      },
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
    ].map(mainCheckFn);
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should reset slowlog',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
      },
      {
        name: 'Should throw error if no permissions for "slowlog" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -slowlog'),
      },
    ].map(mainCheckFn);
  });
});
