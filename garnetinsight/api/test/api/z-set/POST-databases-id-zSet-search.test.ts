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
  JoiRedisString,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/zSet/search`);

// input data schema todo: investigate BE validation
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  cursor: Joi.number().integer().min(0).allow(true).required().messages({
    'any.required': '{#label} should not be empty',
  }),
  count: Joi.number().integer().min(1).allow(true, null).messages({
    'any.required': '{#label} should not be empty',
  }),
  match: Joi.string().required(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  cursor: 0,
  count: 15,
  match: '*',
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    total: Joi.number().integer().required(),
    nextCursor: Joi.number().integer().required(),
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

describe('POST /databases/:instanceId/zSet/search', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    before(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should find by buff (return utf8)',
        query: {
          encoding: 'utf8',
        },
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          cursor: 0,
          count: 15,
          match: constants.TEST_ZSET_KEY_BIN_UTF8_1.slice(0, -20) + '*',
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
        name: 'Should find by buff (return buff)',
        query: {
          encoding: 'buffer',
        },
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          cursor: 0,
          count: 15,
          match: constants.TEST_ZSET_KEY_BIN_UTF8_1.slice(0, -20) + '*',
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
        name: 'Should find by ascii (return ascii)',
        query: {
          encoding: 'ascii',
        },
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_ASCII_1,
          cursor: 0,
          count: 15,
          match: constants.TEST_ZSET_KEY_BIN_ASCII_1.slice(0, -30) + '*',
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
          name: 'Should find by exact match',
          data: {
            keyName: constants.TEST_ZSET_KEY_3,
            cursor: 0,
            count: 15,
            match: 'member_2555',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_ZSET_KEY_3);
            expect(body.total).to.eql(3000);
            expect(body.members.length).to.eq(1);
            expect(body.members[0].name).to.eq('member_2555');
            expect(body.members[0].score).to.eq(2555);
          },
        },
        {
          name: 'Should not find any member',
          data: {
            keyName: constants.TEST_ZSET_KEY_3,
            cursor: 0,
            count: 15,
            match: 'notExis*',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_ZSET_KEY_3);
            expect(body.total).to.eql(3000);
            expect(body.members.length).to.eq(0);
          },
        },
        {
          name: 'Should query 15 members',
          data: {
            keyName: constants.TEST_ZSET_KEY_3,
            cursor: 0,
            count: 15,
            match: '*',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_ZSET_KEY_3);
            expect(body.total).to.eql(3000);
            expect(body.members.length).to.gte(15);
            expect(body.members.length).to.lt(3000);
          },
        },
        {
          name: 'Should query members with * in the end',
          data: {
            keyName: constants.TEST_ZSET_KEY_3,
            cursor: 0,
            count: 15,
            match: 'member_215*',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_ZSET_KEY_3);
            expect(body.total).to.eql(3000);
            expect(body.members.length).to.eq(11);
          },
        },
        {
          name: 'Should query members with * in the beginning',
          data: {
            keyName: constants.TEST_ZSET_KEY_3,
            cursor: 0,
            count: 15,
            match: '*r_2155',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_ZSET_KEY_3);
            expect(body.total).to.eql(3000);
            expect(body.members.length).to.eq(1);
            expect(body.members[0].name).to.eq('member_2155');
            expect(body.members[0].score).to.eq(2155);
          },
        },
        {
          name: 'Should query members with * in the middle',
          data: {
            keyName: constants.TEST_ZSET_KEY_3,
            cursor: 0,
            count: 15,
            match: 'mem*r_2155',
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_ZSET_KEY_3);
            expect(body.total).to.eql(3000);
            expect(body.members.length).to.eq(1);
            expect(body.members[0].name).to.eq('member_2155');
            expect(body.members[0].score).to.eq(2155);
          },
        },
        {
          name: 'Should return NotFound error if key does not exists',
          data: {
            keyName: constants.getRandomString(),
            cursor: 0,
            count: 15,
            match: '*',
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
            cursor: 0,
            count: 15,
            match: '*',
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
        const ELEMENTS_NUMBER = 1_000_000;

        requirements('rte.bigData');
        [
          {
            name: 'Should get member using "exists" cmd without full scan',
            data: {
              keyName: constants.TEST_ZSET_HUGE_KEY,
              cursor: 0,
              match: constants.TEST_ZSET_HUGE_MEMBER,
            },
            responseSchema,
            responseBody: {
              keyName: constants.TEST_ZSET_HUGE_KEY,
              total: ELEMENTS_NUMBER,
              members: [
                {
                  name: constants.TEST_ZSET_HUGE_MEMBER,
                  score: constants.TEST_ZSET_HUGE_SCORE,
                },
              ],
              nextCursor: 0,
            },
          },
          {
            name: 'Should get elements with possibility to continue iterating',
            data: {
              keyName: constants.TEST_ZSET_HUGE_KEY,
              cursor: 0,
              match: '*',
            },
            responseSchema,
            checkFn: ({ body }) => {
              expect(body.keyName).to.eql(constants.TEST_ZSET_HUGE_KEY);
              expect(body.total).to.eql(ELEMENTS_NUMBER);
              expect(body.nextCursor).to.not.eql(0);
              expect(body.members.length).to.gte(200);
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
          name: 'Should remove all members and key',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            cursor: 0,
            count: 15,
            match: '*',
          },
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "zcard" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            cursor: 0,
            count: 15,
            match: '*',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zcard'),
        },
        {
          name: 'Should throw error if no permissions for "zscan" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            cursor: 0,
            count: 15,
            match: '*',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zscan'),
        },
        {
          name: 'Should throw error if no permissions for "zscore" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            cursor: 0,
            count: 15,
            match: 'member_1',
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zscore'),
        },
      ].map(mainCheckFn);
    });
  });
});
