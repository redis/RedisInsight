import { describe, deps, before, expect, getMainCheckFn } from '../deps';
import { analysisSchema } from './constants';
const { localDb, request, server, constants } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = constants.TEST_DATABASE_ANALYSIS_ID_1,
) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/analysis/${id}`,
  );

const responseSchema = analysisSchema;
const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:id/analysis/:id', () => {
  before(
    async () =>
      await localDb.generateNDatabaseAnalysis(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          id: constants.TEST_DATABASE_ANALYSIS_ID_1,
          createdAt: constants.TEST_DATABASE_ANALYSIS_CREATED_AT_1,
        },
        1,
        true,
      ),
  );

  [
    {
      name: 'Should get database analysis',
      responseSchema,
      checkFn: ({ body }) => {
        expect(body).to.deep.eq({
          id: constants.TEST_DATABASE_ANALYSIS_ID_1,
          databaseId: constants.TEST_INSTANCE_ID,
          db: constants.TEST_DATABASE_ANALYSIS_DB_1,
          createdAt:
            constants.TEST_DATABASE_ANALYSIS_CREATED_AT_1.toISOString(),
          delimiter: constants.TEST_DATABASE_ANALYSIS_DELIMITER_1,
          filter: constants.TEST_DATABASE_ANALYSIS_FILTER_1,
          progress: constants.TEST_DATABASE_ANALYSIS_PROGRESS_1,
          totalKeys: constants.TEST_DATABASE_ANALYSIS_TOTAL_KEYS_1,
          totalMemory: constants.TEST_DATABASE_ANALYSIS_TOTAL_MEMORY_1,
          topKeysNsp: [constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_NSP_1],
          topMemoryNsp: [constants.TEST_DATABASE_ANALYSIS_TOP_MEMORY_NSP_1],
          topKeysLength: [constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1],
          topKeysMemory: [constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1],
          expirationGroups: [
            constants.TEST_DATABASE_ANALYSIS_EXPIRATION_GROUP_1,
          ],
          recommendations: [
            constants.TEST_LUA_DATABASE_ANALYSIS_RECOMMENDATION,
          ],
        });
      },
    },
    {
      name: 'Should return NotFound error if analysis does not exists',
      endpoint: () =>
        endpoint(
          constants.TEST_NOT_EXISTED_INSTANCE_ID,
          constants.TEST_NOT_EXISTED_INSTANCE_ID,
        ),
      statusCode: 404,
      responseBody: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Database analysis was not found.',
      },
    },
  ].map(mainCheckFn);
});
