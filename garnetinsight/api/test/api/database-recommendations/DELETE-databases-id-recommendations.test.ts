import {
  Joi,
  expect,
  describe,
  before,
  deps,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';
import { getRepository, repositories } from '../../helpers/local-db';

const { request, server, localDb, constants } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/recommendations`,
  );

// input data schema
const dataSchema = Joi.object({
  ids: Joi.array().items(Joi.any()).required(),
}).strict();

const validInputData = {
  ids: [constants.getRandomString()],
};

const mainCheckFn = getMainCheckFn(endpoint);

let repo;
describe(`DELETE /databases/:id/recommendations`, () => {
  before(async () => {
    repo = await getRepository(repositories.DATABASE_RECOMMENDATION);
    await localDb.generateDatabaseRecommendations(
      {
        databaseId: constants.TEST_INSTANCE_ID,
      },
      true,
    );
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should remove multiple recommendations by ids',
        data: {
          ids: [
            constants.TEST_RECOMMENDATION_ID_1,
            constants.TEST_RECOMMENDATION_ID_3,
          ],
        },
        responseBody: {
          affected: 2,
        },
        before: async () => {
          expect(
            await repo
              .createQueryBuilder()
              .where({ id: constants.TEST_RECOMMENDATION_ID_1 })
              .getOne(),
          ).to.be.an('object');
          expect(
            await repo
              .createQueryBuilder()
              .where({ id: constants.TEST_RECOMMENDATION_ID_3 })
              .getOne(),
          ).to.be.an('object');
        },
        after: async () => {
          expect(
            await repo
              .createQueryBuilder()
              .where({ id: constants.TEST_RECOMMENDATION_ID_1 })
              .getOne(),
          ).to.eql(null);
          expect(
            await repo
              .createQueryBuilder()
              .where({ id: constants.TEST_RECOMMENDATION_ID_3 })
              .getOne(),
          ).to.eql(null);
        },
      },
      {
        name: 'Should return affected 0 since no recommendations found',
        data: {
          ids: [
            constants.TEST_RECOMMENDATION_ID_1,
            constants.TEST_RECOMMENDATION_ID_3,
          ],
        },
        responseBody: {
          affected: 0,
        },
        before: async () => {
          expect(
            await repo
              .createQueryBuilder()
              .where({ id: constants.TEST_RECOMMENDATION_ID_1 })
              .getOne(),
          ).to.eql(null);
          expect(
            await repo
              .createQueryBuilder()
              .where({ id: constants.TEST_RECOMMENDATION_ID_3 })
              .getOne(),
          ).to.eql(null);
        },
      },
    ].map(mainCheckFn);
  });
});
