import {
  expect,
  describe,
  _,
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
    `/${constants.API.DATABASES}/${instanceId}/set/members`,
  );

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  members: Joi.array().items(Joi.any()).required(), // todo: look at BE validation rules for string members
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  members: [constants.getRandomString()],
};

const responseSchema = Joi.object()
  .keys({
    affected: Joi.number().integer().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/set/members', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should remove member from buff',
        data: {
          keyName: constants.TEST_SET_KEY_BIN_BUF_OBJ_1,
          members: [constants.TEST_SET_MEMBER_BIN_BUF_OBJ_1],
        },
        responseBody: {
          affected: 1,
        },
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_SET_KEY_BIN_BUFFER_1),
          ).to.eql(0);
        },
      },
      {
        name: 'Should add member from ascii',
        data: {
          keyName: constants.TEST_SET_KEY_BIN_ASCII_1,
          members: [constants.TEST_SET_MEMBER_BIN_ASCII_1],
        },
        responseBody: {
          affected: 1,
        },
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_SET_KEY_BIN_BUFFER_1),
          ).to.eql(0);
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
      before(async () => await rte.data.generateKeys(true));

      [
        {
          name: 'Should delete single member',
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: ['member_1'],
          },
          responseSchema,
          responseBody: {
            affected: 1,
          },
          after: async () => {
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_2,
              0,
              'count',
              1000,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1].length).to.eql(99);
          },
        },
        {
          name: 'Should delete multiple members',
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: ['member_2', 'member_3', 'member_4'],
          },
          responseSchema,
          responseBody: {
            affected: 3,
          },
          after: async () => {
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_2,
              0,
              'count',
              1000,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1].length).to.eql(96);
          },
        },
        {
          name: 'Should not delete any member if incorrect member passed',
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: [constants.getRandomString()],
          },
          responseSchema,
          responseBody: {
            affected: 0,
          },
          after: async () => {
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_2,
              0,
              'count',
              1000,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1].length).to.eql(96);
          },
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
          name: 'Should return NotFound error if instance id does not exists',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.TEST_LIST_KEY_2,
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
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should delete member',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: [constants.getRandomString()],
          },
          responseSchema,
          responseBody: {
            affected: 0,
          },
        },
        {
          name: 'Should throw error if no permissions for "exists" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: [constants.getRandomString()],
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -exists'),
        },
        {
          name: 'Should throw error if no permissions for "srem" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: [constants.getRandomString()],
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -srem'),
        },
      ].map(mainCheckFn);
    });
  });
});
