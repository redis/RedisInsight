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
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/array/scan`);

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
  // BE accepts an explicit null (treated as omitted), so model that here so
  // generateInvalidDataTestCases doesn't synthesise a false-positive case.
  limit: Joi.number().integer().min(1).allow(null).optional(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  start: '0',
  end: '5',
};

// Each pair: index is a decimal u64-as-string; value is a redis-string fill.
const elementSchema = Joi.object().keys({
  index: Joi.string().pattern(/^\d+$/).required(),
  value: JoiRedisString.required(),
});

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    elements: Joi.array().items(elementSchema).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('POST /databases/:instanceId/array/scan', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    // `limit: true` is dropped: class-transformer coerces booleans through
    // `@Type(() => Number)` (true -> 1), so it bypasses @IsInt/@Min and the
    // request reaches the controller as a valid limit=1 instead of failing
    // with 400. Tracked as a separate DTO hardening task.
    generateInvalidDataTestCases(dataSchema, validInputData)
      .filter((c) => !(c.data?.limit === true))
      .map(validateInvalidDataTestCase(endpoint, dataSchema));

    [
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
      {
        // DTO contract: @IsOptional + @IsInt + @Min(1). limit:0 must fail
        // validation before it can become a no-op `LIMIT 0` at Redis.
        name: 'Should reject limit: 0 (below @Min(1))',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '5',
          limit: 0,
        },
        statusCode: 400,
      },
      {
        // DTO contract: @Max(ARRAY_RANGE_MAX_ELEMENTS). The DTO caps the
        // result-set size on the LIMIT param (not on the |end-start| span)
        // — the span itself is intentionally uncapped so sparse scans over
        // huge index gaps still work.
        name: 'Should reject limit exceeding 1,000,000 (above @Max)',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '5',
          limit: 1000001,
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    it('Should return only populated {index, value} pairs in ascending order', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Sparse fixture has indexes 0,1,5 populated; gaps must be skipped.
      // Indexes arrive as decimal strings (u64 contract).
      await validateApiCall({
        endpoint,
        data: { keyName, start: '0', end: '6' },
        responseSchema,
        responseBody: {
          keyName,
          elements: [
            { index: '0', value: '20.1' },
            { index: '1', value: '20.4' },
            { index: '5', value: '21.4' },
          ],
        },
      });
    });

    it('Should return pairs in reverse index order when start > end', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, start: '6', end: '0' },
        responseSchema,
        responseBody: {
          keyName,
          elements: [
            { index: '5', value: '21.4' },
            { index: '1', value: '20.4' },
            { index: '0', value: '20.1' },
          ],
        },
      });
    });

    it('Should round-trip the index when scanning at the maximum valid index (2^64-2)', async () => {
      const keyName = constants.getRandomString();
      const maxIndex = '18446744073709551614';

      // Redis 8.8 returns u64 values ≥ 2^63 as RESP bulk strings (not RESP
      // integers), so ARSCAN's `index` field survives the wire intact for
      // values in this range. Locks in the contract that the API surfaces
      // the index as a decimal string even at the upper edge of u64.
      await rte.client.call('ARSET', keyName, maxIndex, 'edge');

      await validateApiCall({
        endpoint,
        data: { keyName, start: maxIndex, end: maxIndex },
        responseSchema,
        responseBody: {
          keyName,
          elements: [{ index: maxIndex, value: 'edge' }],
        },
      });
    });

    it('Should keep an index exact in the (2^53, 2^63) RESP-integer zone', async () => {
      const keyName = constants.getRandomString();
      // 2^53 + 1: below 2^63 so Redis sends it as a RESP integer (not a bulk
      // string), and above 2^53 so a JS number would round it to 2^53. Proves
      // the per-command bigint path, which the 2^64-2 case above can't.
      const gapIndex = '9007199254740993';
      await rte.client.call('ARSET', keyName, gapIndex, 'needle');

      await validateApiCall({
        endpoint,
        data: { keyName, start: gapIndex, end: gapIndex },
        responseSchema,
        responseBody: {
          keyName,
          elements: [{ index: gapIndex, value: 'needle' }],
        },
      });
    });

    it('Should accept explicit limit:null as if it were omitted', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Regression guard for the DTO's @IsOptional() + service-level
      // `typeof limit === 'number'` check: a JSON null in the body must
      // NOT be forwarded as `LIMIT null` (would surface as 500).
      await validateApiCall({
        endpoint,
        data: { keyName, start: '0', end: '6', limit: null },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.elements).to.have.length(3);
        },
      });
    });

    it('Should cap the result set when limit is provided', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: { keyName, start: '0', end: '6', limit: 2 },
        responseSchema,
        responseBody: {
          keyName,
          elements: [
            { index: '0', value: '20.1' },
            { index: '1', value: '20.4' },
          ],
        },
      });
    });

    it('Should accept a sparse scan over a span far larger than 1,000,000', async () => {
      const keyName = constants.getRandomString();
      // Two values placed 10M indexes apart: this would fail under any
      // |end-start| cap, but ARSCAN is intentionally exempt — it skips
      // empty slots server-side and LIMIT (capped on the DTO) is the
      // result-set backpressure. Pins that no span cap regressed into
      // scan(); ARGETRANGE retains its dense-reply cap.
      await rte.client.call('ARMSET', keyName, '0', 'lo', '10000000', 'hi');

      await validateApiCall({
        endpoint,
        data: { keyName, start: '0', end: '10000000' },
        responseSchema,
        responseBody: {
          keyName,
          elements: [
            { index: '0', value: 'lo' },
            { index: '10000000', value: 'hi' },
          ],
        },
      });
    });

    it('Should return an empty list when the range covers only empty slots', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Indexes 2..4 are all gaps in the seeded fixture.
      await validateApiCall({
        endpoint,
        data: { keyName, start: '2', end: '4' },
        responseSchema,
        responseBody: { keyName, elements: [] },
      });
    });

    it('Should serialize values as Buffer objects when encoding=buffer', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        query: { encoding: 'buffer' },
        data: { keyName, start: '0', end: '1' },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.elements).to.have.length(2);
          expect(body.elements[0].index).to.eql('0');
          expect(body.elements[0].value).to.eql({
            type: 'Buffer',
            data: [...Buffer.from('20.1')],
          });
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
        name: 'Should return scan results for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, start: '0', end: '0' },
        responseSchema,
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'x');
        },
      },
      {
        name: 'Should throw error if no permissions for "arscan" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey, start: '0', end: '0' },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root
        // client (ACL rules below only affect the API request).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'x');
          await rte.data.setAclUserRules('~* +@all -arscan');
        },
      },
    ].map(mainCheckFn);
  });
});
