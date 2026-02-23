import { expect, describe, Joi, deps, getMainCheckFn } from '../deps';

const { server, request, constants, localDb } = deps;

const TEST_QUERY_LIBRARY_ID = 'ql-test-update-id';

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = TEST_QUERY_LIBRARY_ID,
) =>
  request(server).patch(
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

describe('PATCH /databases/:instanceId/query-library/:id', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () =>
          endpoint(
            constants.TEST_NOT_EXISTED_INSTANCE_ID,
            TEST_QUERY_LIBRARY_ID,
          ),
        data: { name: 'Updated name' },
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
        data: { name: 'Updated name' },
        statusCode: 404,
      },
      {
        name: 'Should update name of a query library item',
        data: { name: 'Updated query name' },
        responseSchema,
        before: async () => {
          await localDb.generateNQueryLibraryItems(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              id: TEST_QUERY_LIBRARY_ID,
              indexName: 'idx:bikes_vss',
              name: 'Original name',
            },
            1,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.id).to.eql(TEST_QUERY_LIBRARY_ID);
          expect(body.name).to.eql('Updated query name');
        },
      },
      {
        name: 'Should update query string',
        data: { query: 'FT.SEARCH idx:bikes_vss "@brand:Trek"' },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.id).to.eql(TEST_QUERY_LIBRARY_ID);
          expect(body.query).to.eql('FT.SEARCH idx:bikes_vss "@brand:Trek"');
          expect(body.name).to.eql('Updated query name');
        },
      },
      {
        name: 'Should update description',
        data: { description: 'New description' },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.id).to.eql(TEST_QUERY_LIBRARY_ID);
          expect(body.description).to.eql('New description');
        },
      },
    ].map(mainCheckFn);
  });
});
