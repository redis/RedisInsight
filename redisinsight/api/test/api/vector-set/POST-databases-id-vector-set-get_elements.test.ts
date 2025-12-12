import { before, deps, describe, expect, getMainCheckFn, requirements, } from '../deps';

const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/vector-set/get-elements`);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/vector-set/get-elements', () => {
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
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'VALUES',
        '3',
        '0.4',
        '0.5',
        '0.6',
        'element2',
      ], null);
      await rte.data.sendCommand('vadd', [
        'testVectorSet',
        'VALUES',
        '3',
        '0.7',
        '0.8',
        '0.9',
        'element3',
      ], null);
    });

    describe('Common', () => {
      [
        {
          name: 'Should get elements from vector set',
          data: {
            keyName: 'testVectorSet',
          },
          statusCode: 200,
          checkFn: ({ body }) => {
            expect(body).to.have.property('keyName');
            expect(body).to.have.property('total');
            expect(body).to.have.property('elements');
            expect(body.total).to.eql(3);
            expect(body.elements).to.be.an('array');
            // Note: elements may be empty in some Redis versions due to VRANDMEMBER behavior
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
