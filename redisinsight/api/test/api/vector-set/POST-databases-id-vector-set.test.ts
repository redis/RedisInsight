import { beforeEach, deps, describe, expect, it, requirements, validateApiCall, } from '../deps';

const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/vector-set`);

const createCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(0);
      }
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(1);
        // Verify vector set was created with VCARD
        const card = await rte.data.sendCommand('vcard', [testCase.data.keyName], null);
        expect(card).to.eql(testCase.data.elements.length);
      }
    }
  });
};

describe('POST /databases/:instanceId/vector-set', () => {
  // Vector sets require Redis 8.0+
  requirements('rte.version >= 8.0.0');

  describe('Main', () => {
    beforeEach(rte.data.truncate);

    describe('Common', () => {
      [
        {
          name: 'Should create vector set with single element',
          data: {
            keyName: constants.getRandomString(),
            elements: [
              {
                name: 'element1',
                vector: [0.1, 0.2, 0.3, 0.4],
              },
            ],
          },
          statusCode: 201,
        },
        {
          name: 'Should create vector set with multiple elements',
          data: {
            keyName: constants.getRandomString(),
            elements: [
              {
                name: 'element1',
                vector: [0.1, 0.2, 0.3],
              },
              {
                name: 'element2',
                vector: [0.4, 0.5, 0.6],
              },
            ],
          },
          statusCode: 201,
        },
        {
          name: 'Should create vector set with TTL',
          data: {
            keyName: constants.getRandomString(),
            elements: [
              {
                name: 'element1',
                vector: [0.1, 0.2, 0.3],
              },
            ],
            expire: 3600,
          },
          statusCode: 201,
          after: async function() {
            const ttl = await rte.client.ttl(this.data.keyName);
            expect(ttl).to.be.greaterThan(3500);
          },
        },
        {
          name: 'Should create vector set with element attributes',
          data: {
            keyName: constants.getRandomString(),
            elements: [
              {
                name: 'element1',
                vector: [0.1, 0.2, 0.3],
                attributes: { category: 'test', score: 42 },
              },
            ],
          },
          statusCode: 201,
        },
        {
          name: 'Should return NotFound error if instance id does not exist',
          endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
          data: {
            keyName: constants.getRandomString(),
            elements: [
              {
                name: 'element1',
                vector: [0.1, 0.2, 0.3],
              },
            ],
          },
          statusCode: 404,
          responseBody: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Invalid database instance id.',
          },
        },
      ].map(createCheckFn);
    });
  });
});
