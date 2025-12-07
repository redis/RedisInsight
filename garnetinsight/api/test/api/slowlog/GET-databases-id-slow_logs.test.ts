import {
  expect,
  describe,
  it,
  Joi,
  deps,
  validateApiCall,
  after,
  requirements,
  before,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${instanceId}/slow-logs`);

const responseSchema = Joi.array()
  .items(
    Joi.object().keys({
      id: Joi.number().required(),
      time: Joi.number().required(),
      durationUs: Joi.number().required(),
      args: Joi.string().required(),
      source: Joi.string().allow(''),
      client: Joi.string().allow(''),
    }),
  )
  .required();

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

describe('GET /databases/:instanceId/slow-logs', () => {
  describe('Common', () => {
    beforeEach(async () => {
      await rte.data.executeCommandAll('config', [
        'set',
        'slowlog-log-slower-than',
        0,
      ]);
      await rte.data.executeCommandAll('slowlog', ['reset']);
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
        name: 'Should return 0 array when slowlog-log-slower-than is a huge value',
        responseSchema,
        before: async () => {
          await rte.data.executeCommandAll('config', [
            'set',
            'slowlog-log-slower-than',
            1000000000,
          ]);
          await rte.data.executeCommandAll('slowlog', ['reset']);
        },
        checkFn: async ({ body }) => {
          expect(body).to.eql([]);
        },
      },
      {
        name: 'Should return 1 + slave nodes array when slowlog-log-slower-than is a huge value',
        responseSchema,
        query: {
          count: 1,
        },
        before: async () => {
          await rte.data.executeCommandAll('config', [
            'set',
            'slowlog-log-slower-than',
            0,
          ]);
          await rte.data.executeCommandAll('slowlog', ['reset']);
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(
            rte.client.nodes ? rte.client.nodes().length : 1,
          );
        },
      },
      {
        name: 'Should get slow logs including "set" command inside',
        responseSchema,
        before: async () => {
          await rte.client.set(
            constants.TEST_STRING_KEY_1,
            constants.GENERATE_BIG_TEST_STRING_VALUE(0.1),
          );
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.gt(0);
          const stringSlowLog = body.find((log) =>
            log.args.startsWith(`set ${constants.TEST_STRING_KEY_1}`),
          );
          expect(stringSlowLog.durationUs).to.gt(0);
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
        name: 'Should fetch slowlog',
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
