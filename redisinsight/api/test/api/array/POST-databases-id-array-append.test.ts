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

const { server, request, constants } = deps;
const rte = deps.rte as any;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/array/append`,
  );

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  value: Joi.string().required(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  value: constants.getRandomString(),
};

const mainCheckFn = getMainCheckFn(endpoint);

// ARSET/ARMSET/ARLEN/ARCOUNT are Redis 8.8 preview commands with no typed
// ioredis method; assert array state through the generic `call`.
const arget = (key: string, index: string) =>
  rte.client.call('ARGET', key, index);
const arlen = (key: string) => rte.client.call('ARLEN', key);

// Seed shape mirrors the canonical `readings` fixture: indexes 0,1,5 populated,
// gaps at 2,3,4 (logical length 6) — so the end index is 6.
const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('POST /databases/:instanceId/array/append', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Main', () => {
    it('Should append at the end (index = current length) and grow length', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, value: 'appended' },
        responseBody: { keyName, index: '6' },
      });

      expect(await arget(keyName, '6')).to.eql('appended');
      expect(await arlen(keyName)).to.eql(7);
    });

    it('Should place consecutive appends at increasing indexes', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, value: 'first' },
        responseBody: { keyName, index: '6' },
      });
      await validateApiCall({
        endpoint,
        data: { keyName, value: 'second' },
        responseBody: { keyName, index: '7' },
      });

      expect(await arget(keyName, '6')).to.eql('first');
      expect(await arget(keyName, '7')).to.eql('second');
      expect(await arlen(keyName)).to.eql(8);
    });

    it('Should append a value sent as encoding=buffer byte-for-byte', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        query: { encoding: 'buffer' },
        data: {
          keyName,
          value: { type: 'Buffer', data: [...Buffer.from('20.5')] },
        },
      });

      expect(await arget(keyName, '6')).to.eql('20.5');
    });

    // Above 2^53 ioredis parses the ARLEN reply as a JS number and drops the
    // low bit, so append derives the wrong end index. This is purely the
    // integer-transport limitation tracked by RI-8296 (ioredis
    // `stringNumbers`); the service keeps the index as a string, so it flips
    // green once the client returns 64-bit integers losslessly. Skipped until.
    it.skip('Should append precisely above 2^53 (needs ioredis 64-bit int fix — RI-8296)', async () => {
      const keyName = constants.getRandomString();
      // Length becomes 2^53 + 1 (9007199254740993) — odd, not representable as
      // a JS double, so a rounded read would collide with the seeded element.
      await rte.client.call('ARSET', keyName, '9007199254740992', 'base');

      await validateApiCall({
        endpoint,
        data: { keyName, value: 'appended' },
        responseBody: { keyName, index: '9007199254740993' },
      });

      expect(await arget(keyName, '9007199254740992')).to.eql('base');
      expect(await arget(keyName, '9007199254740993')).to.eql('appended');
    });

    it('Should return BadRequest when the array is full (no index left to append)', async () => {
      const keyName = constants.getRandomString();
      // Top index = 2^64-2 (max valid) → length 2^64-1, the reserved index.
      await rte.client.call('ARSET', keyName, '18446744073709551614', 'top');

      await validateApiCall({
        endpoint,
        data: { keyName, value: 'overflow' },
        statusCode: 400,
      });

      // The full array is left untouched.
      expect(await arget(keyName, '18446744073709551614')).to.eql('top');
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: { keyName: constants.TEST_STRING_KEY_1, value: 'x' },
        statusCode: 400,
        before: () => rte.data.generateKeys(true),
        after: async () => {
          // The non-array key must be left untouched.
          expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eql(
            constants.TEST_STRING_VALUE_1,
          );
        },
      },
      {
        // Append targets an existing array; the service guards a missing key
        // as a 404 rather than creating one.
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString(), value: 'x' },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Key with this name does not exist.',
        },
      },
      {
        name: 'Should return NotFound if instance id does not exist',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: { keyName: constants.getRandomString(), value: 'x' },
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

    const aclEndpoint = () => endpoint(constants.TEST_INSTANCE_ACL_ID);
    const aclKey = constants.getRandomString();

    [
      {
        name: 'Should append for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, value: 'authorised' },
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'seed');
        },
        after: async () => {
          expect(await arget(aclKey, '1')).to.eql('authorised');
        },
      },
      {
        name: 'Should throw error if no permissions for "arset" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, value: 'x' },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root client
        // (the ACL rule below only affects the API request's user). Append
        // performs ARSET, so removing it triggers NOPERM.
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'seed');
          await rte.data.setAclUserRules('~* +@all -arset');
        },
      },
    ].map(mainCheckFn);
  });
});
