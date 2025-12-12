import { before, deps, describe, expect, getMainCheckFn, requirements, } from '../deps';

const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).patch(`/${constants.API.DATABASES}/${instanceId}/vector-set/attributes`);

const mainCheckFn = getMainCheckFn(endpoint);

describe('PATCH /databases/:instanceId/vector-set/attributes', () => {
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
        '3',
        '0.1',
        '0.2',
        '0.3',
        'element1',
      ], null);
    });

    describe('Common', () => {
      [
        {
          name: 'Should update element attributes',
          data: {
            keyName: 'testVectorSet',
            element: 'element1',
            attributes: { category: 'test', score: 100 },
          },
          statusCode: 200,
          after: async () => {
            const attrs = await rte.data.sendCommand('vgetattr', ['testVectorSet', 'element1'], null);
            const parsed = JSON.parse(attrs);
            expect(parsed).to.deep.eql({ category: 'test', score: 100 });
          },
        },
        {
          name: 'Should return NotFound error if key does not exist',
          data: {
            keyName: 'nonExistentKey',
            element: 'element1',
            attributes: { key: 'value' },
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
            attributes: { key: 'value' },
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
