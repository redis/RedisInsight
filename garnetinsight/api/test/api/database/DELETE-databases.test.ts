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

const { request, server, localDb, constants } = deps;

const endpoint = () => request(server).delete(`/${constants.API.DATABASES}`);

// input data schema
const dataSchema = Joi.object({
  ids: Joi.array().items(Joi.any()).required(),
}).strict();

const validInputData = {
  ids: [constants.getRandomString()],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe(`DELETE /databases`, () => {
  before(async () => await localDb.createDatabaseInstances());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should remove multiple databases by ids',
        data: {
          ids: [constants.TEST_INSTANCE_ID_2, constants.TEST_INSTANCE_ID_3],
        },
        responseBody: {
          affected: 2,
        },
        before: async () => {
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2),
          ).to.be.an('object');
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_3),
          ).to.be.an('object');
        },
        after: async () => {
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2),
          ).to.eql(null);
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_3),
          ).to.eql(null);
        },
      },
      {
        name: 'Should return affected 0 since no databases found',
        data: {
          ids: [constants.TEST_INSTANCE_ID_2, constants.TEST_INSTANCE_ID_3],
        },
        responseBody: {
          affected: 0,
        },
        before: async () => {
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2),
          ).to.eql(null);
          expect(
            await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_3),
          ).to.eql(null);
        },
      },
    ].map(mainCheckFn);
  });
});
