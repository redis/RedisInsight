import {
  expect,
  describe,
  it,
  before,
  beforeEach,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall,
  getMainCheckFn,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(`/${constants.API.DATABASES}/${instanceId}/vector-set/elements`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  elements: Joi.array().items(Joi.string()).min(1).required(),
}).strict();

const validInputData = {
  keyName: 'testVectorSet',
  elements: ['element1'],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/vector-set/elements', () => {
  // Vector sets require Redis 8.0+
  requirements('rte.version >= 8.0.0');

  describe('Main', () => {
    beforeEach(async () => {
      await rte.data.truncate();
      // Create a vector set for testing
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'element1',
        'VALUES',
        '3',
        '0.1',
        '0.2',
        '0.3',
      ], null);
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'element2',
        'VALUES',
        '3',
        '0.4',
        '0.5',
        '0.6',
      ], null);
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'element3',
        'VALUES',
        '3',
        '0.7',
        '0.8',
        '0.9',
      ], null);
    });

    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should delete single element from vector set',
          data: {
            keyName: 'testVectorSet',
            elements: ['element1'],
          },
          statusCode: 200,
          responseSchema: Joi.object({
            affected: Joi.number().required(),
          }),
          responseBody: {
            affected: 1,
          },
          after: async () => {
            const card = await rte.data.sendCommand('vcard', ['testVectorSet'], null);
            expect(card).to.eql(2);
          },
        },
        {
          name: 'Should delete multiple elements from vector set',
          data: {
            keyName: 'testVectorSet',
            elements: ['element1', 'element2'],
          },
          statusCode: 200,
          responseBody: {
            affected: 2,
          },
          after: async () => {
            const card = await rte.data.sendCommand('vcard', ['testVectorSet'], null);
            expect(card).to.eql(1);
          },
        },
        {
          name: 'Should return 0 affected when deleting non-existent element',
          data: {
            keyName: 'testVectorSet',
            elements: ['nonExistentElement'],
          },
          statusCode: 200,
          responseBody: {
            affected: 0,
          },
          after: async () => {
            // Verify no elements were deleted
            const card = await rte.data.sendCommand('vcard', ['testVectorSet'], null);
            expect(card).to.eql(3);
          },
        },
        {
          name: 'Should return NotFound error if key does not exist',
          data: {
            keyName: 'nonExistentKey',
            elements: ['element1'],
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          name: 'Should return NotFound error if instance id does not exist',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: 'testVectorSet',
            elements: ['element1'],
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
  });
});

