import { describe, deps, before, getMainCheckFn } from '../deps';
import { recommendationsSchema } from './constants';
const { localDb, request, server, constants } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/recommendations`,
  );

const responseSchema = recommendationsSchema;
const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:id/recommendations', () => {
  before(
    async () =>
      await localDb.generateDatabaseRecommendations(
        {
          databaseId: constants.TEST_INSTANCE_ID,
        },
        true,
      ),
  );

  [
    {
      name: 'Should get list of database recommendations',
      responseSchema,
    },
  ].map(mainCheckFn);
});
