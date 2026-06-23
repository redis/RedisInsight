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

  it('round-trips a large index (up to 2^53) exactly', async () => {
    // ARGREP returns indexes as RESP integers, which ioredis rounds to JS
    // number at the transport — so the exact-string proof for values > 2^53
    // lands with the shared transport fix (RI-8296). Here we assert the
    // largest exactly-representable index round-trips.
    const keyName = constants.getRandomString();
    const largeIndex = '9007199254740991'; // 2^53 - 1 (Number.MAX_SAFE_INTEGER)
    await rte.client.call('ARMSET', keyName, largeIndex, 'needle');

    await validateApiCall({
      endpoint,
      data: {
        keyName,
        predicates: [{ criteria: 'EXACT', value: 'needle' }],
      },
      statusCode: 200,
      responseBody: {
        keyName,
        elements: [{ index: largeIndex, value: 'needle' }],
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
    const reKey = constants.getRandomString();

    [
      {
        name: 'Should return BadRequest on a malformed RE predicate',
        before: async () => {
          await rte.client.call('ARSET', reKey, '0', 'a', 'b', 'c');
        },
        data: {
          keyName: reKey,
          // Unterminated character class — "ERR invalid regular expression…".
          predicates: [{ criteria: 'RE', value: '[unterminated' }],
        },
        statusCode: 400,
      },
      {
        name: 'Should return BadRequest on a backreference RE predicate',
        before: async () => {
          await rte.client.call('ARSET', reKey, '0', 'a', 'b', 'c');
        },
        data: {
          keyName: reKey,
          // "ERR regular expression backreferences are not supported" — a
          // different RE error than the malformed case, same 400 mapping.
          predicates: [{ criteria: 'RE', value: '(a)\\1' }],
        },
        statusCode: 400,
      },
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
