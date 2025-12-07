import {
  expect,
  describe,
  deps,
  before,
  getMainCheckFn,
  Joi,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
import { analysisSchema } from './constants';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = constants.TEST_DATABASE_ANALYSIS_ID_1,
) =>
  request(server).patch(
    `/${constants.API.DATABASES}/${instanceId}/analysis/${id}`,
  );

// input data schema
const dataSchema = Joi.object({
  name: Joi.string(),
  vote: Joi.string(),
}).strict();

const validInputData = {
  name: constants.getRandomString(),
  vote: constants.getRandomString(),
};

const responseSchema = analysisSchema;
const mainCheckFn = getMainCheckFn(endpoint);
let repository;

describe('PATCH /databases/:instanceId/analysis/:id', () => {
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

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('recommendations', () => {
    describe('recommendation vote', () => {
      [
        {
          name: 'Should add vote for RTS recommendation',
          data: {
            name: 'luaScript',
            vote: 'useful',
          },
          statusCode: 200,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_LUA_SCRIPT_VOTE_RECOMMENDATION,
            ]);
          },
        },
      ].map(mainCheckFn);
    });
  });
});
