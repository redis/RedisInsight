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
    `/${constants.API.DATABASES}/${instanceId}/array/set-element`,
  );

// `index` is validated by @IsArrayIndex on the API side, which emits a single
// combined message ("<field> must be an integer string between 0 and
// 18446744073709551614") for any non-canonical input. Override the per-rule
// Joi messages with a label-less substring of the API output so the harness's
// substring-contains check passes for undefined / null / number / boolean /
// object / array cases.
const ARRAY_INDEX_MSG = 'must be an integer string between';

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  index: Joi.string().required().messages({
    'string.base': ARRAY_INDEX_MSG,
    'any.required': ARRAY_INDEX_MSG,
  }),
  value: Joi.string().required(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  index: '0',
  value: constants.getRandomString(),
};

const mainCheckFn = getMainCheckFn(endpoint);

// ARSET/ARMSET/ARLEN/ARCOUNT are Redis 8.8 preview commands with no typed
// ioredis method; assert array state through the generic `call`.
const arget = (key: string, index: string) =>
  rte.client.call('ARGET', key, index);
const arlen = (key: string) => rte.client.call('ARLEN', key);
const arcount = (key: string) => rte.client.call('ARCOUNT', key);

// Seed shape mirrors the canonical `readings` fixture: indexes 0,1,5 populated,
// gaps at 2,3,4 (logical length 6, count 3).
const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('POST /databases/:instanceId/array/set-element', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );

    [
      {
        name: 'Should reject a non-decimal index',
        data: {
          keyName: constants.getRandomString(),
          index: 'abc',
          value: 'x',
        },
        statusCode: 400,
      },
      {
        name: 'Should reject a non-canonical index with a leading zero',
        data: {
          keyName: constants.getRandomString(),
          index: '007',
          value: 'x',
        },
        statusCode: 400,
      },
      {
        name: 'Should reject an index outside u64',
        data: {
          keyName: constants.getRandomString(),
          index: '18446744073709551616',
          value: 'x',
        },
        statusCode: 400,
      },
      {
        // 2^64-1 is reserved by Redis as the "no-index" sentinel — ARSET
        // rejects it server-side, so the API validator must too.
        name: 'Should reject the reserved 2^64-1 sentinel index',
        data: {
          keyName: constants.getRandomString(),
          index: '18446744073709551615',
          value: 'x',
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    it('Should overwrite a populated slot in place', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, index: '1', value: '99.9' },
      });

      expect(await arget(keyName, '1')).to.eql('99.9');
      // Overwriting a populated slot leaves length and count untouched.
      expect(await arlen(keyName)).to.eql(6);
      expect(await arcount(keyName)).to.eql(3);
    });

    it('Should fill an empty slot inside the array (count grows)', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Index 3 is a gap inside length 0..5; filling it adds a populated slot
      // without changing the logical length.
      await validateApiCall({
        endpoint,
        data: { keyName, index: '3', value: 'filled' },
      });

      expect(await arget(keyName, '3')).to.eql('filled');
      expect(await arlen(keyName)).to.eql(6);
      expect(await arcount(keyName)).to.eql(4);
    });

    it('Should set a value past the current length (length grows)', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, index: '20', value: 'far' },
      });

      expect(await arget(keyName, '20')).to.eql('far');
      // Length follows the highest set index + 1.
      expect(await arlen(keyName)).to.eql(21);
      expect(await arcount(keyName)).to.eql(4);
    });

    it('Should round-trip a value stored at the maximum valid index (2^64-2)', async () => {
      const keyName = constants.getRandomString();
      const maxIndex = '18446744073709551614';
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, index: maxIndex, value: 'edge' },
      });

      expect(await arget(keyName, maxIndex)).to.eql('edge');
    });

    it('Should store a value sent as encoding=buffer byte-for-byte', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        query: { encoding: 'buffer' },
        data: {
          keyName,
          index: '1',
          value: { type: 'Buffer', data: [...Buffer.from('20.5')] },
        },
      });

      expect(await arget(keyName, '1')).to.eql('20.5');
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: { keyName: constants.TEST_STRING_KEY_1, index: '0', value: 'x' },
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
        // Modify edits an existing array; ARSET on a missing key would create
        // one, so the service guards it as a 404 instead.
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString(), index: '0', value: 'x' },
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
        data: { keyName: constants.getRandomString(), index: '0', value: 'x' },
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
        name: 'Should set the element for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, index: '0', value: 'authorised' },
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'seed');
        },
        after: async () => {
          expect(await arget(aclKey, '0')).to.eql('authorised');
        },
      },
      {
        name: 'Should throw error if no permissions for "arset" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, index: '0', value: 'x' },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root client
        // (the ACL rule below only affects the API request's user).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'seed');
          await rte.data.setAclUserRules('~* +@all -arset');
        },
      },
    ].map(mainCheckFn);
  });
});
