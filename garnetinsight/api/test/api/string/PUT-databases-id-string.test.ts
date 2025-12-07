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
  request(server).put(`/${constants.API.DATABASES}/${instanceId}/string`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  value: Joi.string().required(),
}).strict();

const validInputData = {
  keyName: constants.TEST_STRING_KEY_1,
  value: constants.TEST_STRING_VALUE_1,
};

const mainCheckFn = getMainCheckFn(endpoint);

const updateCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test execution
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
    } else {
      expect(await rte.client.get(testCase.data.keyName)).to.eql(
        testCase.data.value,
      );
    }
  });
};

describe('PUT /databases/:instanceId/string', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(rte.data.generateBinKeys);

    [
      {
        name: 'Should update string from buff',
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          value: constants.TEST_STRING_VALUE_BIN_BUF_OBJ_1,
        },
        after: async () => {
          expect(
            await rte.client.getBuffer(constants.TEST_STRING_KEY_BIN_BUFFER_1),
          ).to.eql(constants.TEST_STRING_VALUE_BIN_BUFFER_1);
        },
      },
      {
        name: 'Should update string from ascii',
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
          value: constants.TEST_STRING_VALUE_BIN_ASCII_1,
        },
        after: async () => {
          expect(
            await rte.client.getBuffer(constants.TEST_STRING_KEY_BIN_BUFFER_1),
          ).to.eql(constants.TEST_STRING_VALUE_BIN_BUFFER_1);
        },
      },
      {
        name: 'Should return error when send unicode with unprintable chars',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_UTF8_1,
          value: constants.TEST_STRING_KEY_BIN_ASCII_1,
        },
        statusCode: 404,
      },
    ].map(mainCheckFn);
  });
  describe('Main', () => {
    before(async () => await rte.data.generateKeys(true));

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
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
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            value: constants.getRandomString(),
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
          },
          after: () => {},
        },
        {
          name: 'Should edit existing value',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: '',
          },
          statusCode: 200,
        },
        {
          name: 'Should edit existing value and do not edit ttl',
          data: {
            keyName: constants.TEST_STRING_KEY_2,
            value: '',
          },
          statusCode: 200,
          after: async function () {
            expect(await rte.client.get(constants.TEST_STRING_KEY_2)).to.eql(
              '',
            );
            expect(await rte.client.ttl(constants.TEST_STRING_KEY_2))
              .to.lte(constants.TEST_STRING_EXPIRE_2)
              .gte(-1);
          },
        },
        {
          name: 'Should edit existing value for different key type',
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            value: '',
          },
          statusCode: 200,
        },
      ].map(updateCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should create regular item',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.TEST_STRING_VALUE_1,
          },
          statusCode: 200,
        },
        {
          name: 'Should throw error if no permissions for "set" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: '',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -set'),
          after: async () =>
            expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
              constants.TEST_STRING_VALUE_1,
            ),
        },
        {
          name: 'Should throw error if no permissions for "ttl" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: '',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -ttl'),
          after: async () =>
            expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
              constants.TEST_STRING_VALUE_1,
            ),
        },
        {
          name: 'Should throw error if no permissions for "expire" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_2,
            value: '',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -expire'),
          // todo: Implement transaction for set + expire commands on BE. As if no ACL rules for "expire" key will be edited but ttl will be not set
        },
      ].map(updateCheckFn);
    });
  });
});
