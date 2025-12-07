import {
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
} from '../deps';
import { AdmZip, path } from '../../helpers/test';
const { rte, request, server, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${id}/bulk-actions/import/tutorial-data`,
  );

const creatCustomTutorialsEndpoint = () =>
  request(server).post(`/custom-tutorials`);

const getZipArchive = () => {
  const zipArchive = new AdmZip();

  zipArchive.addFile('info.md', Buffer.from('# info.md', 'utf8'));
  zipArchive.addFile(
    '_data/data.txt',
    Buffer.from(`set ${constants.TEST_STRING_KEY_1} bulkimport`, 'utf8'),
  );

  return zipArchive;
};

describe('POST /databases/:id/bulk-actions/import/tutorial-data', () => {
  requirements('!rte.sharedData', '!rte.bigData', 'rte.serverType=local');

  beforeEach(async () => await rte.data.truncate());

  describe('Common', function () {
    let tutorialId;
    it('should import data', async () => {
      expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.not.eq(
        'bulkimport',
      );

      // create tutorial
      const zip = getZipArchive();
      await validateApiCall({
        endpoint: creatCustomTutorialsEndpoint,
        attach: ['file', zip.toBuffer(), 'a.zip'],
        statusCode: 201,
        checkFn: ({ body }) => {
          tutorialId = body.id;
        },
      });

      await validateApiCall({
        endpoint,
        data: {
          path: path.join('/custom-tutorials', tutorialId, '_data/data.txt'),
        },
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: { processed: 1, succeed: 1, failed: 0, errors: [] },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({ body }) => {
          expect(body.duration).to.gt(0);

          expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eq(
            'bulkimport',
          );
        },
      });
    });
    it('should import data with static path', async () => {
      expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.not.eq(
        'bulkimport',
      );

      // create tutorial
      const zip = getZipArchive();
      await validateApiCall({
        endpoint: creatCustomTutorialsEndpoint,
        attach: ['file', zip.toBuffer(), 'a.zip'],
        statusCode: 201,
        checkFn: ({ body }) => {
          tutorialId = body.id;
        },
      });

      await validateApiCall({
        endpoint,
        data: {
          path: path.join(
            '/static/custom-tutorials',
            tutorialId,
            '_data/data.txt',
          ),
        },
        responseBody: {
          id: 'empty',
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'upload',
          summary: { processed: 1, succeed: 1, failed: 0, errors: [] },
          progress: null,
          filter: null,
          status: 'completed',
        },
        checkFn: async ({ body }) => {
          expect(body.duration).to.gt(0);

          expect(await rte.client.get(constants.TEST_STRING_KEY_1)).to.eq(
            'bulkimport',
          );
        },
      });
    });
    it('should return BadRequest when path does not exists', async () => {
      await validateApiCall({
        endpoint,
        data: {
          path: path.join(
            '/custom-tutorials',
            tutorialId,
            '../../../../../_data/data.txt',
          ),
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          message: 'Data file was not found',
          error: 'Bad Request',
        },
      });
    });
  });
});
