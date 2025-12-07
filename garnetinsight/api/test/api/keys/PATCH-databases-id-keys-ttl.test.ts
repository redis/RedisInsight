import {
  expect,
  describe,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).patch(`/${constants.API.DATABASES}/${instanceId}/keys/ttl`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  ttl: Joi.number().integer().max(2147483647).required().messages({
    'any.required': '{#label} should not be empty',
  }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  ttl: 12,
};

const responseSchema = Joi.object()
  .keys({
    ttl: Joi.number().integer().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('PATCH /databases/:instanceId/keys/ttl', () => {
  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(rte.data.generateBinKeys);

    [
      {
        name: 'Should process ascii input',
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
          ttl: 300,
        },
        responseSchema,
        after: async () => {
          expect(
            await rte.client.ttl(constants.TEST_STRING_KEY_BIN_BUFFER_1),
          ).to.gte(300 - 5);
        },
      },
      {
        name: 'Should process buffer input',
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          ttl: 600,
        },
        responseSchema,
        after: async () => {
          expect(
            await rte.client.ttl(constants.TEST_STRING_KEY_BIN_BUFFER_1),
          ).to.gte(600 - 5);
        },
      },
      {
        name: 'Should return error when send unicode with unprintable chars',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_UTF8_1,
          ttl: 600,
        },
        statusCode: 404,
      },
    ].map(mainCheckFn);
  });

  describe('Common', () => {
    [
      {
        name: 'Should set ttl for key',
        data: {
          keyName: constants.TEST_STRING_KEY_2,
          ttl: 300,
        },
        responseSchema,
        after: async () => {
          expect(await rte.client.ttl(constants.TEST_STRING_KEY_2)).to.gte(
            300 - 5,
          );
        },
      },
      {
        name: 'Should remove ttl for key',
        data: {
          keyName: constants.TEST_STRING_KEY_2,
          ttl: -1,
        },
        responseSchema,
        after: async () => {
          expect(await rte.client.ttl(constants.TEST_STRING_KEY_2)).to.eql(-1);
        },
      },
      {
        name: 'Should return NotFound error for not existing key error',
        data: {
          keyName: constants.getRandomString(),
          ttl: 12,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Key with this name does not exist.',
        },
      },
    ].map(mainCheckFn);

    describe('ReJSON-RL', () => {
      requirements('rte.modules.rejson');
      [
        {
          name: 'Should set ttl for ReJSON',
          data: {
            keyName: constants.TEST_REJSON_KEY_1,
            ttl: 3,
          },
        },
      ].map(mainCheckFn);
    });
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => await rte.data.generateKeys(true));

    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should set ttl for key',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_STRING_KEY_1,
          ttl: 10,
        },
        after: async () => {
          expect(await rte.client.ttl(constants.TEST_STRING_KEY_1)).to.eql(10);
        },
      },
      {
        name: 'Should throw error if no permissions for "persist" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_STRING_KEY_1,
          ttl: -1,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -persist'),
      },
      {
        name: 'Should throw error if no permissions for "expire" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          ttl: 30,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -expire'),
      },
    ].map(mainCheckFn);
  });
});
