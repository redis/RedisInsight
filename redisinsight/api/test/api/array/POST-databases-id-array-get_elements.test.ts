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
  JoiRedisString,
} from '../deps';

const { server, request, constants } = deps;
const rte = deps.rte as any;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/array/get-elements`,
  );

// Per-item indexes are validated by @IsArrayIndex({ each: true }), which emits
// a single combined message ("<field> must be an integer string between 0
// and 18446744073709551614") for any non-canonical item — and drops the array
// index marker (so an `indexes[0]` failure still surfaces as `indexes must be
// …`). Override the per-rule Joi messages with a label-less substring of the
// API output so the harness's substring-contains check passes.
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

// Gap-preserving response: items can be string|null in request order.
const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    elements: Joi.array().items(JoiRedisString.allow(null)).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('POST /databases/:instanceId/array/get-elements', () => {
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
    it('Should return values in request order with null for empty / past-end slots', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Request: 0 (populated), 2 (gap), 5 (populated), 999 (past end).
      // Contract: response.elements lines up 1:1 with request order;
      // empty slot and out-of-range index both surface as JSON null.
      await validateApiCall({
        endpoint,
        data: { keyName, indexes: ['0', '2', '5', '999'] },
        responseSchema,
        responseBody: {
          keyName,
          elements: ['20.1', null, '21.4', null],
        },
      });
    });

    it('Should return the same value twice when an index is repeated', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // ARMGET preserves request order, including duplicates — important for
      // consumers that lean on positional alignment with their own list.
      await validateApiCall({
        endpoint,
        data: { keyName, indexes: ['1', '1', '0'] },
        responseSchema,
        responseBody: {
          keyName,
          elements: ['20.4', '20.4', '20.1'],
        },
      });
    });

    it('Should return Buffer objects with null preserved when encoding=buffer', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Locks in the RedisStringToBufferTransformer null-passthrough fix at
      // the array-fill level: populated slots become {type:'Buffer', data},
      // empty slots stay as JSON null (no zero-length Buffer coercion).
      await validateApiCall({
        endpoint,
        query: { encoding: 'buffer' },
        data: { keyName, indexes: ['0', '2', '5'] },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.elements).to.eql([
            { type: 'Buffer', data: [...Buffer.from('20.1')] },
            null,
            { type: 'Buffer', data: [...Buffer.from('21.4')] },
          ]);
        },
      });
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: { keyName: constants.TEST_STRING_KEY_1, indexes: ['0'] },
        statusCode: 400,
        before: () => rte.data.generateKeys(true),
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
        name: 'Should return elements for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, indexes: ['0'] },
        responseSchema,
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'x');
        },
      },
      {
        name: 'Should throw error if no permissions for "armget" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, indexes: ['0'] },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root
        // client (ACL rules below only affect the API request).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'x');
          await rte.data.setAclUserRules('~* +@all -armget');
        },
      },
    ].map(mainCheckFn);
  });
});
