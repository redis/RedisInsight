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
  request(server).delete(`/${constants.API.DATABASES}/${instanceId}/keys`);

// input data schema
const dataSchema = Joi.object({
  keyNames: Joi.array().items(Joi.string().allow('')).required().messages({
    'string.base': 'each value in keyNames must be a string',
  }),
}).strict();

const validInputData = {
  keyNames: [constants.TEST_LIST_KEY_1],
};

const responseSchema = Joi.object()
  .keys({
    affected: Joi.number().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

const deleteCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    if (testCase.before) {
      await testCase.before();
    } else if (testCase.statusCode < 300) {
      testCase.data.keyNames.map(async (keyName) => {
        expect(await rte.client.exists(keyName)).to.eql(1);
      });
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    if (testCase.after) {
      await testCase.after();
    } else {
      testCase.data.keyNames.map(async (keyName) => {
        expect(await rte.client.exists(keyName)).to.eql(0);
      });
    }
  });
};

describe('DELETE /databases/:instanceId/keys', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should process ascii input',
        data: {
          keyNames: [constants.TEST_STRING_KEY_BIN_ASCII_1],
        },
        responseSchema,
        responseBody: {
          affected: 1,
        },
      },
      {
        name: 'Should process buffer input',
        data: {
          keyNames: [constants.TEST_STRING_KEY_BIN_BUF_OBJ_1],
        },
        responseSchema,
        responseBody: {
          affected: 1,
        },
      },
      {
        name: 'Should return error when send unicode with unprintable chars',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyNames: [constants.TEST_STRING_KEY_BIN_UTF8_1],
        },
        statusCode: 404,
      },
    ].map(mainCheckFn);
  });
  describe('Rest', () => {
    before(async () => await rte.data.generateKeys(true));

    // todo: investigate BE validation pipe with transform:true flag. Seems like works incorrect
    xdescribe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });
    describe('Common', () => {
      [
        {
          name: 'Should remove string',
          data: {
            keyNames: [constants.TEST_STRING_KEY_1],
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
        },
        {
          name: 'Should remove list',
          data: {
            keyNames: [constants.TEST_LIST_KEY_1],
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
        },
        {
          name: 'Should remove set',
          data: {
            keyNames: [constants.TEST_SET_KEY_1],
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
        },
        {
          name: 'Should remove zset',
          data: {
            keyNames: [constants.TEST_ZSET_KEY_1],
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
        },
        {
          name: 'Should remove hash',
          data: {
            keyNames: [constants.TEST_HASH_KEY_1],
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
        },
        {
          name: 'Should remove multiple keys',
          data: {
            keyNames: [
              constants.TEST_STRING_KEY_1,
              constants.TEST_LIST_KEY_1,
              constants.TEST_SET_KEY_1,
              constants.TEST_ZSET_KEY_1,
              constants.TEST_HASH_KEY_1,
            ],
          },
          responseSchema,
          responseBody: {
            affected: 5,
          },
          before: async function () {
            // generate already deleted keys again
            await rte.data.generateKeys(true);
            this.data.keyNames.map(async (keyName) => {
              expect(await rte.client.exists(keyName)).to.eql(1);
            });
          },
        },
        {
          name: 'Should return NotFound error for not existing error',
          data: {
            keyNames: [constants.getRandomString()],
          },
          statusCode: 404,
          // todo: investigate error payload. Seems that missed fields and wrong message
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
        },
      ].map(deleteCheckFn);

      describe('ReJSON-RL', () => {
        requirements('rte.modules.rejson');
        [
          {
            name: 'Should remove ReJSON',
            data: {
              keyNames: [constants.TEST_REJSON_KEY_1],
            },
            responseSchema,
            responseBody: {
              affected: 1,
            },
          },
        ].map(deleteCheckFn);
      });
    });
    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => await rte.data.generateKeys(true));
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should remove key',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyNames: [constants.TEST_STRING_KEY_1],
          },
          statusCode: 200,
        },
        {
          name: 'Should throw error if no permissions for "del" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyNames: [constants.TEST_STRING_KEY_1],
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -del'),
        },
      ].map(deleteCheckFn);
    });
  });
});
