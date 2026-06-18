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
import { ArrayAggregateOperation } from 'src/modules/browser/array/dto';

const { server, request, constants } = deps;
const rte = deps.rte as any;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/array/aggregate`,
  );

// `start` and `end` carry the same @IsArrayIndex validator as get-range; the
// harness compares Joi-emitted messages as substrings of the API output, so
// override the per-rule messages with a label-less excerpt of what the API
// actually returns ("must be an integer string between 0 and 2^64-2").
const ARRAY_INDEX_MSG = 'must be an integer string between';

// class-validator's @IsEnum emits a single message for missing / non-string /
// out-of-enum inputs ("operation must be one of the following values: SUM,
// MIN, ..."). Override every Joi rule the harness generates with a shared
// substring so the `body.message.join() includes message` check passes.
const OPERATION_ENUM_MSG = 'operation must be one of the following values';

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
  operation: Joi.string()
    .valid(...Object.values(ArrayAggregateOperation))
    .required()
    .messages({
      'string.base': OPERATION_ENUM_MSG,
      'any.required': OPERATION_ENUM_MSG,
      'any.only': OPERATION_ENUM_MSG,
    }),
  // `value` is conditionally validated server-side (@ValidateIf operation ===
  // MATCH), so the auto-generated invalid cases would skip validation and 404
  // on the missing key. MATCH-specific coverage is added explicitly below.
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  start: '0',
  end: '5',
  operation: ArrayAggregateOperation.Sum,
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    // Nullable: AROP returns nil for numeric ops over a range with no
    // numeric values and for bitwise ops over an empty range.
    result: Joi.string().allow(null).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

// Sparse fixture: indexes 0,1,5 populated with numeric strings so the same
// seed exercises both numeric (SUM/MIN/MAX) and structural (USED/MATCH) ops.
const seedSparse = (key: string) =>
  rte.client.call('ARMSET', key, '0', '20.1', '1', '20.4', '5', '21.4');

describe('POST /databases/:instanceId/array/aggregate', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );

    [
      {
        name: 'Should reject an unknown operation',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '5',
          operation: 'AVG',
        },
        statusCode: 400,
      },
      {
        name: 'Should reject MATCH without a value arg',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '5',
          operation: ArrayAggregateOperation.Match,
        },
        statusCode: 400,
      },
      {
        name: 'Should reject MATCH with an empty value',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '5',
          operation: ArrayAggregateOperation.Match,
          value: '',
        },
        statusCode: 400,
      },
      {
        name: 'Should reject a non-decimal start index',
        data: {
          keyName: constants.getRandomString(),
          start: 'abc',
          end: '5',
          operation: ArrayAggregateOperation.Sum,
        },
        statusCode: 400,
      },
      {
        name: 'Should reject a span exceeding 1,000,000 elements',
        // span = |end - start| + 1 = 1_000_001 → just over the hard cap.
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '1000000',
          operation: ArrayAggregateOperation.Sum,
        },
        statusCode: 400,
        checkFn: ({ body }: any) => {
          expect(body.message).to.have.string('1 000 000');
        },
      },
      {
        // 2^64-1 is reserved by Redis as the "no-index" sentinel; rejected
        // by @IsArrayIndex before reaching the AROP call.
        name: 'Should reject when end equals the reserved 2^64-1 sentinel',
        data: {
          keyName: constants.getRandomString(),
          start: '0',
          end: '18446744073709551615',
          operation: ArrayAggregateOperation.Sum,
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Main', () => {
    it('Should SUM populated numeric values in range', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Sum of populated slots (0,1,5) → 20.1 + 20.4 + 21.4 = 61.9. Empty
      // slots (2,3,4) are excluded by AROP rather than treated as 0.
      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '5',
          operation: ArrayAggregateOperation.Sum,
        },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(body.keyName).to.eql(keyName);
          expect(typeof body.result).to.eql('string');
          expect(parseFloat(body.result)).to.be.closeTo(61.9, 1e-9);
        },
      });
    });

    it('Should return MIN over populated numeric values', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '5',
          operation: ArrayAggregateOperation.Min,
        },
        responseSchema,
        responseBody: { keyName, result: '20.1' },
      });
    });

    it('Should return MAX over populated numeric values', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '5',
          operation: ArrayAggregateOperation.Max,
        },
        responseSchema,
        responseBody: { keyName, result: '21.4' },
      });
    });

    it('Should count populated slots with USED', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // 3 populated slots (0,1,5) inside the 0..5 window — USED ignores gaps.
      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '5',
          operation: ArrayAggregateOperation.Used,
        },
        responseSchema,
        responseBody: { keyName, result: '3' },
      });
    });

    it('Should count equal occurrences with MATCH', async () => {
      const keyName = constants.getRandomString();
      // Two slots equal to "20.4" inside the window; MATCH returns the count.
      await rte.client.call(
        'ARMSET',
        keyName,
        '0',
        '20.1',
        '1',
        '20.4',
        '2',
        '20.4',
        '5',
        '21.4',
      );

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '5',
          operation: ArrayAggregateOperation.Match,
          value: '20.4',
        },
        responseSchema,
        responseBody: { keyName, result: '2' },
      });
    });

    it('Should MATCH binary (Buffer) values stored as raw bytes', async () => {
      const keyName = constants.getRandomString();
      // Element with unprintable bytes that can't round-trip through a
      // JSON string body — only the Buffer-typed `value` reaches the
      // backend intact.
      const binValue = Buffer.from([0x00, 0xff, 0x10, 0x7f]);
      await rte.client.call('ARMSET', keyName, '0', binValue, '1', binValue);

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '1',
          operation: ArrayAggregateOperation.Match,
          value: { type: 'Buffer', data: [...binValue] },
        },
        responseSchema,
        responseBody: { keyName, result: '2' },
      });
    });

    it('Should return null when SUM has no numeric values in range', async () => {
      const keyName = constants.getRandomString();
      // Seed only non-numeric values; SUM over the range yields a nil
      // AROP reply, which the API surfaces as `result: null` rather than
      // a 500 from the strict index normalizer.
      await rte.client.call('ARSET', keyName, '0', 'alpha', 'beta');

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '1',
          operation: ArrayAggregateOperation.Sum,
        },
        responseSchema,
        responseBody: { keyName, result: null },
      });
    });

    it('Should return null when AND is applied to an empty range', async () => {
      const keyName = constants.getRandomString();
      // Key exists (sparse fixture populates 0,1,5), but the [10..12]
      // window is empty so the bitwise AND has nothing to fold → nil.
      await seedSparse(keyName);

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '10',
          end: '12',
          operation: ArrayAggregateOperation.And,
        },
        responseSchema,
        responseBody: { keyName, result: null },
      });
    });

    it('Should return USED=0 for a range entirely past the end', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Range 10..12 has no populated slots; AROP returns 0 rather than 404 —
      // the key still exists, the window is just empty.
      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '10',
          end: '12',
          operation: ArrayAggregateOperation.Used,
        },
        responseSchema,
        responseBody: { keyName, result: '0' },
      });
    });

    it('Should ignore range direction (reversed bounds match forward result)', async () => {
      const keyName = constants.getRandomString();
      await seedSparse(keyName);

      // Per the DTO contract: AROP aggregates the same populated slots
      // regardless of start/end ordering. Reversed SUM must equal forward SUM.
      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '5',
          end: '0',
          operation: ArrayAggregateOperation.Sum,
        },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(parseFloat(body.result)).to.be.closeTo(61.9, 1e-9);
        },
      });
    });

    it('Should accept a span of exactly 1,000,000 elements', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('ARSET', keyName, '0', '7');

      // Boundary case: span = end - start + 1 = 1_000_000 → just within cap.
      // Only index 0 is populated, so USED is 1.
      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '999999',
          operation: ArrayAggregateOperation.Used,
        },
        responseSchema,
        responseBody: { keyName, result: '1' },
      });
    });

    it('Should accept the maximum valid index (2^64-2) in a single-slot window', async () => {
      const keyName = constants.getRandomString();
      const maxIndex = '18446744073709551614';

      // Pre-seed at the boundary; AROP USED [max, max] is span = 1 (within
      // cap) and proves the validator allows the upper edge of u64.
      await rte.client.call('ARSET', keyName, maxIndex, 'edge');

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: maxIndex,
          end: maxIndex,
          operation: ArrayAggregateOperation.Used,
        },
        responseSchema,
        responseBody: { keyName, result: '1' },
      });
    });

    it('Should preserve precision for numeric results above MAX_SAFE_INTEGER', async () => {
      const keyName = constants.getRandomString();
      // Two integer-valued elements whose sum is > Number.MAX_SAFE_INTEGER
      // (2^53 - 1). The contract is that the API returns the SUM as a
      // decimal string so precision survives — coercing to Number would
      // round to the nearest 2.
      await rte.client.call(
        'ARSET',
        keyName,
        '0',
        '9007199254740992',
        '9007199254740990',
      );

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          start: '0',
          end: '1',
          operation: ArrayAggregateOperation.Sum,
        },
        responseSchema,
        checkFn: ({ body }: any) => {
          expect(typeof body.result).to.eql('string');
          expect(body.result).to.eql('18014398509481982');
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
          operation: ArrayAggregateOperation.Used,
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
          operation: ArrayAggregateOperation.Used,
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
          operation: ArrayAggregateOperation.Used,
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
        name: 'Should aggregate for an authorised user',
        endpoint: aclEndpoint,
        data: {
          keyName: aclKey,
          start: '0',
          end: '0',
          operation: ArrayAggregateOperation.Used,
        },
        responseSchema,
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'x');
        },
      },
      {
        name: 'Should throw error if no permissions for "arop" command',
        endpoint: aclEndpoint,
        data: {
          keyName: aclKey,
          start: '0',
          end: '0',
          operation: ArrayAggregateOperation.Used,
        },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root
        // client (ACL rules below only affect the API request).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'x');
          await rte.data.setAclUserRules('~* +@all -arop');
        },
      },
    ].map(mainCheckFn);
  });
});
