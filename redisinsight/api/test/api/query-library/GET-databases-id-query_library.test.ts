import { expect, describe, before, Joi, deps, getMainCheckFn } from '../deps';

const { server, request, constants, localDb } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/query-library`,
  );

const responseSchema = Joi.array()
  .items(
    Joi.object().keys({
      id: Joi.string().required(),
      databaseId: Joi.string().required(),
      indexName: Joi.string().required(),
      type: Joi.string().valid('SAMPLE', 'SAVED').required(),
      name: Joi.string().required(),
      description: Joi.string().allow(null).optional(),
      query: Joi.string().required(),
      createdAt: Joi.date().required(),
      updatedAt: Joi.date().required(),
    }),
  )
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:instanceId/query-library', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should return empty array when no items exist',
        query: { indexName: 'idx:bikes_vss' },
        responseSchema,
        before: async () => {
          const rep = await localDb.getRepository(
            localDb.repositories.QUERY_LIBRARY,
          );
          await rep.clear();
        },
        checkFn: async ({ body }) => {
          expect(body).to.eql([]);
        },
      },
      {
        name: 'Should return items for the database',
        query: { indexName: 'idx:bikes_vss' },
        responseSchema,
        before: async () => {
          await localDb.generateNQueryLibraryItems(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              indexName: 'idx:bikes_vss',
            },
            3,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body).to.have.length(3);
          body.forEach((item) => {
            expect(item.databaseId).to.eql(constants.TEST_INSTANCE_ID);
          });
        },
      },
    ].map(mainCheckFn);
  });

  describe('Filter by indexName', () => {
    before(async () => {
      const rep = await localDb.getRepository(
        localDb.repositories.QUERY_LIBRARY,
      );
      await rep.clear();
      await localDb.generateNQueryLibraryItems(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          indexName: 'idx:bikes_vss',
        },
        3,
      );
      await localDb.generateNQueryLibraryItems(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          indexName: 'idx:movies_vss',
        },
        2,
      );
    });

    [
      {
        name: 'Should return only items matching indexName filter',
        query: { indexName: 'idx:bikes_vss' },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body).to.have.length(3);
          body.forEach((item) => {
            expect(item.indexName).to.eql('idx:bikes_vss');
          });
        },
      },
      {
        name: 'Should return items for another index',
        query: { indexName: 'idx:movies_vss' },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body).to.have.length(2);
          body.forEach((item) => {
            expect(item.indexName).to.eql('idx:movies_vss');
          });
        },
      },
      {
        name: 'Should return 400 when indexName is not provided',
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'Bad Request',
        },
      },
    ].map(mainCheckFn);
  });

  describe('Search filter', () => {
    before(async () => {
      const rep = await localDb.getRepository(
        localDb.repositories.QUERY_LIBRARY,
      );
      await rep.clear();
      await localDb.generateNQueryLibraryItems(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          indexName: 'idx:bikes_vss',
          name: 'Vector similarity search',
        },
        1,
      );
      await localDb.generateNQueryLibraryItems(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          indexName: 'idx:bikes_vss',
          name: 'Count all documents',
        },
        1,
      );
    });

    [
      {
        name: 'Should filter by search term matching name',
        query: { indexName: 'idx:bikes_vss', search: 'vector' },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body).to.have.length(1);
          expect(body[0].name).to.eql('Vector similarity search');
        },
      },
      {
        name: 'Should return empty list when search does not match',
        query: { indexName: 'idx:bikes_vss', search: 'nonexistent' },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body).to.have.length(0);
        },
      },
    ].map(mainCheckFn);
  });
});
