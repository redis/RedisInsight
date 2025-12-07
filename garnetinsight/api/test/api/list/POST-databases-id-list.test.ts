import {
  expect,
  describe,
  it,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  getMainCheckFn,
} from '../deps';
import { ListElementDestination } from 'src/modules/browser/list/dto';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/list`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  elements: Joi.array()
    .items(
      Joi.custom((value, helpers) => {
        if (typeof value === 'string' || Buffer.isBuffer(value)) {
          return value;
        }
        return helpers.error('any.invalid');
      }).messages({
        'any.invalid': 'elements must be a string or a Buffer',
      }),
    )
    .required(),
  expire: Joi.number().integer().allow(null).min(1).max(2147483647),
}).strict();

const validInputData = {
  keyName: constants.TEST_LIST_KEY_1,
  elements: [constants.TEST_LIST_ELEMENT_1],
  expire: constants.TEST_LIST_EXPIRE_1,
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
        expect(await rte.client.lrange(testCase.data.keyName, 0, 100)).to.eql(
          testCase.data.elements,
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

describe('POST /databases/:databases/list', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(rte.data.truncate);

    [
      {
        name: 'Should create list from buff',
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          elements: [constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1],
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_LIST_KEY_BIN_BUFFER_1),
          ).to.eql(1);
          expect(
            await rte.client.lrangeBuffer(
              constants.TEST_LIST_KEY_BIN_BUFFER_1,
              0,
              100,
            ),
          ).to.deep.eq([constants.TEST_LIST_ELEMENT_BIN_BUFFER_1]);
        },
      },
      {
        name: 'Should create list from ascii',
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_ASCII_1,
          elements: [constants.TEST_LIST_ELEMENT_BIN_ASCII_1],
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_LIST_KEY_BIN_BUFFER_1),
          ).to.eql(1);
          expect(
            await rte.client.lrangeBuffer(
              constants.TEST_LIST_KEY_BIN_BUFFER_1,
              0,
              100,
            ),
          ).to.deep.eq([constants.TEST_LIST_ELEMENT_BIN_BUFFER_1]);
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
            elements: [''],
          },
          statusCode: 201,
        },
        {
          name: 'Should create item with key ttl',
          data: {
            keyName: constants.getRandomString(),
            elements: [constants.getRandomString()],
            expire: constants.TEST_STRING_EXPIRE_1,
          },
          statusCode: 201,
        },
        {
          name: 'Should create regular item',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.TEST_LIST_ELEMENT_1],
          },
          statusCode: 201,
        },
        {
          name: 'Should return conflict error if key already exists',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
          },
          statusCode: 409,
          responseBody: {
            statusCode: 409,
            error: 'Conflict',
            message: 'This key name is already in use.',
          },
          after: async () =>
            // check that value was not overwritten
            expect(
              await rte.client.lrange(constants.TEST_LIST_KEY_1, 0, 10),
            ).to.eql([constants.TEST_LIST_ELEMENT_1]),
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            elements: [constants.getRandomString()],
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
          after: async () =>
            // check that value was not overwritten
            expect(
              await rte.client.lrange(constants.TEST_LIST_KEY_1, 0, 10),
            ).to.eql([constants.TEST_LIST_ELEMENT_1]),
        },
      ].map(createCheckFn);
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
            elements: [constants.TEST_LIST_ELEMENT_1],
            destination: ListElementDestination.Head,
          },
          statusCode: 201,
        },
        {
          name: 'Should throw error if no permissions for "lpush" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            elements: [constants.getRandomString()],
            destination: ListElementDestination.Head,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -lpush'),
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            elements: [constants.getRandomString()],
            destination: ListElementDestination.Head,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -exists'),
        },
      ].map(createCheckFn);
    });
  });
});
