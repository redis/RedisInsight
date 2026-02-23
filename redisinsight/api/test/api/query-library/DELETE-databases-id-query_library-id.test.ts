import { expect, describe, deps, getMainCheckFn } from '../deps';

const { server, request, constants, localDb } = deps;

const TEST_QUERY_LIBRARY_ID = 'ql-test-delete-id';

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = TEST_QUERY_LIBRARY_ID,
) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/query-library/${id}`,
  );

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /databases/:instanceId/query-library/:id', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () =>
          endpoint(
            constants.TEST_NOT_EXISTED_INSTANCE_ID,
            TEST_QUERY_LIBRARY_ID,
          ),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should delete a query library item',
        before: async () => {
          await localDb.generateNQueryLibraryItems(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: TEST_QUERY_LIBRARY_ID,
              indexName: 'idx:bikes_vss',
            },
            1,
            true,
          );
        },
        after: async () => {
          const entity = await (
            await localDb.getRepository(localDb.repositories.QUERY_LIBRARY)
          ).findOneBy({ id: TEST_QUERY_LIBRARY_ID });
          expect(entity).to.eql(null);
        },
      },
    ].map(mainCheckFn);
  });
});
