import {
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  getMainCheckFn,
} from '../deps';
import { ArrayCreationMode } from 'src/modules/browser/array/dto';

const { server, request, constants } = deps;
// The harness types `deps.rte` as null until initRTE runs; tests access it
// freely (the api test layer is untyped by design), so widen it here.
const rte = deps.rte as any;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/array`);

const mainCheckFn = getMainCheckFn(endpoint);

// ARSET/ARMSET are Redis 8.8 preview commands; rte.client has no typed method
// for them, so assert array state through the generic `call`.
const arlen = (key: string) => rte.client.call('ARLEN', key);
const arcount = (key: string) => rte.client.call('ARCOUNT', key);
const arget = (key: string, index: string) =>
  rte.client.call('ARGET', key, index);

interface CreateArrayTestCase {
  name: string;
  data: { keyName: string } & Record<string, unknown>;
  statusCode: number;
  endpoint?: () => unknown;
  responseBody?: object;
  before?: () => Promise<unknown>;
  after?: () => Promise<unknown>;
}

const createCheckFn = async (testCase: CreateArrayTestCase) => {
  it(testCase.name, async () => {
    if (testCase.before) {
      await testCase.before();
    } else if (testCase.statusCode === 201) {
      expect(await rte.client.exists(testCase.data.keyName)).to.eql(0);
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    if (testCase.after) {
      await testCase.after();
    }
  });
};

describe('POST /databases/:id/array', () => {
  // Array is a Redis 8.8 preview type; skip where the server lacks ARSET.
  requirements('rte.version>=8.8');
  beforeEach(async () => rte.data.truncate());

  describe('Contiguous (ARSET)', () => {
    const contiguousKey = constants.getRandomString();
    const nonZeroKey = constants.getRandomString();
    const ttlKey = constants.getRandomString();

    [
      {
        name: 'Should create a contiguous array',
        data: {
          keyName: contiguousKey,
          mode: ArrayCreationMode.Contiguous,
          startIndex: '0',
          values: ['20.1', '20.4', '20.9'],
        },
        statusCode: 201,
        after: async () => {
          expect(await rte.client.exists(contiguousKey)).to.eql(1);
          expect(await arlen(contiguousKey)).to.eql(3);
          expect(await arget(contiguousKey, '0')).to.eql('20.1');
          expect(await arget(contiguousKey, '2')).to.eql('20.9');
          expect(await rte.client.ttl(contiguousKey)).to.eql(-1);
        },
      },
      {
        name: 'Should create a contiguous array starting at a non-zero index',
        data: {
          keyName: nonZeroKey,
          mode: ArrayCreationMode.Contiguous,
          startIndex: '5',
          values: ['a', 'b'],
        },
        statusCode: 201,
        after: async () => {
          // Length is highest set index + 1, so a run at 5..6 reports 7.
          expect(await arlen(nonZeroKey)).to.eql(7);
          expect(await arget(nonZeroKey, '5')).to.eql('a');
        },
      },
      {
        name: 'Should create a contiguous array with a TTL (pipeline path)',
        data: {
          keyName: ttlKey,
          mode: ArrayCreationMode.Contiguous,
          startIndex: '0',
          values: ['x'],
          expire: 100,
        },
        statusCode: 201,
        after: async () => {
          expect(await arlen(ttlKey)).to.eql(1);
          expect(await rte.client.ttl(ttlKey)).to.gte(95);
        },
      },
    ].map(createCheckFn);
  });

  describe('Sparse (ARMSET)', () => {
    const sparseKey = constants.getRandomString();
    const sparseTtlKey = constants.getRandomString();
    const dupIndexKey = constants.getRandomString();

    [
      {
        name: 'Should create a sparse array with index gaps',
        data: {
          keyName: sparseKey,
          mode: ArrayCreationMode.Sparse,
          elements: [
            { index: '5', value: 'v5' },
            { index: '17', value: 'v17' },
          ],
        },
        statusCode: 201,
        after: async () => {
          expect(await rte.client.exists(sparseKey)).to.eql(1);
          // Length follows the highest index (17 + 1); count is the populated slots.
          expect(await arlen(sparseKey)).to.eql(18);
          expect(await arcount(sparseKey)).to.eql(2);
          expect(await arget(sparseKey, '5')).to.eql('v5');
          expect(await arget(sparseKey, '17')).to.eql('v17');
          expect(await arget(sparseKey, '6')).to.eql(null);
        },
      },
      {
        name: 'Should create a sparse array with a TTL (pipeline path)',
        data: {
          keyName: sparseTtlKey,
          mode: ArrayCreationMode.Sparse,
          elements: [{ index: '0', value: 'only' }],
          expire: 100,
        },
        statusCode: 201,
        after: async () => {
          expect(await arcount(sparseTtlKey)).to.eql(1);
          expect(await rte.client.ttl(sparseTtlKey)).to.gte(95);
        },
      },
      {
        // Pin "last write wins" for duplicate indexes — ARMSET accepts the
        // duplicate server-side and the trailing value overwrites the earlier
        // one. Count stays 1 because only one slot ends up populated.
        name: 'Should accept a duplicate index and keep the last value (sparse, last wins)',
        data: {
          keyName: dupIndexKey,
          mode: ArrayCreationMode.Sparse,
          elements: [
            { index: '5', value: 'first' },
            { index: '5', value: 'second' },
          ],
        },
        statusCode: 201,
        after: async () => {
          expect(await arget(dupIndexKey, '5')).to.eql('second');
          expect(await arcount(dupIndexKey)).to.eql(1);
        },
      },
    ].map(createCheckFn);
  });

  describe('Validation', () => {
    [
      {
        name: 'Should reject a non-canonical index',
        data: {
          keyName: constants.getRandomString(),
          mode: ArrayCreationMode.Contiguous,
          startIndex: '007',
          values: ['x'],
        },
        statusCode: 400,
      },
      {
        name: 'Should reject an out-of-range (> u64) index',
        data: {
          keyName: constants.getRandomString(),
          mode: ArrayCreationMode.Sparse,
          elements: [{ index: '18446744073709551616', value: 'x' }],
        },
        statusCode: 400,
      },
      {
        // 2^64-1 is reserved by Redis as the "no-index" sentinel — ARSET /
        // ARMSET reject it server-side, so the API validator must too.
        name: 'Should reject the reserved 2^64-1 sentinel index',
        data: {
          keyName: constants.getRandomString(),
          mode: ArrayCreationMode.Sparse,
          elements: [{ index: '18446744073709551615', value: 'x' }],
        },
        statusCode: 400,
      },
      {
        name: 'Should reject contiguous mode with empty values',
        data: {
          keyName: constants.getRandomString(),
          mode: ArrayCreationMode.Contiguous,
          startIndex: '0',
          values: [],
        },
        statusCode: 400,
      },
      {
        // Symmetric @ArrayMinSize(1) guard for the sparse path — without it,
        // we'd issue ARMSET with no pairs and surface the server error.
        name: 'Should reject sparse mode with an empty elements array',
        data: {
          keyName: constants.getRandomString(),
          mode: ArrayCreationMode.Sparse,
          elements: [],
        },
        statusCode: 400,
      },
      {
        name: 'Should reject an unknown mode',
        data: {
          keyName: constants.getRandomString(),
          mode: 'whatever',
          values: ['x'],
        },
        statusCode: 400,
      },
    ].map(mainCheckFn);
  });

  describe('Errors', () => {
    it('Should return conflict error if key already exists', async () => {
      const keyName = constants.getRandomString();
      await rte.client.call('ARSET', keyName, '0', 'existing');

      await validateApiCall({
        endpoint,
        data: {
          keyName,
          mode: ArrayCreationMode.Contiguous,
          startIndex: '0',
          values: ['new'],
        },
        statusCode: 409,
        responseBody: {
          statusCode: 409,
          error: 'Conflict',
          message: 'This key name is already in use.',
        },
      });

      // The existing value must not be overwritten.
      expect(await arget(keyName, '0')).to.eql('existing');
    });

    [
      {
        name: 'Should return NotFound error if instance id does not exist',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          keyName: constants.getRandomString(),
          mode: ArrayCreationMode.Contiguous,
          startIndex: '0',
          values: ['x'],
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
