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
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/zSet`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  members: Joi.array()
    .items(
      Joi.object().keys({
        name: Joi.string().required().label('.name'),
        // todo: allow(true) - is incorrect but will be transformed to number by BE. Investigate/fix it
        score: Joi.number().required().allow(true).label('.score'),
      }),
    )
    .messages({
      'number.base': '{#lavel} must be a string or a number',
      'array.sparse': 'members must be either object or array',
      'array.base': 'property {#label} must be either object or array',
    }),
  expire: Joi.number().integer().allow(null).min(1).max(2147483647),
}).strict();

const validInputData = {
  keyName: constants.TEST_ZSET_KEY_1,
  members: [
    {
      name: constants.TEST_ZSET_MEMBER_1,
      score: constants.TEST_ZSET_MEMBER_1_SCORE,
    },
  ],
  expire: constants.TEST_ZSET_EXPIRE_1,
};

const mainCheckFn = getMainCheckFn(endpoint);

const createCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(0);
      }
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(1);
        expect(await rte.client.zrange(testCase.data.keyName, 0, 10)).to.eql([
          testCase.data.members[0].name,
        ]);
        if (testCase.data.expire) {
          expect(await rte.client.ttl(testCase.data.keyName)).to.gte(
            testCase.data.expire - 5,
          );
        } else {
          expect(await rte.client.ttl(testCase.data.keyName)).to.eql(-1);
        }
      }
    }
  });
};

describe('POST /databases/:instanceId/zSet', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(rte.data.truncate);

    [
      {
        name: 'Should create zset from buff',
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_BUF_OBJ_1,
          members: [
            {
              name: constants.TEST_ZSET_MEMBER_BIN_BUF_OBJ_1,
              score: 0,
            },
          ],
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_ZSET_KEY_BIN_BUFFER_1),
          ).to.eql(1);
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
        name: 'Should create zset from ascii',
        data: {
          keyName: constants.TEST_ZSET_KEY_BIN_ASCII_1,
          members: [
            {
              name: constants.TEST_ZSET_MEMBER_BIN_ASCII_1,
              score: 0,
            },
          ],
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_ZSET_KEY_BIN_BUFFER_1),
          ).to.eql(1);
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
    before(rte.data.truncate);

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should create item with empty value',
          data: {
            keyName: constants.getRandomString(),
            members: [
              {
                name: '',
                score: 0,
              },
            ],
          },
          statusCode: 201,
        },
        {
          name: 'Should create item with key ttl',
          data: {
            keyName: constants.getRandomString(),
            members: [
              {
                name: constants.getRandomString(),
                score: 0,
              },
            ],
            expire: constants.TEST_ZSET_EXPIRE_1,
          },
          statusCode: 201,
        },
        {
          name: 'Should create regular item',
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            members: [
              {
                name: constants.TEST_ZSET_MEMBER_1,
                score: 0,
              },
            ],
          },
          statusCode: 201,
        },
        {
          name: 'Should return conflict error if key already exists',
          data: {
            keyName: constants.TEST_ZSET_KEY_1,
            members: [
              {
                name: constants.getRandomString(),
                score: 0,
              },
            ],
          },
          statusCode: 409,
          responseBody: {
            statusCode: 409,
            error: 'Conflict',
            message: 'This key name is already in use.',
          },
          after: async () =>
            // check that value was not overwritten
            expect(
              await rte.client.zrange(constants.TEST_ZSET_KEY_1, 0, 10),
            ).to.eql([constants.TEST_ZSET_MEMBER_1]),
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            members: [
              {
                name: constants.getRandomString(),
                score: 0,
              },
            ],
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
            ).to.eql([constants.TEST_ZSET_MEMBER_1]),
        },
      ].map(createCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should create regular item',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            members: [
              {
                name: constants.getRandomString(),
                score: 0,
              },
            ],
          },
          statusCode: 201,
        },
        {
          name: 'Should throw error if no permissions for "zadd" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            members: [
              {
                name: constants.getRandomString(),
                score: 0,
              },
            ],
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
            members: [
              {
                name: constants.getRandomString(),
                score: 0,
              },
            ],
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -exists'),
        },
      ].map(createCheckFn);
    });
  });
});
