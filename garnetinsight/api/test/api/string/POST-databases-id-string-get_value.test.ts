import {
  describe,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  JoiRedisString,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/string/get-value`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  keyName: constants.TEST_STRING_KEY_1,
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    value: JoiRedisString.required(),
  })
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/string/get-value', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should return value in utf8 (by default)',
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
        },
        responseBody: {
          keyName: constants.TEST_STRING_KEY_BIN_UTF8_1,
          value: constants.TEST_STRING_VALUE_BIN_UTF8_1,
        },
      },
      {
        name: 'Should return value in utf8',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
        },
        responseBody: {
          keyName: constants.TEST_STRING_KEY_BIN_UTF8_1,
          value: constants.TEST_STRING_VALUE_BIN_UTF8_1,
        },
      },
      {
        name: 'Should return value in ascii',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
        },
        responseBody: {
          keyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
          value: constants.TEST_STRING_VALUE_BIN_ASCII_1,
        },
      },
      {
        name: 'Should return value in buffer',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
        },
        responseBody: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          value: constants.TEST_STRING_VALUE_BIN_BUF_OBJ_1,
        },
      },
      {
        name: 'Should return part of value in buffer (only "end")',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          end: constants.TEST_STRING_KEY_END,
        },
        responseBody: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          value: constants.TEST_STRING_PARTIAL_VALUE_BIN_BUF_OBJ_1,
        },
      },
      {
        name: 'Should return part of value in buffer ("start" & "end")',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          start: constants.TEST_STRING_KEY_START_2,
          end: constants.TEST_STRING_KEY_END,
        },
        responseBody: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          value: constants.TEST_STRING_PARTIAL_VALUE_BIN_BUF_OBJ_2,
        },
      },
      {
        name: 'Should return error when send unicode with unprintable chars',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_UTF8_1,
        },
        statusCode: 404,
      },
    ].map(mainCheckFn);
  });
  describe('Main', () => {
    before(() => rte.data.generateKeys(true));

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should get value',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.TEST_STRING_VALUE_1,
          },
        },
        {
          name: 'Should get part of value',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            end: constants.TEST_STRING_KEY_END,
          },
          responseBody: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.TEST_STRING_VALUE_1.slice(
              constants.TEST_STRING_KEY_START_1,
              constants.TEST_STRING_KEY_END + 1,
            ),
          },
        },
        {
          name: 'Should return an error when incorrect type',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
            // message: 'WRONGTYPE Operation against a key holding the wrong kind of value',
          },
        },
        {
          name: 'Should return an error when incorrect end of string',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            end: 0,
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
        },
        {
          name: 'Should return an error when start of string greater than end',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            start: 10,
            end: 9,
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
            keyName: constants.TEST_STRING_KEY_1,
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
          name: 'Should get value',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_1,
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "set" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            value: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -get'),
        },
      ].map(mainCheckFn);
    });
  });
});
