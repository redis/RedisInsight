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
  JoiRedisString,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).patch(`/${constants.API.DATABASES}/${instanceId}/keys/name`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  newKeyName: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  newKeyName: constants.getRandomString(),
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
  })
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

const renameCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    if (testCase.before) {
      await testCase.before();
    } else {
      expect(await rte.client.exists(testCase.data.keyName)).to.eql(1);
      expect(await rte.client.exists(testCase.data.newKeyName)).to.eql(0);
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    if (testCase.after) {
      await testCase.after();
    } else {
      expect(await rte.client.exists(testCase.data.keyName)).to.eql(0);
      expect(await rte.client.exists(testCase.data.newKeyName)).to.eql(1);
    }
  });
};

describe('PATCH /databases/:instanceId/keys/name', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(() => rte.data.generateKeys(true));

    [
      {
        name: 'Should rename utf8 to buf and return utf8 (by default)',
        data: {
          keyName: constants.TEST_STRING_KEY_1,
          newKeyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eq(constants.TEST_STRING_KEY_BIN_UTF8_1);
        },
      },
      {
        name: 'Should rename buf to utf8 and return utf8',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          newKeyName: constants.TEST_STRING_KEY_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eq(constants.TEST_STRING_KEY_1);
        },
      },
      {
        name: 'Should rename utf8 to ascii and return buffer',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_1,
          newKeyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.deep.eq(
            constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
          );
        },
      },
      {
        name: 'Should rename ASCII to utf8 and return utf8',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
          newKeyName: constants.TEST_STRING_KEY_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eq(constants.TEST_STRING_KEY_1);
        },
      },
      {
        name: 'Should rename utf8 to buf and return ascii',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_1,
          newKeyName: constants.TEST_STRING_KEY_BIN_BUF_OBJ_1,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eq(constants.TEST_STRING_KEY_BIN_ASCII_1);
        },
      },
      {
        name: 'Should return error when send unicode with unprintable chars',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_STRING_KEY_BIN_UTF8_1,
          newKeyName: constants.TEST_STRING_KEY_BIN_ASCII_1,
        },
        statusCode: 404,
      },
    ].map(mainCheckFn);
  });
  describe('Rest', () => {
    before(async () => await rte.data.generateKeys(true));
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });
    describe('Common', () => {
      [
        {
          name: 'Should rename string',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            newKeyName:
              constants.getRandomString() + constants.CLUSTER_HASH_SLOT,
          },
          responseSchema,
        },
        {
          name: 'Should rename list',
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            newKeyName:
              constants.getRandomString() + constants.CLUSTER_HASH_SLOT,
          },
          responseSchema,
        },
        {
          name: 'Should rename set',
          data: {
            keyName: constants.TEST_SET_KEY_1,
            newKeyName:
              constants.getRandomString() + constants.CLUSTER_HASH_SLOT,
          },
          responseSchema,
        },
        {
          name: 'Should rename zset',
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            newKeyName:
              constants.getRandomString() + constants.CLUSTER_HASH_SLOT,
          },
          responseSchema,
        },
        {
          name: 'Should rename hash',
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            newKeyName:
              constants.getRandomString() + constants.CLUSTER_HASH_SLOT,
          },
          responseSchema,
        },
        {
          name: 'Should return NotFound error for not existing error',
          data: {
            keyName: constants.getRandomString(),
            newKeyName: constants.getRandomString(),
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
          before: async function () {
            expect(await rte.client.exists(this.data.keyName)).to.eql(0);
            expect(await rte.client.exists(this.data.newKeyName)).to.eql(0);
          },
          after: async function () {
            expect(await rte.client.exists(this.data.keyName)).to.eql(0);
            expect(await rte.client.exists(this.data.newKeyName)).to.eql(0);
          },
        },
      ].map(renameCheckFn);

      describe('ReJSON-RL', () => {
        requirements('rte.modules.rejson');
        [
          {
            name: 'Should rename ReJSON',
            data: {
              keyName: constants.TEST_REJSON_KEY_1,
              newKeyName: constants.getRandomString(),
            },
          },
        ].map(renameCheckFn);
      });
    });
    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => await rte.data.generateKeys(true));

      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should rename key',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            newKeyName:
              constants.getRandomString() + constants.CLUSTER_HASH_SLOT,
          },
          statusCode: 200,
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            newKeyName: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -exists'),
          after: async function () {
            expect(await rte.client.exists(this.data.keyName)).to.eql(1);
            expect(await rte.client.exists(this.data.newKeyName)).to.eql(0);
          },
        },
        {
          name: 'Should throw error if no permissions for "renamenx" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            newKeyName: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -renamenx'),
          after: async function () {
            expect(await rte.client.exists(this.data.keyName)).to.eql(1);
            expect(await rte.client.exists(this.data.newKeyName)).to.eql(0);
          },
        },
      ].map(renameCheckFn);
    });
  });
});
