import {
  describe,
  it,
  deps,
  validateApiCall,
  before,
  expect,
  requirements,
  getMainCheckFn,
} from '../deps';
import { Joi } from '../../helpers/test';
import { parseClusterNodesResponse } from '../../helpers/utils';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${id}/overview`);

const responseSchema = Joi.object()
  .keys({
    version: Joi.string().required(),
    serverName: Joi.string().allow(null),
    totalKeys: Joi.number().integer().allow(null),
    totalKeysPerDb: Joi.object().allow(null),
    usedMemory: Joi.number().integer().allow(null),
    connectedClients: Joi.number().allow(null),
    opsPerSecond: Joi.number().allow(null),
    networkInKbps: Joi.number().allow(null),
    networkOutKbps: Joi.number().integer().allow(null),
    cpuUsagePercentage: Joi.number().allow(null),
    maxCpuUsagePercentage: Joi.number().allow(null),
  })
  .required()
  .strict();

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /${constants.API.DATABASES}/:id/overview`, () => {
  before(localDb.createDatabaseInstances);

  [
    {
      name: 'Should get database overview',
      responseSchema,
      checkFn: ({ body }) => {
        expect(body.version).to.eql(rte.env.version);
      },
    },
    {
      endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
      name: 'Should not connect to a database due to misconfiguration',
      statusCode: 424,
      responseBody: {
        statusCode: 424,
        error: 'RedisConnectionUnavailableException',
        errorCode: 10904,
      },
    },
    {
      name: 'Should return NotFound error if instance id does not exists',
      endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
      statusCode: 404,
      responseBody: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Invalid database instance id.',
      },
    },
  ].map(mainCheckFn);

  describe('Enterprise', () => {
    requirements('rte.re');

    [
      {
        name: 'Should get database overview except CPU',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.version).to.eql(rte.env.version);
          expect(body.cpuUsagePercentage).to.eql(undefined);
          expect(body.totalKeys).to.not.eql(undefined);
          expect(body.totalKeysPerDb).to.eql(undefined);
          expect(body.connectedClients).to.not.eql(undefined);
          expect(body.opsPerSecond).to.not.eql(undefined);
          expect(body.networkInKbps).to.not.eql(undefined);
          expect(body.networkOutKbps).to.not.eql(undefined);
          expect(body.usedMemory).to.not.eql(undefined);
        },
      },
    ].map(mainCheckFn);
  });

  describe('Cluster', () => {
    requirements('rte.type=CLUSTER');

    [
      {
        name: 'Should include maxCpuUsagePercentage for cluster based on primary nodes',
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.version).to.eql(rte.env.version);
          expect(body).to.have.property('maxCpuUsagePercentage');

          // Get the actual number of primary nodes from the cluster
          const clusterNodesResponse = await rte.client.cluster('NODES');
          const clusterNodes = parseClusterNodesResponse(clusterNodesResponse);
          const primaryNodesCount = clusterNodes.filter(
            (node) => !node.replicaOf || node.replicaOf === '-',
          ).length;
          const expectedMaxCpu = primaryNodesCount * 100;

          expect(body.maxCpuUsagePercentage).to.eql(expectedMaxCpu);
        },
      },
    ].map(mainCheckFn);
  });
});
