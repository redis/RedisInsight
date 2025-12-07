import { describe, deps, expect, getMainCheckFn } from '../deps';
import { getRepository, repositories } from '../../helpers/local-db';
import { recommendationSchema } from './constants';
const { localDb, request, server, constants } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = constants.TEST_RECOMMENDATION_ID_1,
) =>
  request(server).patch(
    `/${constants.API.DATABASES}/${instanceId}/recommendations/${id}`,
  );

const responseSchema = recommendationSchema;
const mainCheckFn = getMainCheckFn(endpoint);

let repo;
describe('PATCH /recommendations/:id', () => {
  beforeEach(async () => {
    repo = await getRepository(repositories.DATABASE_RECOMMENDATION);
    await localDb.generateDatabaseRecommendations(
      {
        databaseId: constants.TEST_INSTANCE_ID,
      },
      true,
    );
  });

  describe('Recommendation vote', () => {
    [
      {
        name: 'Should put the vote to the recommendation',
        data: {
          vote: constants.TEST_RECOMMENDATION_VOTE,
        },
        statusCode: 200,
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.id).to.eq(constants.TEST_RECOMMENDATION_ID_1);
          expect(body.vote).to.eq(constants.TEST_RECOMMENDATION_VOTE);
          expect(body.read).to.eq(false);
          expect(body.name).to.eq(constants.TEST_RECOMMENDATION_NAME_1);
        },
        before: async () => {
          const recommendation = await repo
            .createQueryBuilder()
            .where({ id: constants.TEST_RECOMMENDATION_ID_1 })
            .getOne();
          expect(recommendation.vote).to.eq(null);
        },
        after: async () => {
          const recommendation = await repo
            .createQueryBuilder()
            .where({ id: constants.TEST_RECOMMENDATION_ID_1 })
            .getOne();
          expect(recommendation.vote).to.eq(constants.TEST_RECOMMENDATION_VOTE);
        },
      },
    ].map(mainCheckFn);
  });

  describe('Recommendation hide', () => {
    [
      {
        name: 'Should put the is hide to the recommendation',
        data: {
          hide: constants.TEST_RECOMMENDATION_HIDE,
        },
        statusCode: 200,
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.id).to.eq(constants.TEST_RECOMMENDATION_ID_1);
          expect(body.hide).to.eq(constants.TEST_RECOMMENDATION_HIDE);
          expect(body.read).to.eq(false);
          expect(body.name).to.eq(constants.TEST_RECOMMENDATION_NAME_1);
        },
        before: async () => {
          const recommendation = await repo
            .createQueryBuilder()
            .where({ id: constants.TEST_RECOMMENDATION_ID_1 })
            .getOne();
          expect(recommendation.hide).to.eq(false);
        },
        after: async () => {
          const recommendation = await repo
            .createQueryBuilder()
            .where({ id: constants.TEST_RECOMMENDATION_ID_1 })
            .getOne();
          expect(recommendation.hide).to.eq(constants.TEST_RECOMMENDATION_HIDE);
        },
      },
    ].map(mainCheckFn);
  });
});
