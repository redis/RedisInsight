import { expect, describe, before, Joi, deps, getMainCheckFn } from '../deps';
import { seedQueryLibraryItemDtoFactory } from 'src/modules/query-library/__tests__/query-library.factory';

const { server, request, constants, localDb } = deps;

const indexName = 'idx:bikes_vss';

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/query-library/seed`,
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

const seedItems = seedQueryLibraryItemDtoFactory.buildList(2, { indexName });
const seedData = { items: seedItems };

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/query-library/seed', () => {
  before(async () => {
    const rep = await localDb.getRepository(localDb.repositories.QUERY_LIBRARY);
    await rep.clear();
  });

  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: seedData,
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should seed sample queries',
        data: seedData,
        statusCode: 201,
        responseSchema,
        before: async () => {
          const rep = await localDb.getRepository(
            localDb.repositories.QUERY_LIBRARY,
          );
          await rep.clear();
        },
        checkFn: async ({ body }) => {
          expect(body).to.have.length(2);
          body.forEach((item) => {
            expect(item.type).to.eql('SAMPLE');
            expect(item.databaseId).to.eql(constants.TEST_INSTANCE_ID);
            expect(item.indexName).to.eql(indexName);
          });
          expect(body[0].name).to.eql(seedItems[0].name);
          expect(body[1].name).to.eql(seedItems[1].name);
        },
      },
      {
        name: 'Should skip seeding when samples already exist and return existing items',
        data: seedData,
        statusCode: 201,
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body).to.have.length.greaterThan(0);
        },
      },
    ].map(mainCheckFn);
  });
});
