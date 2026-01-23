import {
  expect,
  describe,
  it,
  Joi,
  deps,
  validateApiCall,
  requirements,
  before,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/slow-logs/config`,
  );

const responseSchema = Joi.object()
  .keys({
    slowlogMaxLen: Joi.number().required(),
    slowlogLogSlowerThan: Joi.number().required(),
  })
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

describe('GET /databases/:instanceId/slow-logs/config', () => {
  describe('Common', () => {
    [
      {
        name: 'Should get slowlog config',
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.slowlogMaxLen).to.gte(0);
          expect(body.slowlogLogSlowerThan).to.gte(0);
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
        name: 'Should get slowlog config',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
      },
      {
        name: 'Should throw error if no permissions for "config" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -config'),
      },
    ].map(mainCheckFn);
  });
});
