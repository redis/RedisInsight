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
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).patch(
    `/${constants.API.DATABASES}/${instanceId}/slow-logs/config`,
  );

const dataSchema = Joi.object({
  slowlogMaxLen: Joi.number().min(0).messages({
    'array.sparse': 'entries must be either object or array',
    'array.base': 'property {#label} must be either object or array',
  }),
  slowlogLogSlowerThan: Joi.number().min(-1),
}).strict();

const validInputData = {
  slowlogMaxLen: 128,
  slowlogLogSlowerThan: 10000,
};

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

describe('PATCH /databases/:instanceId/slow-logs/config', () => {
  before(async () => {
    await rte.data.executeCommand('config', [
      'set',
      'slowlog-log-slower-than',
      10000,
    ]);
    await rte.data.executeCommand('config', ['set', 'slowlog-max-len', 128]);
  });

  after(async () => {
    await rte.data.executeCommand('config', [
      'set',
      'slowlog-log-slower-than',
      10000,
    ]);
    await rte.data.executeCommand('config', ['set', 'slowlog-max-len', 128]);
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Standalone', () => {
    requirements('rte.type=STANDALONE');

    describe('Common', () => {
      [
        {
          name: 'Should NOT change anything',
          responseSchema,
          responseBody: {
            slowlogMaxLen: 128,
            slowlogLogSlowerThan: 10000,
          },
        },
        {
          name: 'Should change only slowlog-max-len',
          data: {
            slowlogMaxLen: 100,
          },
          responseSchema,
          responseBody: {
            slowlogMaxLen: 100,
            slowlogLogSlowerThan: 10000,
          },
        },
        {
          name: 'Should change only slowlog-log-slower-than',
          data: {
            slowlogLogSlowerThan: 100,
          },
          responseSchema,
          responseBody: {
            slowlogMaxLen: 100,
            slowlogLogSlowerThan: 100,
          },
        },
        {
          name: 'Should change both',
          data: {
            slowlogMaxLen: 128,
            slowlogLogSlowerThan: 10000,
          },
          responseSchema,
          responseBody: {
            slowlogMaxLen: 128,
            slowlogLogSlowerThan: 10000,
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

  describe('Cluster', () => {
    requirements('rte.type=CLUSTER');

    [
      {
        name: 'Should return 400 since there is no way to modify cluster config at the moment',
        data: {
          slowlogMaxLen: 1,
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          message: 'Configuration slowlog for cluster is deprecated',
          error: 'Bad Request',
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
});
