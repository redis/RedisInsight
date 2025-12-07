import {
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
} from '../deps';
const { rte, request, server, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/${id}/bulk-actions/import`);

describe('POST /databases/:id/bulk-actions/import', () => {
  requirements('!rte.sharedData', '!rte.bigData');
  beforeEach(async () => await rte.data.truncate());

  describe('Common', function () {
    it('Should not import anything', async () => {
      await validateApiCall({
        endpoint,
        attach: ['file', Buffer.from('baddata'), 'file.json'],
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: { processed: 1, succeed: 0, failed: 1, errors: [] },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: ({ body }) => {
          expect(body.duration).to.gt(0);
        },
      });
    });
    it('Should import 100 strings', async () => {
      await validateApiCall({
        endpoint,
        attach: [
          'file',
          Buffer.from(
            new Array(100)
              .fill(100)
              .map((_v, idx) => `SET key${idx} value${idx}`)
              .join('\n'),
          ),
          'any_filename_and_ext',
        ],
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: { processed: 100, succeed: 100, failed: 0, errors: [] },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({ body }) => {
          expect(body.duration).to.gt(0);

          expect(await rte.client.get('key0')).to.eq('value0');
          expect(await rte.client.get('key99')).to.eq('value99');
          expect(await rte.client.get('key100')).to.eq(null);
        },
      });
    });
    it('Should import 10K strings', async () => {
      await validateApiCall({
        endpoint,
        attach: [
          'file',
          Buffer.from(
            new Array(10_000)
              .fill(1)
              .map((_v, idx) => `SET key${idx} value${idx}`)
              .join('\n'),
          ),
          'any_filename_and_ext',
        ],
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: {
            processed: 10_000,
            succeed: 10_000,
            failed: 0,
            errors: [],
          },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({ body }) => {
          expect(body.duration).to.gt(0);

          expect(await rte.client.get('key0')).to.eq('value0');
          expect(await rte.client.get('key9999')).to.eq('value9999');
          expect(await rte.client.get('key10000')).to.eq(null);
        },
      });
    });
    it('Should import 50 out of 100 keys strings', async () => {
      await validateApiCall({
        endpoint,
        attach: [
          'file',
          Buffer.from(
            new Array(25)
              .fill(1)
              .map((_v, idx) =>
                [
                  `SET key${idx}_1 value${idx}_1`,
                  `SET "key${idx}_2" "value${idx}_2 \\xE2\\x82\\xAC"`,
                  `SET no-value`,
                  JSON.stringify({ something: 'bad' }),
                ].join('\n'),
              )
              .join('\n'),
          ),
          'any_filename_and_ext',
        ],
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: { processed: 100, succeed: 50, failed: 50, errors: [] },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({ body }) => {
          expect(body.duration).to.gt(0);

          expect(await rte.client.get('key0_1')).to.eq('value0_1');
          expect(await rte.client.get('key0_2')).to.eq('value0_2 €');
          expect(await rte.client.get('key0_3')).to.eq(null);
          expect(await rte.client.get('key0_4')).to.eq(null);

          expect(await rte.client.get('key24_1')).to.eq('value24_1');
          expect(await rte.client.get('key24_2')).to.eq('value24_2 €');
          expect(await rte.client.get('key24_3')).to.eq(null);
          expect(await rte.client.get('key24_4')).to.eq(null);

          expect(await rte.client.get('key25_0')).to.eq(null);
        },
      });
    });
    it('Should ignore blank lines', async () => {
      await validateApiCall({
        endpoint,
        attach: [
          'file',
          Buffer.from(`
            \n
            \n
            SET key0 value0
            \n
                  \n
            SET key1 value1
            \n
            \n
          `),
          'any_filename_and_ext',
        ],
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: { processed: 2, succeed: 2, failed: 0, errors: [] },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({ body }) => {
          expect(body.duration).to.gt(0);

          expect(await rte.client.get('key0')).to.eq('value0');
          expect(await rte.client.get('key1')).to.eq('value1');
        },
      });
    });
    it('Should import 100K strings', async () => {
      const b = Buffer.from(
        new Array(100_000)
          .fill(1)
          .map((_v, idx) => `SET key${idx} value${idx}`)
          .join('\n'),
      );

      require('fs').writeFileSync('_data', b);
      await validateApiCall({
        endpoint,
        attach: ['file', b, 'any_filename_and_ext'],
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: {
            processed: 100_000,
            succeed: 100_000,
            failed: 0,
            errors: [],
          },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({ body }) => {
          expect(body.duration).to.gt(0);

          expect(await rte.client.get('key0')).to.eq('value0');
          expect(await rte.client.get('key99999')).to.eq('value99999');
          expect(await rte.client.get('key100000')).to.eq(null);
        },
      });
    });
  });
});
