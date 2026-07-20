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
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/array/elements`,
  );

// Per-item indexes are validated by @IsArrayIndex({ each: true }), which emits
// a single combined message ("<field> must be an integer string between 0 and
// 18446744073709551614") for any non-canonical item. Override the per-rule Joi
// messages with a label-less substring so the harness's contains check passes.
const ARRAY_INDEX_MSG = 'must be an integer string between';

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  indexes: Joi.array()
    .items(Joi.string().messages({ 'string.base': ARRAY_INDEX_MSG }))
    .min(1)
    .required()
    .messages({ 'any.required': ARRAY_INDEX_MSG }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  indexes: ['0'],
};

const responseSchema = Joi.object()
  .keys({ affected: Joi.string().required() })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

// ARDEL/ARMSET/ARGET/ARCOUNT are Redis 8.8 preview commands with no typed
// ioredis method; assert array state through the generic `call`.
const arget = (key: string, index: string) =>
  rte.client.call('ARGET', key, index);
const arcount = (key: string) => rte.client.call('ARCOUNT', key);

// Seed shape mirrors the canonical `readings` fixture: indexes 0,1,5 populated,
// gaps at 2,3,4 (logical length 6, count 3).
const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('DELETE /databases/:instanceId/array/elements', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );

    [
      {
        name: 'Should reject an empty indexes array (ArrayMinSize)',
        data: { keyName: constants.getRandomString(), indexes: [] },
        statusCode: 400,
      },
      {
        name: 'Should reject a non-decimal index in the list',
        data: {
          keyName: constants.getRandomString(),
          indexes: ['0', 'abc', '2'],
        },
        statusCode: 400,
      },
      {
        name: 'Should reject an index outside u64 in the list',
        data: {
          keyName: constants.getRandomString(),
          indexes: ['0', '18446744073709551616'],
        },
        statusCode: 400,
      },
      {
        // 2^64-1 is reserved by Redis as the "no-index" sentinel; a single
        // bad item must invalidate the whole request (per-item @IsArrayIndex).
        name: 'Should reject when any index equals the reserved 2^64-1 sentinel',
        data: {
          keyName: constants.getRandomString(),
          indexes: ['0', '18446744073709551615', '5'],
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    it('Should delete populated indexes and count an empty-slot index as 0', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // 0 and 5 are populated; 3 is a gap, so the deleted count is 2.
      await validateApiCall({
        endpoint,
        data: { keyName, indexes: ['0', '3', '5'] },
        responseSchema,
        responseBody: { affected: '2' },
      });

      expect(await arget(keyName, '0')).to.eql(null);
      expect(await arget(keyName, '5')).to.eql(null);
      // Only index 1 survives.
      expect(await arcount(keyName)).to.eql(1);
    });

    it('Should count a repeated index only once', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Index 0 is populated but listed twice; it is deleted once and counts 1.
      await validateApiCall({
        endpoint,
        data: { keyName, indexes: ['0', '0'] },
        responseSchema,
        responseBody: { affected: '1' },
      });

      expect(await arget(keyName, '0')).to.eql(null);
      expect(await arcount(keyName)).to.eql(2);
    });

    it('Should remove the key when the last element is deleted', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('ARSET', keyName, '0', 'only');

      await validateApiCall({
        endpoint,
        data: { keyName, indexes: ['0'] },
        responseSchema,
        responseBody: { affected: '1' },
      });

      // Deleting the last element removes the key (server behaviour).
      expect(await rte.client.exists(keyName)).to.eql(0);
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: { keyName: constants.TEST_STRING_KEY_1, indexes: ['0'] },
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
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString(), indexes: ['0'] },
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
        data: { keyName: constants.getRandomString(), indexes: ['0'] },
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
        name: 'Should delete the element for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, indexes: ['0'] },
        responseSchema,
        responseBody: { affected: '1' },
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'seed');
        },
      },
      {
        name: 'Should throw error if no permissions for "ardel" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, indexes: ['0'] },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root client
        // (the ACL rule below only affects the API request's user).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'seed');
          await rte.data.setAclUserRules('~* +@all -ardel');
        },
      },
    ].map(mainCheckFn);
  });
});
