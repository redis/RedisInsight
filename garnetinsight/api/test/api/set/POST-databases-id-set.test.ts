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
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/set`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  members: Joi.array().items(Joi.string().allow(null)).required().messages({
    'string.base': 'members must be a string or a Buffer',
  }),
  expire: Joi.number().integer().allow(null).min(1).max(2147483647),
}).strict();

const validInputData = {
  keyName: constants.TEST_SET_KEY_1,
  members: [constants.TEST_SET_MEMBER_1],
  expire: constants.TEST_SET_EXPIRE_1,
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
        const scanResult = await rte.client.sscan(
          testCase.data.keyName,
          0,
          'count',
          100,
        );
        expect(scanResult[0]).to.eql('0'); // full scan completed
        expect(scanResult[1]).to.eql(testCase.data.members);
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

describe('POST /databases/:instanceId/set', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(rte.data.truncate);

    [
      {
        name: 'Should create set from buff',
        data: {
          keyName: constants.TEST_SET_KEY_BIN_BUF_OBJ_1,
          members: [constants.TEST_SET_MEMBER_BIN_BUF_OBJ_1],
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_SET_KEY_BIN_BUFFER_1),
          ).to.eql(1);
          expect(
            await rte.data.sendCommand(
              'sscan',
              [constants.TEST_SET_KEY_BIN_BUFFER_1, 0, 'count', 100],
              null,
            ),
          ).to.deep.eq([
            Buffer.from('0'),
            [constants.TEST_SET_MEMBER_BIN_BUFFER_1],
          ]);
        },
      },
      {
        name: 'Should create set from ascii',
        data: {
          keyName: constants.TEST_SET_KEY_BIN_ASCII_1,
          members: [constants.TEST_SET_MEMBER_BIN_ASCII_1],
        },
        statusCode: 201,
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_SET_KEY_BIN_BUFFER_1),
          ).to.eql(1);
          expect(
            await rte.data.sendCommand(
              'sscan',
              [constants.TEST_SET_KEY_BIN_BUFFER_1, 0, 'count', 100],
              null,
            ),
          ).to.deep.eq([
            Buffer.from('0'),
            [constants.TEST_SET_MEMBER_BIN_BUFFER_1],
          ]);
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
            members: [''],
          },
          statusCode: 201,
        },
        {
          name: 'Should create item with key ttl',
          data: {
            keyName: constants.getRandomString(),
            members: [constants.getRandomString()],
            expire: constants.TEST_SET_EXPIRE_1,
          },
          statusCode: 201,
        },
        {
          name: 'Should create regular item',
          data: {
            keyName: constants.TEST_SET_KEY_1,
            members: [constants.TEST_SET_MEMBER_1],
          },
          statusCode: 201,
        },
        {
          name: 'Should return conflict error if key already exists',
          data: {
            keyName: constants.TEST_SET_KEY_1,
            members: [constants.getRandomString()],
          },
          statusCode: 409,
          responseBody: {
            statusCode: 409,
            error: 'Conflict',
            message: 'This key name is already in use.',
          },
          after: async () => {
            // check that value was not overwritten
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_1,
              0,
              'count',
              100,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1]).to.eql([constants.TEST_SET_MEMBER_1]);
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_1,
            members: [constants.getRandomString()],
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
          after: async () => {
            // check that value was not overwritten
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_1,
              0,
              'count',
              100,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1]).to.eql([constants.TEST_SET_MEMBER_1]);
          },
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
            members: [constants.getRandomString()],
          },
          statusCode: 201,
        },
        {
          name: 'Should throw error if no permissions for "sadd" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            members: [constants.getRandomString()],
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -sadd'),
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.getRandomString(),
            members: [constants.getRandomString()],
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
