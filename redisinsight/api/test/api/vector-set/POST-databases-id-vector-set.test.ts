import {
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  getMainCheckFn,
} from '../deps';

const { server, request, constants } = deps;
// The harness types `deps.rte` as null until initRTE runs; tests access it
// freely (the api test layer is untyped by design), so widen it here.
const rte = deps.rte as any;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/vector-set`);

const mainCheckFn = getMainCheckFn(endpoint);

// VCARD has no typed method on rte.client; assert state via `call`.
const vcard = (key: string) => rte.client.call('VCARD', key);

describe('POST /databases/:id/vector-set', () => {
  // Vector sets are a Redis 8.0 data type; skip where the server lacks VADD.
  requirements('rte.version>=8.0');
  beforeEach(async () => rte.data.truncate());

  describe('Main', () => {
    const newKey = constants.getRandomString();
    const ttlKey = constants.getRandomString();

    [
      {
        name: 'Should create a vector set from numeric values',
        data: {
          keyName: newKey,
          elements: [
            { name: 'a', vectorValues: [1, 2, 3] },
            { name: 'b', vectorValues: [4, 5, 6] },
          ],
        },
        statusCode: 201,
        before: async () => {
          expect(await rte.client.exists(newKey)).to.eql(0);
        },
        after: async () => {
          expect(await rte.client.exists(newKey)).to.eql(1);
          expect(await vcard(newKey)).to.eql(2);
          expect(await rte.client.ttl(newKey)).to.eql(-1);
        },
      },
      {
        name: 'Should create a vector set with a TTL',
        data: {
          keyName: ttlKey,
          elements: [{ name: 'a', vectorValues: [1, 2, 3] }],
          expire: 100,
        },
        statusCode: 201,
        after: async () => {
          expect(await vcard(ttlKey)).to.eql(1);
          expect(await rte.client.ttl(ttlKey)).to.gte(95);
        },
      },
    ].map(mainCheckFn);
  });

  describe('Validation', () => {
    [
      {
        name: 'Should reject an empty elements array',
        data: { keyName: constants.getRandomString(), elements: [] },
        statusCode: 400,
      },
      {
        name: 'Should reject an element with empty vectorValues',
        data: {
          keyName: constants.getRandomString(),
          elements: [{ name: 'a', vectorValues: [] }],
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Errors', () => {
    it('Should return conflict error if key already exists', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('VADD', keyName, 'VALUES', '3', '1', '2', '3', 'a');

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          elements: [{ name: 'b', vectorValues: [4, 5, 6] }],
        },
        statusCode: 409,
        responseBody: {
          statusCode: 409,
          error: 'Conflict',
          message: 'This key name is already in use.',
        },
      });
    });

    [
      {
        name: 'Should return NotFound error if instance id does not exist',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          keyName: constants.getRandomString(),
          elements: [{ name: 'a', vectorValues: [1, 2, 3] }],
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
