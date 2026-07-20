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
    `/${constants.API.DATABASES}/${instanceId}/array/get-range`,
  );

// `start` and `end` are validated by @IsArrayIndex on the API side, which
// emits a single combined message ("<field> must be an integer string between
// 0 and 18446744073709551614") for any non-canonical input. Override the
// per-rule Joi messages with a label-less substring of the API output so the
// harness's substring-contains check passes.
const ARRAY_INDEX_MSG = 'must be an integer string between';

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  start: Joi.string().required().messages({
    'string.base': ARRAY_INDEX_MSG,
    'any.required': ARRAY_INDEX_MSG,
  }),
  end: Joi.string().required().messages({
    'string.base': ARRAY_INDEX_MSG,
    'any.required': ARRAY_INDEX_MSG,
  }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  start: '0',
  end: '5',
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    elements: Joi.array().items(JoiRedisString.allow(null)).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('POST /databases/:instanceId/array/get-range', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );

    [
      {
        name: 'Should reject a non-decimal start index',
        data: { keyName: constants.getRandomString(), start: 'abc', end: '5' },
        statusCode: 400,
      },
      {
        name: 'Should reject a non-decimal end index',
        data: { keyName: constants.getRandomString(), start: '0', end: 'abc' },
        statusCode: 400,
      },
      {
        name: 'Should reject a range exceeding 1,000,000 elements',
        // span = end - start + 1 = 1_000_001 → just over the hard cap.
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '1000000',
        },
        statusCode: 400,
        checkFn: ({ body }: any) => {
          expect(body.message).to.have.string('1 000 000');
        },
      },
      {
        name: 'Should reject a reversed range exceeding the 1,000,000 cap',
        // |end - start| + 1 = 1_000_001 → cap is direction-agnostic.
        data: {
          keyName: constants.getRandomString(),
          start: '1000000',
          end: '0',
        },
        statusCode: 400,
        checkFn: ({ body }: any) => {
          expect(body.message).to.have.string('1 000 000');
        },
      },
      {
        // 2^64-1 is reserved by Redis as the "no-index" sentinel; the API
        // validator rejects it before the request reaches Redis.
        name: 'Should reject when end equals the reserved 2^64-1 sentinel',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '18446744073709551615',
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    it('Should return dense values in order with no nulls', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('ARSET', keyName, '0', 'a', 'b', 'c');

      await validateApiCall({
        endpoint,
        data: { keyName, start: '0', end: '2' },
        responseSchema,
        responseBody: { keyName, elements: ['a', 'b', 'c'] },
      });
    });

    it('Should preserve gaps as null across a sparse range', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Indexes 0,1,5 populated; 2,3,4 empty. Response must keep position.
      await validateApiCall({
        endpoint,
        data: { keyName, start: '0', end: '5' },
        responseSchema,
        responseBody: {
          keyName,
          elements: ['20.1', '20.4', null, null, null, '21.4'],
        },
      });
    });

    it('Should return elements in reverse index order when start > end', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Same sparse fixture as above; reversing the bounds reverses the
      // returned positions including the nulls for empty slots.
      await validateApiCall({
        endpoint,
        data: { keyName, start: '5', end: '0' },
        responseSchema,
        responseBody: {
          keyName,
          elements: ['21.4', null, null, null, '20.4', '20.1'],
        },
      });
    });

    it('Should return a single element when start equals end', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, start: '1', end: '1' },
        responseSchema,
        responseBody: { keyName, elements: ['20.4'] },
      });
    });

    it('Should accept a span of exactly 1,000,000 elements', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('ARSET', keyName, '0', 'x');

      // Boundary case: span = end - start + 1 = 1_000_000 → just within cap.
      await validateApiCall({
        endpoint,
        data: { keyName, start: '0', end: '999999' },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.elements).to.have.length(1_000_000);
          expect(body.elements[0]).to.eql('x');
          expect(body.elements[999_999]).to.eql(null);
        },
      });
    });

    it('Should return a one-element window at the maximum valid index (2^64-2)', async () => {
      const keyName = constants.getRandomString();
      const maxIndex = '18446744073709551614';

      // Pre-seed at the boundary; ARGETRANGE [max, max] is span = 1 (within
      // cap) and proves the validator allows the upper edge of u64.
      await rte.client.call('ARSET', keyName, maxIndex, 'edge');

      await validateApiCall({
        endpoint,
        data: { keyName, start: maxIndex, end: maxIndex },
        responseSchema,
        responseBody: { keyName, elements: ['edge'] },
      });
    });

    it('Should fill an entirely-past-end range with nulls', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Sparse length is 6; range 10..12 is entirely past the end. ARGETRANGE
      // returns a fully-null window rather than 404 — the key still exists.
      await validateApiCall({
        endpoint,
        data: { keyName, start: '10', end: '12' },
        responseSchema,
        responseBody: { keyName, elements: [null, null, null] },
      });
    });

    it('Should serialize populated values as Buffer objects with null preserved when encoding=buffer', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Locks in the RedisStringToBufferTransformer null-passthrough fix:
      // populated → {type:'Buffer', data}; gap → JSON null.
      await validateApiCall({
        endpoint,
        query: { encoding: 'buffer' },
        data: { keyName, start: '0', end: '2' },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.elements).to.eql([
            { type: 'Buffer', data: [...Buffer.from('20.1')] },
            { type: 'Buffer', data: [...Buffer.from('20.4')] },
            null,
          ]);
        },
      });
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: {
          keyName: constants.TEST_STRING_KEY_1,
          start: '0',
          end: '5',
        },
        statusCode: 400,
        before: () => rte.data.generateKeys(true),
      },
      {
        name: 'Should return NotFound if key does not exist',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '5',
        },
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
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '5',
        },
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
        name: 'Should return range for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, start: '0', end: '0' },
        responseSchema,
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'x');
        },
      },
      {
        name: 'Should throw error if no permissions for "argetrange" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, start: '0', end: '0' },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root
        // client (ACL rules below only affect the API request).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'x');
          await rte.data.setAclUserRules('~* +@all -argetrange');
        },
      },
    ].map(mainCheckFn);
  });
});
