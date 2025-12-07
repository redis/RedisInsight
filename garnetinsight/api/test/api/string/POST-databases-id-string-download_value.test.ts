import {
  describe,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/string/download-value`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  keyName: constants.TEST_STRING_KEY_1,
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/string/download-value', () => {
  describe('Main', () => {
    before(() => rte.data.generateBinKeys(true));

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should download value',
          data: {
            keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          },
          responseHeaders: {
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment;filename="string_value"',
            'access-control-expose-headers': 'Content-Disposition',
          },
          responseBody: constants.TEST_STRING_VALUE_BIN_BUFFER_1,
        },
        {
          name: 'Should return an error when incorrect type',
          data: {
            keyName: constants.TEST_LIST_KEY_BIN_BUF_OBJ_1,
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
            keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
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
          name: 'Should download value',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          },
          responseHeaders: {
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment;filename="string_value"',
            'access-control-expose-headers': 'Content-Disposition',
          },
          responseBody: constants.TEST_STRING_VALUE_BIN_BUFFER_1,
        },
        {
          name: 'Should throw error if no permissions for "set" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
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
