import {
  describe,
  deps,
  before,
  expect,
  getMainCheckFn,
  requirements,
} from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${id}/info`);

const responseSchema = Joi.object()
  .keys({
    version: Joi.string().required(),
    databases: Joi.number().integer(),
    role: Joi.string(),
    totalKeys: Joi.number().integer().required(),
    usedMemory: Joi.number().integer().required(),
    connectedClients: Joi.number().integer(),
    uptimeInSeconds: Joi.number().integer(),
    hitRatio: Joi.number(),
    cashedScripts: Joi.number(),
    server: Joi.object(),
    nodes: Joi.array().items(
      Joi.object().keys({
        version: Joi.string().required(),
        databases: Joi.number().integer().required(),
        role: Joi.string().required(),
        totalKeys: Joi.number().integer().required(),
        usedMemory: Joi.number().integer().required(),
        connectedClients: Joi.number().integer().required(),
        uptimeInSeconds: Joi.number().integer().required(),
        hitRatio: Joi.number().required(),
        cashedScripts: Joi.number(),
        server: Joi.object().required(),
        stats: Joi.object().keys({
          instantaneous_ops_per_sec: Joi.string(),
          instantaneous_input_kbps: Joi.string(),
          instantaneous_output_kbps: Joi.string(),
          uptime_in_days: Joi.string(),
          maxmemory_policy: Joi.string(),
          numberOfKeysRange: Joi.string(),
        }),
      }),
    ),
    stats: Joi.object().keys({
      instantaneous_ops_per_sec: Joi.string(),
      instantaneous_input_kbps: Joi.string(),
      instantaneous_output_kbps: Joi.string(),
      uptime_in_days: Joi.string(),
      maxmemory_policy: Joi.string(),
      numberOfKeysRange: Joi.string(),
    }),
  })
  .required()
  .strict();

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /databases/:id/info`, () => {
  before(localDb.createDatabaseInstances);

  [
    {
      name: 'Should get database info',
      responseSchema,
      checkFn: ({ body }) => {
        expect(body.version).to.eql(rte.env.version);
      },
    },
    {
      endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
      name: 'Should not get info due to misconfiguration',
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

  describe('ACL', () => {
    requirements(
      'rte.acl',
      'rte.type=STANDALONE',
      '!rte.re',
      '!rte.sharedData',
    );
    before(async () => rte.data.setAclUserRules('~* +@all'));
    beforeEach(rte.data.truncate);

    [
      {
        name: 'Should return 1 for empty databases',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        before: () => rte.data.setAclUserRules('~* +@all -config'),
        responseBody: {
          databases: 1,
          // ...other fields
        },
        statusCode: 200,
      },
      {
        name: 'Should return 1 for database with keys created for db0 only',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        before: async () => {
          await rte.data.setAclUserRules('~* +@all -config');
          await rte.data.generateStrings();
        },
        responseBody: {
          databases: 1,
          // ...other fields
        },
        statusCode: 200,
      },
      {
        name: 'Should return > 1 databases since data persists there',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        before: async () => {
          await rte.data.setAclUserRules('~* +@all -config');

          // generate data in > 0 logical database
          await rte.data.executeCommand(
            'select',
            `${constants.TEST_REDIS_DB_INDEX}`,
          );
          await rte.data.executeCommand('set', 'some', 'key');
          await rte.data.executeCommand('select', '0');
        },
        responseBody: {
          databases: constants.TEST_REDIS_DB_INDEX + 1,
          // ...other fields
        },
        statusCode: 200,
      },
    ].map(mainCheckFn);
  });
});
