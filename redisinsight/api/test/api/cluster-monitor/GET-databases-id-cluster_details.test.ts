import {
  describe,
  deps,
  before,
  expect,
  requirements,
  getMainCheckFn,
} from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/cluster-details`,
  );

const nodeSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    version: Joi.string().required(),
    mode: Joi.string().required(),
    host: Joi.string().required(),
    port: Joi.number(),
    role: Joi.string().required(),
    slots: Joi.array().items(Joi.string()).required(),
    health: Joi.string().required(),
    totalKeys: Joi.number().allow(null),
    usedMemory: Joi.number().allow(null),
    opsPerSecond: Joi.number().allow(null),
    connectionsReceived: Joi.number().allow(null),
    connectedClients: Joi.number().allow(null),
    commandsProcessed: Joi.number().allow(null),
    networkInKbps: Joi.number().allow(null),
    networkOutKbps: Joi.number().allow(null),
    cacheHitRatio: Joi.number().allow(null),
    replicationOffset: Joi.number().allow(null),
    uptimeSec: Joi.number().allow(null),
    replicas: Joi.array().items(this),
  })
  .required();

const responseSchema = Joi.object()
  .keys({
    user: Joi.string(),
    version: Joi.string().required(),
    mode: Joi.string().required(),
    state: Joi.string().required(),
    slotsAssigned: Joi.number().allow(null),
    slotsOk: Joi.number().allow(null),
    slotsPFail: Joi.number().allow(null),
    slotsFail: Joi.number().allow(null),
    slotsUnassigned: Joi.number().allow(null),
    statsMessagesSent: Joi.number().allow(null),
    statsMessagesReceived: Joi.number().allow(null),
    currentEpoch: Joi.number().allow(null),
    myEpoch: Joi.number().allow(null),
    size: Joi.number().allow(null),
    knownNodes: Joi.number().allow(null),
    uptimeSec: Joi.number().allow(null),
    nodes: Joi.array().items(nodeSchema).min(0).required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:id/cluster-details', () => {
  before(localDb.createDatabaseInstances);

  describe('Common', () => {
    [
      {
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_4),
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
  });

  describe('Any non-cluster', () => {
    requirements('rte.type<>CLUSTER');
    [
      {
        name: 'Should return BadRequest for non-cluster databases',
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Current database is not in a cluster mode',
        },
      },
    ].map(mainCheckFn);
  });

  describe('Cluster', () => {
    requirements('rte.type=CLUSTER');
    [
      {
        name: 'Should get cluster details',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.version).to.eql(rte.env.version);
        },
      },
    ].map(mainCheckFn);

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should return details in positive case',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.version).to.eql(rte.env.version);
          },
        },
        {
          before: () => rte.data.setAclUserRules('~* +@all -cluster'),
          name: 'Should throw error if no permissions for "cluster" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
        },
        {
          before: () => rte.data.setAclUserRules('~* +@all -info'),
          name: 'Should not throw error if no permissions for "info" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.state).to.eql('ok');
          },
        },
      ].map(mainCheckFn);
    });
  });
});
