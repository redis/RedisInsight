import {
  expect,
  describe,
  it,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/string`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  value: Joi.string().required(),
  expire: Joi.number().integer().allow(null).min(1).max(2147483647),
}).strict();

const validInputData = {
  keyName: constants.TEST_STRING_KEY_1,
  value: constants.TEST_STRING_VALUE_1,
  expire: constants.TEST_STRING_EXPIRE_1,
};

const mainCheckFn = getMainCheckFn(endpoint);

const createCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(0);
      }
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(1);
        expect(await rte.client.get(testCase.data.keyName)).to.eql(
          testCase.data.value,
        );
        if (testCase.data.expire) {
          expect(await rte.client.ttl(testCase.data.keyName)).to.gte(
            testCase.data.expire - 5,
          );
        } else {
          expect(await rte.client.ttl(testCase.data.keyName)).to.eql(-1);
        }
      }
    }
  });
};

describe('POST /databases/:instanceId/string', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(rte.data.truncate);

    [
      {
        name: 'Should create string from buff',
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          value: constants.TEST_STRING_VALUE_BIN_BUF_OBJ_1,
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.getBuffer(constants.TEST_STRING_KEY_BIN_BUFFER_1),
          ).to.eql(constants.TEST_STRING_VALUE_BIN_BUFFER_1);
        },
      },
      {
        name: 'Should create string from ascii',
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
          value: constants.TEST_STRING_VALUE_BIN_ASCII_1,
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.getBuffer(constants.TEST_STRING_KEY_BIN_BUFFER_1),
          ).to.eql(constants.TEST_STRING_VALUE_BIN_BUFFER_1);
        },
      },
    ].map(mainCheckFn);
  });
  describe('Main', () => {
    before(rte.data.truncate);

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should create item with empty value',
          data: {
            keyName: constants.getRandomString(),
            value: '',
          },
          statusCode: 201,
        },
        {
          name: 'Should create item with key ttl',
          data: {
            keyName: constants.getRandomString(),
            value: constants.getRandomString(),
            expire: constants.TEST_STRING_EXPIRE_1,
          },
          statusCode: 201,
        },
        {
          name: 'Should create regular item',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.TEST_STRING_VALUE_1,
          },
          statusCode: 201,
        },
        {
          name: 'Should return conflict error if key already exists',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.getRandomString(),
          },
          statusCode: 409,
          responseBody: {
            statusCode: 409,
            error: 'Conflict',
            message: 'This key name is already in use.',
          },
          after: async () =>
            // check that value was not overwritten
            expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
              constants.TEST_STRING_VALUE_1,
            ),
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.getRandomString(),
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
          after: async () =>
            // check that value was not overwritten
            expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
              constants.TEST_STRING_VALUE_1,
            ),
        },
      ].map(createCheckFn);
    });

    describe('Big values', () => {
      requirements('rte.onPremise');
      before(rte.data.truncate);

      [
        {
          name: 'Should create 110MB string',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.GENERATE_BIG_TEST_STRING_VALUE(10),
          },
          statusCode: 201,
        },
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should create regular item',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            value: constants.TEST_STRING_VALUE_1,
          },
          statusCode: 201,
        },
        {
          name: 'Should throw error if no permissions for "set" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            value: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -set'),
        },
      ].map(createCheckFn);
    });
  });
});
