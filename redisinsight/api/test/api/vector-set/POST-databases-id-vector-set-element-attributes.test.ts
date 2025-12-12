import { before, deps, describe, expect, getMainCheckFn, Joi, requirements, } from '../deps';

const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/vector-set/element/attributes`);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/vector-set/element/attributes', () => {
  // Vector sets require Redis 8.0+
  requirements('rte.version >= 8.0.0');

  describe('Main', () => {
    before(async () => {
      await rte.data.truncate();
      // Create a vector set with an element that has attributes
      // VADD syntax: VADD key (VALUES count) vector... element
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'VALUES',
        '3',
        '0.1',
        '0.2',
        '0.3',
        'element1',
      ], null);
      await rte.data.sendCommand('vsetattr', [
        'testVectorSet',
        'element1',
        JSON.stringify({ category: 'test', priority: 5 }),
      ], null);

      // Create element without attributes
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'VALUES',
        '3',
        '0.4',
        '0.5',
        '0.6',
        'element2',
      ], null);
    });

    describe('Common', () => {
      [
        {
          name: 'Should get element attributes',
          data: {
            keyName: 'testVectorSet',
            element: 'element1',
          },
          statusCode: 200,
          responseSchema: Joi.object({
            attributes: Joi.object().allow(null).required(),
          }),
          checkFn: ({ body }) => {
            expect(body.attributes).to.deep.eql({ category: 'test', priority: 5 });
          },
        },
        {
          name: 'Should return null attributes for element without attributes',
          data: {
            keyName: 'testVectorSet',
            element: 'element2',
          },
          statusCode: 200,
          checkFn: ({ body }) => {
            expect(body.attributes).to.be.null;
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
