import { BrowserHistoryMode } from 'src/common/constants';
import { expect, describe, before, deps, getMainCheckFn } from '../deps';

const { request, server, localDb, constants } = deps;

// endpoint to test
const endpoint = (id) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/history/${id}`,
  );

const mainCheckFn = getMainCheckFn(endpoint);

describe(`DELETE /databases/:instanceId/history/:id`, () => {
  before(async () => {
    await localDb.createDatabaseInstances();

    await localDb.generateBrowserHistory(
      {
        databaseId: constants.TEST_INSTANCE_ID,
        mode: BrowserHistoryMode.Redisearch,
      },
      10,
      true,
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should remove single browser history item',
        endpoint: () => endpoint(constants.TEST_BROWSER_HISTORY_ID_2),
        query: {
          mode: BrowserHistoryMode.Redisearch,
        },
        before: async () => {
          expect(
            await localDb.getBrowserHistoryById(
              constants.TEST_BROWSER_HISTORY_ID_2,
            ),
          ).to.be.an('object');
        },
        after: async () => {
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
