import { describe, it, deps, expect, validateApiCall } from '../deps';
import {
  createDefaultNotifications,
  getRepository,
  repositories,
} from '../../helpers/local-db';
const { request, server } = deps;

const endpoint = () => request(server).patch(`/notifications/read`);

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

let repo;
describe('PATCH /notifications/read', () => {
  beforeEach(async () => {
    repo = await getRepository(repositories.NOTIFICATION);
    await createDefaultNotifications(true);
  });

  [
    {
      name: 'Should set all notifications into read state',
      before: async () => {
        const notifications = await repo.createQueryBuilder().getMany();
        expect(
          notifications.filter((notification) => {
            return notification.read === false;
          }).length,
        ).to.gte(2);
      },
      after: async () => {
        const notifications = await repo.createQueryBuilder().getMany();
        expect(
          notifications.filter((notification) => {
            return notification.read === false;
          }).length,
        ).to.eq(0);
      },
    },
  ].map(mainCheckFn);
});
