import {
  describe,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  JoiRedisString,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID, index = 0) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/list/get-elements/${index}`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    value: JoiRedisString.allow('').required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/list/get-elements/:index', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should get element by buffer (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_BIN_UTF8_1,
          value: constants.TEST_LIST_ELEMENT_BIN_UTF8_1,
        },
      },
      {
        name: 'Should get element by buffer (return buffer)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
          value: constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1,
        },
      },
      {
        name: 'Should get element by ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_LIST_KEY_BIN_ASCII_1,
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_BIN_ASCII_1,
          value: constants.TEST_LIST_ELEMENT_BIN_ASCII_1,
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
      before(async () => await rte.data.generateKeys(true));

      [
        {
          name: 'Should select key from position 0 (by default)',
          data: {
            keyName: constants.TEST_LIST_KEY_2,
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_2,
            value: 'element_1',
          },
        },
        {
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID, 0),
          name: 'Should select key from position 0',
          data: {
            keyName: constants.TEST_LIST_KEY_2,
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_2,
            value: 'element_1',
          },
        },
        {
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID, 1),
          name: 'Should select key from position 1',
          data: {
            keyName: constants.TEST_LIST_KEY_2,
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_2,
            value: 'element_2',
          },
        },
        {
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID, 99),
          name: 'Should select key from position 99',
          data: {
            keyName: constants.TEST_LIST_KEY_2,
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_2,
            value: 'element_100',
          },
        },
        {
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID, -1),
          name: 'Should select key from position -1',
          data: {
            keyName: constants.TEST_LIST_KEY_2,
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_2,
            value: 'element_100',
          },
        },
        {
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID, -2),
          name: 'Should select key from position -2',
          data: {
            keyName: constants.TEST_LIST_KEY_2,
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_LIST_KEY_2,
            value: 'element_99',
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_2,
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
        },
      ].map(mainCheckFn);

      describe('Search in huge number of elements', () => {
        requirements('rte.bigData');
        [
          {
            endpoint: () =>
              endpoint(
                constants.TEST_INSTANCE_ID,
                constants.TEST_LIST_HUGE_INDEX,
              ),
            name: 'Should get element from particular position',
            data: {
              keyName: constants.TEST_LIST_HUGE_KEY,
            },
            responseSchema,
            responseBody: {
              keyName: constants.TEST_LIST_HUGE_KEY,
              value: constants.TEST_LIST_HUGE_ELEMENT,
            },
          },
        ].map(mainCheckFn);
      });
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
            offset: 0,
            count: 1000,
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "lindex" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            offset: 0,
            count: 1000,
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -lindex'),
        },
      ].map(mainCheckFn);
    });
  });
});
