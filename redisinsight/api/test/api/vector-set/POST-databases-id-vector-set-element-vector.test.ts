import { before, deps, describe, expect, getMainCheckFn, Joi, requirements, } from '../deps';

const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/vector-set/element/vector`);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/vector-set/element/vector', () => {
  // Vector sets require Redis 8.0+
  requirements('rte.version >= 8.0.0');

  describe('Main', () => {
    before(async () => {
      await rte.data.truncate();
      // Create a vector set for testing
      // VADD syntax: VADD key (VALUES count) vector... element
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'VALUES',
        '4',
        '0.1',
        '0.2',
        '0.3',
        '0.4',
        'element1',
      ], null);
    });

    describe('Common', () => {
      [
        {
          name: 'Should get element vector',
          data: {
            keyName: 'testVectorSet',
            element: 'element1',
          },
          statusCode: 200,
          responseSchema: Joi.object({
            vector: Joi.array().items(Joi.number()).required(),
          }),
          checkFn: ({ body }) => {
            expect(body.vector).to.be.an('array');
            expect(body.vector.length).to.eql(4);
            // Check approximate values (Redis stores quantized approximations)
            expect(body.vector[0]).to.be.closeTo(0.1, 0.02);
            expect(body.vector[1]).to.be.closeTo(0.2, 0.02);
            expect(body.vector[2]).to.be.closeTo(0.3, 0.02);
            expect(body.vector[3]).to.be.closeTo(0.4, 0.02);
          },
        },
        {
          name: 'Should return NotFound error if element does not exist',
          data: {
            keyName: 'testVectorSet',
            element: 'nonExistentElement',
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          name: 'Should return NotFound error if key does not exist',
          data: {
            keyName: 'nonExistentKey',
            element: 'element1',
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
            element: 'element1',
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
