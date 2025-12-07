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
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).patch(`/${constants.API.DATABASES}/${instanceId}/list`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  element: Joi.string().required(),
  index: Joi.number().integer(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  element: constants.TEST_LIST_ELEMENT_1,
  index: 0,
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('PATCH /databases/:instanceId/list', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should update element from buffer (response utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          element: constants.TEST_LIST_ELEMENT_BIN_UTF8_1,
          index: 0,
        },
        responseBody: {
          index: 0,
          element: constants.TEST_LIST_ELEMENT_BIN_UTF8_1,
        },
        after: async () => {
          expect(
            await rte.client.lrangeBuffer(
              constants.TEST_LIST_KEY_BIN_BUFFER_1,
              0,
              100,
            ),
          ).to.deep.eq([
            Buffer.from(constants.TEST_LIST_ELEMENT_BIN_UTF8_1, 'utf8'),
          ]);
        },
      },
      {
        name: 'Should update element from buffer (return buffer)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          element: constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1,
          index: 0,
        },
        responseBody: {
          index: 0,
          element: constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1,
        },
        after: async () => {
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
        name: 'Should update element from ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_ASCII_1,
          element: constants.TEST_LIST_ELEMENT_BIN_ASCII_1,
          index: 0,
        },
        responseBody: {
          index: 0,
          element: constants.TEST_LIST_ELEMENT_BIN_ASCII_1,
        },
        after: async () => {
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
    before(async () => await rte.data.generateKeys(true));

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should modify item with empty value on position 0',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            element: '',
            index: 0,
          },
          statusCode: 200,
          after: async () => {
            expect(
              await rte.client.lrange(constants.TEST_LIST_KEY_1, 0, 100),
            ).to.eql(['', constants.TEST_LIST_ELEMENT_2]);
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            element: constants.getRandomString(),
            index: 0,
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            element: constants.getRandomString(),
            index: 0,
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
        },
        {
          name: 'Should return BadRequest error if index is out of range',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            element: constants.getRandomString(),
            index: 999,
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            element: constants.getRandomString(),
            index: 0,
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
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should create regular item',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            element: constants.TEST_LIST_ELEMENT_1,
            index: 0,
          },
          statusCode: 200,
        },
        {
          name: 'Should throw error if no permissions for "lset" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            element: constants.getRandomString(),
            index: 0,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -lset'),
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            element: constants.getRandomString(),
            index: 0,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -exists'),
        },
      ].map(mainCheckFn);
    });
  });
});
