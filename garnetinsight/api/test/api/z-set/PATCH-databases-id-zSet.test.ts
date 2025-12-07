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
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).patch(`/${constants.API.DATABASES}/${instanceId}/zSet`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  member: Joi.object()
    .keys({
      name: Joi.string().required(),
      // todo: allow(true) - is incorrect but will be transformed to number by BE. Investigate/fix it
      score: Joi.number().required().allow('inf', '-inf').label('.score'),
    })
    .messages({
      'number.base': '{#lavel} must be a string or a number',
    }),
}).strict();

const validInputData = {
  keyName: constants.TEST_ZSET_KEY_1,
  member: {
    name: constants.TEST_ZSET_MEMBER_1,
    score: constants.TEST_ZSET_MEMBER_1_SCORE,
  },
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('PATCH /databases/:instanceId/zSet', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should modify member from buff',
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          member: {
            name: constants.TEST_ZSET_MEMBER_BIN_BUF_OBJ_1,
            score: 3,
          },
        },
        after: async () => {
          expect(
            await rte.data.sendCommand(
              'zrange',
              [constants.TEST_ZSET_KEY_BIN_BUFFER_1, 0, 10],
              null,
            ),
          ).to.deep.eq([constants.TEST_ZSET_MEMBER_BIN_BUFFER_1]);
        },
      },
      {
        name: 'Should modify member from ascii',
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_ASCII_1,
          member: {
            name: constants.TEST_ZSET_MEMBER_BIN_ASCII_1,
            score: 3,
          },
        },
        after: async () => {
          expect(
            await rte.data.sendCommand(
              'zrange',
              [constants.TEST_ZSET_KEY_BIN_BUFFER_1, 0, 10],
              null,
            ),
          ).to.deep.eq([constants.TEST_ZSET_MEMBER_BIN_BUFFER_1]);
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
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            member: {
              name: constants.getRandomString(),
              score: 0,
            },
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
              await rte.client.zrange(constants.TEST_ZSET_KEY_1, 0, 10),
            ).to.eql([
              constants.TEST_ZSET_MEMBER_1,
              constants.TEST_ZSET_MEMBER_2,
            ]),
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            member: {
              name: constants.getRandomString(),
              score: 0,
            },
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
        },
        {
          name: 'Should return NotFound error if try to modify incorrect data type',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            member: {
              name: constants.getRandomString(),
              score: 0,
            },
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
        },
        {
          name: 'Should modify member with empty value',
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            member: {
              name: constants.TEST_ZSET_MEMBER_1,
              score: 1,
            },
          },
          statusCode: 200,
          after: async () => {
            expect(
              await rte.client.zrange(constants.TEST_ZSET_KEY_1, 0, 10),
            ).to.deep.eql([
              constants.TEST_ZSET_MEMBER_2,
              constants.TEST_ZSET_MEMBER_1,
            ]);
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
            keyName: constants.TEST_ZSET_KEY_1,
            member: {
              name: constants.TEST_ZSET_MEMBER_1,
              score: 0.1,
            },
          },
          statusCode: 200,
        },
        {
          name: 'Should throw error if no permissions for "zadd" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            member: {
              name: constants.getRandomString(),
              score: 0,
            },
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zadd'),
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            member: {
              name: constants.getRandomString(),
              score: 0,
            },
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
