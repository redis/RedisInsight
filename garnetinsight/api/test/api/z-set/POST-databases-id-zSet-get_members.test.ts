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
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/zSet/get-members`,
  );

// input data schema todo: investigate BE validation
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  offset: Joi.number().integer().min(0).allow(true).required().messages({
    'any.required': '{#label} should not be empty',
  }),
  count: Joi.number().integer().min(1).allow(true).required().messages({
    'any.required': '{#label} should not be empty',
  }),
  sortOrder: Joi.string().valid('DESC', 'ASC'),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  offset: 0,
  count: 15,
  sortOrder: 'DESC',
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    total: Joi.number().integer().required(),
    members: Joi.array()
      .items(
        Joi.object().keys({
          name: JoiRedisString.required(),
          score: Joi.number().required().allow('inf', '-inf'),
        }),
      )
      .required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/zSet/get-members', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should query members from buff (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          offset: 0,
          count: 15,
          sortOrder: 'DESC',
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_ZSET_KEY_BIN_UTF8_1,
          total: 1,
          members: [
            {
              name: constants.TEST_ZSET_MEMBER_BIN_UTF8_1,
              score: constants.TEST_ZSET_MEMBER_1_SCORE,
            },
          ],
        },
      },
      {
        name: 'Should query members from buff (return buff)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          offset: 0,
          count: 15,
          sortOrder: 'DESC',
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          total: 1,
          members: [
            {
              name: constants.TEST_ZSET_MEMBER_BIN_BUF_OBJ_1,
              score: constants.TEST_ZSET_MEMBER_1_SCORE,
            },
          ],
        },
      },
      {
        name: 'Should query members from ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_ASCII_1,
          offset: 0,
          count: 15,
          sortOrder: 'DESC',
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_ZSET_KEY_BIN_ASCII_1,
          total: 1,
          members: [
            {
              name: constants.TEST_ZSET_MEMBER_BIN_ASCII_1,
              score: constants.TEST_ZSET_MEMBER_1_SCORE,
            },
          ],
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
          name: 'Should query 15 members sorted DESC',
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            offset: 0,
            count: 15,
            sortOrder: 'DESC',
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_ZSET_KEY_2,
            total: 100,
            members: new Array(15).fill(0).map((item, i) => {
              return {
                name: `member_${100 - i}`,
                score: 100 - i,
              };
            }),
          },
        },
        {
          name: 'Should query 45 members sorted ASC',
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            offset: 0,
            count: 45,
            sortOrder: 'ASC',
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_ZSET_KEY_2,
            total: 100,
            members: new Array(45).fill(0).map((item, i) => {
              return {
                name: `member_${i + 1}`,
                score: i + 1,
              };
            }),
          },
        },
        {
          name: 'Should query next 45 members sorted ASC',
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            offset: 45,
            count: 45,
            sortOrder: 'ASC',
          },
          responseSchema,
          responseBody: {
            keyName: constants.TEST_ZSET_KEY_2,
            total: 100,
            members: new Array(45).fill(0).map((item, i) => {
              return {
                name: `member_${i + 45 + 1}`,
                score: i + 45 + 1,
              };
            }),
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            offset: 45,
            count: 45,
            sortOrder: 'ASC',
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
            keyName: constants.TEST_ZSET_KEY_1,
            offset: 45,
            count: 45,
            sortOrder: 'ASC',
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
          name: 'Should remove all members and key',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            offset: 0,
            count: 15,
            sortOrder: 'ASC',
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "zcard" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            offset: 0,
            count: 15,
            sortOrder: 'ASC',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zcard'),
        },
        {
          name: 'Should throw error if no permissions for "zrange" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            offset: 0,
            count: 15,
            sortOrder: 'ASC',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zrange'),
        },
        {
          name: 'Should throw error if no permissions for "zrevrange" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            offset: 0,
            count: 15,
            sortOrder: 'DESC',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zrevrange'),
        },
      ].map(mainCheckFn);
    });
  });
});
