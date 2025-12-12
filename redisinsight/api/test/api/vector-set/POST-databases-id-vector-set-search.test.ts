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
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/vector-set/search`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  vector: Joi.array().items(Joi.number()).min(1).required(),
  count: Joi.number().integer().min(1).max(1000).optional(),
  ef: Joi.number().integer().min(1).optional(),
  filter: Joi.string().optional(),
  withScores: Joi.boolean().optional(),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  vector: [0.1, 0.2, 0.3],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/vector-set/search', () => {
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
        '0.9',
        '0.9',
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
          name: 'Should search vector set and find similar elements',
          data: {
            keyName: 'testVectorSet',
            vector: [0.1, 0.2, 0.3],
            count: 10,
          },
          statusCode: 200,
          responseSchema: Joi.object({
            keyName: Joi.string().required(),
            results: Joi.array().items(
              Joi.object({
                name: Joi.string().required(),
                score: Joi.number().optional(),
              }),
            ).required(),
          }),
          checkFn: ({ body }) => {
            expect(body.results.length).to.be.greaterThan(0);
            // element1 should be the most similar (exact match)
            expect(body.results[0].name).to.eql('element1');
          },
        },
        {
          name: 'Should search with withScores=true and return scores',
          data: {
            keyName: 'testVectorSet',
            vector: [0.1, 0.2, 0.3],
            withScores: true,
          },
          statusCode: 200,
          checkFn: ({ body }) => {
            expect(body.results.length).to.be.greaterThan(0);
            expect(body.results[0]).to.have.property('score');
            expect(body.results[0].score).to.be.a('number');
          },
        },
        {
          name: 'Should limit results with count parameter',
          data: {
            keyName: 'testVectorSet',
            vector: [0.5, 0.5, 0.5],
            count: 2,
          },
          statusCode: 200,
          checkFn: ({ body }) => {
            expect(body.results.length).to.be.lessThanOrEqual(2);
          },
        },
        {
          name: 'Should return NotFound error if key does not exist',
          data: {
            keyName: 'nonExistentKey',
            vector: [0.1, 0.2, 0.3],
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
            vector: [0.1, 0.2, 0.3],
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

