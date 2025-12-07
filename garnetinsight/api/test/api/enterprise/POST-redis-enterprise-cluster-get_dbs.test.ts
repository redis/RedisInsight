import { describe, it, deps, validateApiCall, requirements } from '../deps';
const { request, server, constants } = deps;

const endpoint = () =>
  request(server).post(`/redis-enterprise/cluster/get-databases`);

//todo: add response
//{
//     uid: 1,
//     name: 'testdb',
//     dnsName: 'redis-12010.cluster.local',
//     address: '192.168.16.2',
//     port: 12010,
//     status: 'active',
//     tls: false,
//     modules: [],
//     options: {
//       enabledDataPersistence: false,
//       persistencePolicy: 'none',
//       enabledRedisFlash: false,
//       enabledReplication: false,
//       enabledBackup: false,
//       enabledActiveActive: false,
//       enabledClustering: true,
//       isReplicaDestination: false,
//       isReplicaSource: false
//     }
//   }

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    const { body } = await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('POST /redis-enterprise/cluster/get-databases', () => {
  requirements('rte.re');

  [
    {
      name: 'Should connect to a database',
      data: {
        host: constants.TEST_RE_HOST,
        port: constants.TEST_RE_PORT,
        password: constants.TEST_RE_PASS,
        username: constants.TEST_RE_USER,
        uids: [1],
      },
    },
    {
      name: 'Should return error if incorrect re credentials passed',
      data: {
        host: constants.TEST_RE_HOST,
        port: constants.TEST_RE_PORT,
        password: constants.TEST_RE_PASS + 1,
        username: constants.TEST_RE_USER + 1,
        uids: [1],
      },
      // todo: why 403 when it should be 401???
      statusCode: 403,
      responseBody: {
        statusCode: 403,
        error: 'Forbidden',
      },
    },
  ].map(mainCheckFn);
});
