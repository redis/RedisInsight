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
  request(server).put(`/${constants.API.DATABASES}/${instanceId}/set`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  members: Joi.array().items(Joi.string()).required().messages({
    'string.base': 'members must be a string or a Buffer',
  }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  members: [constants.getRandomString()],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('PUT /databases/:instanceId/set', () => {
  describe('Modes', () => {
    requirements('!rte.bigData');
    beforeEach(() => rte.data.generateBinKeys(true));

    [
      {
        name: 'Should add member from buff',
        data: {
          keyName: constants.TEST_SET_KEY_BIN_BUF_OBJ_1,
          members: [constants.TEST_LIST_ELEMENT_BIN_BUF_OBJ_1],
        },
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_SET_KEY_BIN_BUFFER_1),
          ).to.eql(1);
          const [cursor, members] = await rte.data.sendCommand(
            'sscan',
            [constants.TEST_SET_KEY_BIN_BUFFER_1, 0, 'count', 100],
            null,
          );
          expect(cursor).to.deep.eq(Buffer.from('0'));
          expect(
            _.find(members, constants.TEST_LIST_ELEMENT_BIN_BUFFER_1),
          ).to.not.eq(undefined);
          expect(
            _.find(members, constants.TEST_SET_MEMBER_BIN_BUFFER_1),
          ).to.not.eq(undefined);
        },
      },
      {
        name: 'Should add member from ascii',
        data: {
          keyName: constants.TEST_SET_KEY_BIN_ASCII_1,
          members: [constants.TEST_LIST_ELEMENT_BIN_ASCII_1],
        },
        after: async () => {
          expect(
            await rte.client.exists(constants.TEST_SET_KEY_BIN_BUFFER_1),
          ).to.eql(1);
          const [cursor, members] = await rte.data.sendCommand(
            'sscan',
            [constants.TEST_SET_KEY_BIN_BUFFER_1, 0, 'count', 100],
            null,
          );
          expect(cursor).to.deep.eq(Buffer.from('0'));
          expect(
            _.find(members, constants.TEST_LIST_ELEMENT_BIN_BUFFER_1),
          ).to.not.eq(undefined);
          expect(
            _.find(members, constants.TEST_SET_MEMBER_BIN_BUFFER_1),
          ).to.not.eq(undefined);
        },
      },
    ].map(mainCheckFn);
  });

  describe('Main', function () {
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
          name: 'Should not modify set as such member already exists',
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: ['member_1'],
          },
          after: async () => {
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_2,
              0,
              'count',
              1000,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1].length).to.eql(100);
          },
        },
        {
          name: 'Should add single member',
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: [constants.getRandomString()],
          },
          after: async () => {
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_2,
              0,
              'count',
              1000,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1].length).to.eql(101);
          },
        },
        {
          name: 'Should add multiple members',
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: [
              constants.getRandomString(),
              constants.getRandomString(),
              constants.getRandomString(),
              constants.getRandomString(),
            ],
          },
          after: async () => {
            const scanResult = await rte.client.sscan(
              constants.TEST_SET_KEY_2,
              0,
              'count',
              1000,
            );
            expect(scanResult[0]).to.eql('0'); // full scan completed
            expect(scanResult[1].length).to.eql(105);
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
          name: 'Should add member',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            keyName: constants.TEST_SET_KEY_2,
            members: [constants.getRandomString()],
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
          name: 'Should throw error if no permissions for "sadd" command',
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
          before: () => rte.data.setAclUserRules('~* +@all -sadd'),
        },
      ].map(mainCheckFn);
    });
  });
});
