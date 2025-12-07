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
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/zSet/members`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  members: Joi.array().items(Joi.any()).required(), // todo: investigate BE validation rules
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  members: [constants.getRandomString()],
};

const responseSchema = Joi.object()
  .keys({
    affected: Joi.number().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/zSet/members', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should remove member from buff',
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          members: [constants.TEST_ZSET_MEMBER_BIN_BUF_OBJ_1],
        },
        responseBody: {
          affected: 1,
        },
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_ZSET_KEY_BIN_BUFFER_1),
          ).to.eql(0);
        },
      },
      {
        name: 'Should add member from ascii',
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_ASCII_1,
          members: [constants.TEST_ZSET_MEMBER_BIN_ASCII_1],
        },
        responseBody: {
          affected: 1,
        },
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_ZSET_KEY_BIN_BUFFER_1),
          ).to.eql(0);
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
            members: [constants.getRandomString()],
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
            members: [constants.getRandomString()],
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Key with this name does not exist.',
          },
        },
        {
          name: 'Should return BadRequest error if try to modify incorrect data type',
          data: {
            keyName: constants.TEST_STRING_KEY_1,
            members: [constants.getRandomString()],
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
        },
        {
          name: 'Should remove single member',
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            members: ['member_1'],
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          after: async () => {
            const members = await rte.client.zrange(
              constants.TEST_ZSET_KEY_2,
              0,
              1000,
            );
            expect(members.length).to.eql(99);
          },
        },
        {
          name: 'Should remove multiple member',
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            members: ['member_2', 'member_3', 'member_4', 'member_100'],
          },
          responseSchema,
          responseBody: {
            affected: 4,
          },
          after: async () => {
            const members = await rte.client.zrange(
              constants.TEST_ZSET_KEY_2,
              0,
              1000,
            );
            expect(members.length).to.eql(95);
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
            members: [
              constants.TEST_ZSET_MEMBER_1,
              constants.TEST_ZSET_MEMBER_2,
            ],
          },
          responseBody: {
            affected: 2,
          },
          after: async () => {
            expect(await rte.client.exists(constants.TEST_ZSET_KEY_1)).to.eql(
              0,
            );
          },
        },
        {
          name: 'Should throw error if no permissions for "zrem" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            members: [constants.getRandomString()],
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -zrem'),
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_ZSET_KEY_2,
            members: [constants.getRandomString()],
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
