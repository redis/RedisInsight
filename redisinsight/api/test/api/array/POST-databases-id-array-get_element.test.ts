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
    `/${constants.API.DATABASES}/${instanceId}/array/get-element`,
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
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  index: '0',
};

// Empty slots and out-of-range indexes return value: null (key still exists);
// only a missing key turns into a 404.
const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    value: JoiRedisString.allow(null).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

// Seed shape mirrors the canonical `readings` fixture documented in the Bruno
// presets — indexes 0,1,5 populated, gaps at 2,3,4.
const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('POST /databases/:instanceId/array/get-element', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );

    [
      {
        name: 'Should reject a non-decimal index',
        data: { keyName: constants.getRandomString(), index: 'abc' },
        statusCode: 400,
      },
      {
        name: 'Should reject a non-canonical index with leading zero',
        data: { keyName: constants.getRandomString(), index: '007' },
        statusCode: 400,
      },
      {
        name: 'Should reject an index outside u64',
        data: {
          keyName: constants.getRandomString(),
          index: '18446744073709551616',
        },
        statusCode: 400,
      },
      {
        // 2^64-1 (18446744073709551615) is technically within u64 but Redis
        // reserves it as the "no-index" sentinel (ARSET / ARMSET reject it
        // server-side). Match that boundary at the API validator.
        name: 'Should reject the reserved 2^64-1 sentinel index',
        data: {
          keyName: constants.getRandomString(),
          index: '18446744073709551615',
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    it('Should return value for a populated index', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, index: '1' },
        responseSchema,
        responseBody: { keyName, value: '20.4' },
      });
    });

    it('Should return null for an empty slot within the array', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Index 3 sits inside the array's logical length (0..5) but is unset.
      // Contract: 200 OK with value:null, NOT 404 — key exists, slot is empty.
      await validateApiCall({
        endpoint,
        data: { keyName, index: '3' },
        responseSchema,
        responseBody: { keyName, value: null },
      });
    });

    it('Should return null for an index past the array length', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Index 999 is past length=6. ARGET still returns nil rather than
      // erroring out — same contract as an empty slot inside the array.
      await validateApiCall({
        endpoint,
        data: { keyName, index: '999' },
        responseSchema,
        responseBody: { keyName, value: null },
      });
    });

    it('Should round-trip a value stored at the maximum valid index (2^64-2)', async () => {
      const keyName = constants.getRandomString();
      const maxIndex = '18446744073709551614';

      // ARSET at the boundary the API validator permits, then read it back.
      // Guards both the validator accepting 2^64-2 and the bulk-reply path.
      await rte.client.call('ARSET', keyName, maxIndex, 'edge');

      await validateApiCall({
        endpoint,
        data: { keyName, index: maxIndex },
        responseSchema,
        responseBody: { keyName, value: 'edge' },
      });
    });

    it('Should return a Buffer object when encoding=buffer on a populated slot', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        query: { encoding: 'buffer' },
        data: { keyName, index: '0' },
        responseSchema,
        checkFn: ({ body }: any) => {
          // Buffer-mode populated value comes back as the {type, data} shape
          // produced by JSON-serializing a Node Buffer.
          expect(body.value).to.eql({
            type: 'Buffer',
            data: [...Buffer.from('20.1')],
          });
        },
      });
    });

    it('Should keep an empty slot as JSON null even when encoding=buffer', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Locks in the RedisStringToBufferTransformer null-passthrough fix:
      // a nil ARGET reply must not be coerced into a zero-length Buffer.
      await validateApiCall({
        endpoint,
        query: { encoding: 'buffer' },
        data: { keyName, index: '3' },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.value).to.eql(null);
        },
      });
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: { keyName: constants.TEST_STRING_KEY_1, index: '0' },
        statusCode: 400,
        before: () => rte.data.generateKeys(true),
      },
      {
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString(), index: '0' },
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
        data: { keyName: constants.getRandomString(), index: '0' },
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
        name: 'Should return value for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, index: '0' },
        responseSchema,
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'x');
        },
      },
      {
        name: 'Should throw error if no permissions for "arget" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, index: '0' },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root
        // client (ACL rules below only affect the API request).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'x');
          await rte.data.setAclUserRules('~* +@all -arget');
        },
      },
    ].map(mainCheckFn);
  });
});
