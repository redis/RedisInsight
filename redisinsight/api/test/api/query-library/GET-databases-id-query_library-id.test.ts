import { expect, describe, Joi, deps, getMainCheckFn } from '../deps';

const { server, request, constants, localDb } = deps;

const TEST_QUERY_LIBRARY_ID = 'ql-test-get-one-id';

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = TEST_QUERY_LIBRARY_ID,
) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/query-library/${id}`,
  );

const responseSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    databaseId: Joi.string().required(),
    indexName: Joi.string().required(),
    type: Joi.string().valid('SAMPLE', 'SAVED').required(),
    name: Joi.string().required(),
    description: Joi.string().allow(null).optional(),
    query: Joi.string().required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:instanceId/query-library/:id', () => {
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
        name: 'Should return 404 when item does not exist',
        endpoint: () =>
          endpoint(
            constants.TEST_INSTANCE_ID,
            constants.TEST_NOT_EXISTED_INSTANCE_ID,
          ),
        statusCode: 404,
      },
      {
        name: 'Should return a single query library item',
        responseSchema,
        before: async () => {
          await localDb.generateNQueryLibraryItems(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: TEST_QUERY_LIBRARY_ID,
              indexName: 'idx:bikes_vss',
              name: 'Get one test query',
            },
            1,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.id).to.eql(TEST_QUERY_LIBRARY_ID);
          expect(body.name).to.eql('Get one test query');
          expect(body.databaseId).to.eql(constants.TEST_INSTANCE_ID);
        },
      },
    ].map(mainCheckFn);
  });
});
