import {
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
    `/${constants.API.DATABASES}/${instanceId}/array/get-count`,
  );

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
};

const responseSchema = Joi.object()
  .keys({
    keyName: JoiRedisString.required(),
    count: Joi.string().pattern(/^\d+$/).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/array/get-count', () => {
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Main', () => {
    it('Should return count equal to length for a dense array', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('ARSET', keyName, '0', 'a', 'b', 'c');

      await validateApiCall({
        endpoint,
        data: { keyName },
        responseSchema,
        responseBody: { keyName, count: '3' },
      });
    });

    it('Should diverge from length for a sparse array', async () => {
      const keyName = constants.getRandomString();
      // Sparse: indexes 0,1,5 populated → count=3, length=6. The point of
      // ARCOUNT is that it stays cheap even when length grows; pinning the
      // divergence locks in that the two commands are surfaced independently.
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
        responseBody: { keyName, count: '3' },
      });
    });

    [
      {
        name: 'Should return BadRequest if key holds a non-array type',
        data: { keyName: constants.TEST_STRING_KEY_1 },
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
        name: 'Should return count for an authorised user',
        endpoint: aclEndpoint,
        data: { keyName: aclKey },
        responseSchema,
        before: async () => {
          await rte.data.setAclUserRules('~* +@all');
          await rte.client.call('ARSET', aclKey, '0', 'x');
        },
      },
      {
        name: 'Should throw error if no permissions for "arcount" command',
        endpoint: aclEndpoint,
        data: { keyName: aclKey },
        statusCode: 403,
        responseBody: { statusCode: 403, error: 'Forbidden' },
        // beforeEach() wipes the key between tests; reseed via the root
        // client (ACL rules below only affect the API request).
        before: async () => {
          await rte.client.call('ARSET', aclKey, '0', 'x');
          await rte.data.setAclUserRules('~* +@all -arcount');
        },
      },
    ].map(mainCheckFn);
  });
});
