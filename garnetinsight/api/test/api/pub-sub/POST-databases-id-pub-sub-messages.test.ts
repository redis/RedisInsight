import {
  describe,
  it,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/pub-sub/messages`,
  );

const dataSchema = Joi.object({
  channel: Joi.string().allow('').required(),
  message: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  channel: constants.TEST_PUB_SUB_CHANNEL_1,
  message: constants.TEST_PUB_SUB_MESSAGE_1,
};

const responseSchema = Joi.object()
  .keys({
    affected: Joi.number().integer().required().min(0),
  })
  .required()
  .strict();

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

describe('POST /databases/:instanceId/pub-sub/messages', () => {
  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should send message',
        data: {
          ...validInputData,
        },
        responseSchema,
        statusCode: 201,
      },
      {
        name: 'Should return NotFound error if instance id does not exists',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          ...validInputData,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Invalid database instance id.',
        },
      },
    ].map(mainCheckFn);
  });

  describe('ACL', () => {
    requirements('rte.acl');

    before(async () => await rte.data.generateKeys(true));
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should publish method',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        statusCode: 201,
        data: {
          ...validInputData,
        },
      },
      {
        name: 'Should throw error if no permissions for "publish" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          ...validInputData,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -publish'),
      },
    ].map(mainCheckFn);
  });
});
