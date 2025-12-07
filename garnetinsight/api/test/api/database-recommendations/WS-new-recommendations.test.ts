import {
  describe,
  it,
  expect,
  _,
  before,
  deps,
  validateApiCall,
  requirements,
} from '../deps';
const { server, request, constants, rte } = deps;
import {
  enableAllDbFeatures,
  getRepository,
  repositories,
} from '../../helpers/local-db';
import { Socket } from 'socket.io-client';
import { getSocket } from '../../helpers/server';

const getClient = async (): Promise<Socket> => {
  return getSocket('');
};

let repo;
describe('WS new recommendations', () => {
  requirements('!rte.sharedData', 'rte.modules.search');

  beforeEach(async () => {
    repo = await getRepository(repositories.DATABASE_RECOMMENDATION);
    await repo.clear();
  });

  before(async () => {
    await rte.data.truncate();
    await enableAllDbFeatures();
  });

  it('Should notify about new big set recommendations', async () => {
    // generate big set
    const NUMBERS_OF_SET_MEMBERS = 1_001;
    await rte.data.generateHugeNumberOfMembersForSetKey(
      NUMBERS_OF_SET_MEMBERS,
      true,
    );

    // Initialize sync by connecting
    const client = await getClient();

    const recommendationsResponse: any = await new Promise((res) => {
      client.on(`recommendation`, res);

      validateApiCall({
        endpoint: () =>
          request(server).post(
            `/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/keys/get-info`,
          ),
        data: {
          keyName: constants.TEST_SET_KEY_1,
        },
      });
    });

    expect(recommendationsResponse.recommendations.length).to.eq(1);
    expect(recommendationsResponse.recommendations[0].name).to.eq('bigSets');
    expect(recommendationsResponse.recommendations[0].databaseId).to.eq(
      constants.TEST_INSTANCE_ID,
    );
    expect(recommendationsResponse.recommendations[0].read).to.eq(false);
    expect(recommendationsResponse.recommendations[0].disabled).to.eq(false);
    expect(recommendationsResponse.totalUnread).to.eq(1);
  });
});
