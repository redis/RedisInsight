import { BrowserHistoryMode } from 'src/common/constants';
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

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(`/${constants.API.DATABASES}/${instanceId}/history`);

// input data schema
const dataSchema = Joi.object({
  ids: Joi.array().items(Joi.any()).required(),
}).strict();

const validInputData = {
  ids: [constants.getRandomString()],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe(`DELETE /databases/:instanceId/history`, () => {
  before(async () => {
    await localDb.createDatabaseInstances();

    await localDb.generateBrowserHistory(
      {
        databaseId: constants.TEST_INSTANCE_ID,
        mode: BrowserHistoryMode.Pattern,
      },
      10,
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
        name: 'Should remove multiple browser history items by ids',
        data: {
          ids: [
            constants.TEST_BROWSER_HISTORY_ID_1,
            constants.TEST_BROWSER_HISTORY_ID_2,
          ],
        },
        query: {
          mode: BrowserHistoryMode.Pattern,
        },
        responseBody: {
          affected: 2,
        },
        before: async () => {
          expect(
            await localDb.getBrowserHistoryById(
              constants.TEST_BROWSER_HISTORY_ID_1,
            ),
          ).to.be.an('object');
          expect(
            await localDb.getBrowserHistoryById(
              constants.TEST_BROWSER_HISTORY_ID_2,
            ),
          ).to.be.an('object');
        },
        after: async () => {
          expect(
            await localDb.getBrowserHistoryById(
              constants.TEST_BROWSER_HISTORY_ID_1,
            ),
          ).to.eql(null);
          expect(
            await localDb.getBrowserHistoryById(
              constants.TEST_BROWSER_HISTORY_ID_2,
            ),
          ).to.eql(null);
        },
      },
    ].map(mainCheckFn);
  });
});
