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
// The harness types deps.rte as null until initRTE runs; the existing array
// create test casts to any for the same reason.
const rte = deps.rte as any;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/array/get-length`,
  );

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
};

// length is a decimal-string contract (u64), not a number — pin it tight.
const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    length: Joi.string().pattern(/^\d+$/).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/array/get-length', () => {
  // Array is a Redis 8.8 preview type; skip where the server lacks ARLEN.
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Main', () => {
    it('Should return length for a dense array', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('ARSET', keyName, '0', 'a', 'b', 'c');

      await validateApiCall({
        endpoint,
        data: { keyName },
        responseSchema,
        responseBody: { keyName, length: '3' },
      });
    });

    it('Should return length spanning gaps for a sparse array', async () => {
      const keyName = constants.getRandomString();
      // Highest set index is 5, so length is 6 even though only 3 slots are populated.
      await rte.client.call(
        'ARMSET',
        keyName,
        '0',
        '20.1',
        '1',
        '20.4',
        '5',
        '21.4',
      );

      await validateApiCall({
        endpoint,
        data: { keyName },
        responseSchema,
        responseBody: { keyName, length: '6' },
      });
    });

    it('Should preserve u64 precision (length above MAX_SAFE_INTEGER)', async () => {
      const keyName = constants.getRandomString();
      // Highest index 2^63 + 10 — well above Number.MAX_SAFE_INTEGER; the
      // BE must serialize as a decimal string or precision is silently lost.
      const hugeIndex = '9223372036854775818';
      const expectedLength = '9223372036854775819';
      await rte.client.call('ARMSET', keyName, hugeIndex, 'x');

      await validateApiCall({
        endpoint,
        data: { keyName },
        responseSchema,
        responseBody: { keyName, length: expectedLength },
        checkFn: ({ body }: any) => {
          // Lock the contract: this must arrive as a string, not a number.
          expect(typeof body.length).to.eql('string');
          expect(body.length).to.eql(expectedLength);
        },
      });
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: {
          keyName: constants.TEST_STRING_KEY_1,
        },
        statusCode: 400,
        before: () => rte.data.generateKeys(true),
      },
      {
        name: 'Should return NotFound if key does not exist',
        data: { keyName: constants.getRandomString() },
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
        data: { keyName: constants.getRandomString() },
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
        name: 'Should return length for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey },
        responseSchema,
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'x');
        },
      },
      {
        name: 'Should throw error if no permissions for "arlen" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root
        // client (ACL rules below only affect the API request).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'x');
          await rte.data.setAclUserRules('~* +@all -arlen');
        },
      },
    ].map(mainCheckFn);
  });
});
