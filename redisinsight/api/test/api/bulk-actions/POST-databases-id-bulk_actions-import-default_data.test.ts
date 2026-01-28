import {
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  fsExtra,
} from '../deps';
import { path } from '../../helpers/test';
const { rte, request, server, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${id}/bulk-actions/import/default-data`,
  );

const connectEndpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${id}/connect`);

describe('POST /databases/:id/bulk-actions/import/default-data', () => {
  requirements(
    '!rte.sharedData',
    '!rte.bigData',
    'rte.serverType=local',
    'rte.modules.rejson',
  );

  beforeEach(async () => await rte.data.truncate());

  describe('Common', function () {
    it('should import default data', async () => {
      await fsExtra.ensureDir(constants.TEST_DATA_DIR);

      expect(await rte.client.get('string')).to.eq(null);
      expect(await rte.client.get('json')).to.eq(null);
      expect(await rte.client.get('should_not_exists')).to.eq(null);

      // create manifest with data
      const manifest = {
        files: [
          {
            path: 'common',
          },
          {
            path: 'json',
            modules: ['rejson'],
          },
          {
            path: 'notexistingmodule',
            modules: ['not existing'],
          },
        ],
      };

      await fsExtra.writeFile(
        path.join(constants.TEST_DATA_DIR, 'manifest.json'),
        JSON.stringify(manifest),
      );
      await fsExtra.writeFile(
        path.join(constants.TEST_DATA_DIR, 'common'),
        'set string string',
      );
      await fsExtra.writeFile(
        path.join(constants.TEST_DATA_DIR, 'json'),
        'set json json',
      );
      await fsExtra.writeFile(
        path.join(constants.TEST_DATA_DIR, 'notexistingmodule'),
        'set should_not_exists value',
      );

      // connect to database
      await validateApiCall({
        endpoint: connectEndpoint,
      });

      // main check
      await validateApiCall({
        endpoint,
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: { processed: 2, succeed: 2, failed: 0, errors: [] },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({}) => {
          expect(await rte.client.get('string')).to.eq('string');
          expect(await rte.client.get('json')).to.eq('json');
          expect(await rte.client.get('should_not_exists')).to.eq(null);
        },
      });
    });
    it('should return BadRequest when path does not exists', async () => {
      await fsExtra.remove(path.join(constants.TEST_DATA_DIR, 'manifest.json'));

      await validateApiCall({
        endpoint,
        statusCode: 500,
        responseBody: {
          statusCode: 500,
          message: 'Unable to import default data',
          error: 'Internal Server Error',
        },
      });
    });
  });
});
