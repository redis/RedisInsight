import {
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
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/array/search`,
  );

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/array/search', () => {
  // ARGREP is a Redis 8.8 preview command; skip where the server lacks it.
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  it('matches by predicate and returns index + value (WITHVALUES default)', async () => {
    const keyName = constants.getRandomString();
    await rte.client.call('ARMSET', keyName, '5', '21.4', '6', '21.9');

    await validateApiCall({
      endpoint,
      data: {
        keyName,
        predicates: [{ criteria: 'GLOB', value: '21.*' }],
      },
      statusCode: 200,
      responseBody: {
        keyName,
        elements: [
          { index: '5', value: '21.4' },
          { index: '6', value: '21.9' },
        ],
      },
    });
  });

  it('keeps a > 2^53 index exact end to end', async () => {
    const keyName = constants.getRandomString();
    const bigIndex = '9007199254740993'; // 2^53 + 1
    await rte.client.call('ARMSET', keyName, bigIndex, 'needle');

    await validateApiCall({
      endpoint,
      data: {
        keyName,
        predicates: [{ criteria: 'EXACT', value: 'needle' }],
      },
      statusCode: 200,
      responseBody: {
        keyName,
        elements: [{ index: bigIndex, value: 'needle' }],
      },
    });
  });

  it('applies the global OR across predicates', async () => {
    const keyName = constants.getRandomString();
    await rte.client.call('ARMSET', keyName, '0', 'a', '1', 'b', '2', 'c');

    await validateApiCall({
      endpoint,
      data: {
        keyName,
        predicates: [
          { criteria: 'EXACT', value: 'a' },
          { criteria: 'EXACT', value: 'c' },
        ],
        combinator: 'OR',
      },
      statusCode: 200,
      responseBody: {
        keyName,
        elements: [
          { index: '0', value: 'a' },
          { index: '2', value: 'c' },
        ],
      },
    });
  });

  it('returns indexes only when withValues=false', async () => {
    const keyName = constants.getRandomString();
    await rte.client.call('ARMSET', keyName, '0', 'a', '1', 'b');

    await validateApiCall({
      endpoint,
      data: {
        keyName,
        predicates: [{ criteria: 'GLOB', value: '*' }],
        withValues: false,
      },
      statusCode: 200,
      responseBody: {
        keyName,
        elements: [
          { index: '0', value: null },
          { index: '1', value: null },
        ],
      },
    });
  });

  it('rejects a non-canonical start index', async () => {
    await validateApiCall({
      endpoint,
      data: {
        keyName: constants.getRandomString(),
        predicates: [{ criteria: 'MATCH', value: 'x' }],
        start: '007',
      },
      statusCode: 400,
    });
  });

  describe('Errors', () => {
    // 403/ACL is covered by the service unit spec; an integration ACL case
    // would need an array key seeded on the ACL instance, which has no fixture.
    const wrongTypeKey = constants.getRandomString();

    [
      {
        name: 'Should return NotFound error if key does not exist',
        data: {
          keyName: constants.getRandomString(),
          predicates: [{ criteria: 'MATCH', value: 'x' }],
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Key with this name does not exist.',
        },
      },
      {
        name: 'Should return BadRequest error on a wrong-type key',
        before: async () => {
          await rte.client.set(wrongTypeKey, 'not-an-array');
        },
        data: {
          keyName: wrongTypeKey,
          predicates: [{ criteria: 'MATCH', value: 'x' }],
        },
        statusCode: 400,
      },
      {
        name: 'Should return NotFound error if instance id does not exist',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          keyName: constants.getRandomString(),
          predicates: [{ criteria: 'MATCH', value: 'x' }],
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
