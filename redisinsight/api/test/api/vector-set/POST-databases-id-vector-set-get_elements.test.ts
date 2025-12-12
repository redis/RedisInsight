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
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/vector-set/get-elements`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  count: Joi.number().integer().min(1).max(500).optional(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/vector-set/get-elements', () => {
  // Vector sets require Redis 8.0+
  requirements('rte.version >= 8.0.0');

  describe('Main', () => {
    before(async () => {
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
          name: 'Should get elements from vector set',
          data: {
            keyName: 'testVectorSet',
          },
          statusCode: 200,
          responseSchema: Joi.object({
            keyName: Joi.string().required(),
            total: Joi.number().required(),
            elements: Joi.array().items(
              Joi.object({
                name: Joi.string().required(),
              }),
            ).required(),
          }),
          responseBody: {
            total: 3,
          },
          checkFn: ({ body }) => {
            expect(body.elements.length).to.be.greaterThan(0);
            expect(body.elements.length).to.be.lessThanOrEqual(3);
          },
        },
        {
          name: 'Should get elements with custom count',
          data: {
            keyName: 'testVectorSet',
            count: 2,
          },
          statusCode: 200,
          checkFn: ({ body }) => {
            expect(body.total).to.eql(3);
            expect(body.elements.length).to.be.lessThanOrEqual(2);
          },
        },
        {
          name: 'Should return NotFound error if key does not exist',
          data: {
            keyName: 'nonExistentKey',
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

