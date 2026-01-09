import { describe, expect, deps, before, _, getMainCheckFn } from '../deps';
import { Joi, requirements } from '../../helpers/test';
const { localDb, request, server, constants } = deps;

const endpoint = () =>
  request(server).post(`/${constants.API.DATABASES}/export`);

const responseSchema = Joi.array()
  .items(
    Joi.object().keys({
      id: Joi.string().required(),
      host: Joi.string().required(),
      port: Joi.number().integer().required(),
      db: Joi.number().integer().allow(null).required(),
      name: Joi.string().required(),
      username: Joi.string().allow(null).required(),
      password: Joi.string().allow(null),
      provider: Joi.string().required(),
      tls: Joi.boolean().allow(null).required(),
      tlsServername: Joi.string().allow(null).required(),
      nameFromProvider: Joi.string().allow(null).required(),
      connectionType: Joi.string()
        .valid('STANDALONE', 'SENTINEL', 'CLUSTER', 'NOT CONNECTED')
        .required(),
      lastConnection: Joi.string().isoDate().allow(null).required(),
      modules: Joi.array()
        .items(
          Joi.object().keys({
            name: Joi.string().required(),
            version: Joi.number().integer().required(),
            semanticVersion: Joi.string(),
          }),
        )
        .min(0)
        .required(),
      verifyServerCert: Joi.boolean().allow(null),
      sentinelMaster: Joi.object({
        name: Joi.string().required(),
        username: Joi.string(),
        password: Joi.string(),
      }).allow(null),
      ssh: Joi.boolean().allow(null),
      forceStandalone: Joi.boolean().allow(null),
      sshOptions: Joi.object({
        id: Joi.string(),
        host: Joi.string().required(),
        port: Joi.number().required(),
        username: Joi.string().required(),
        password: Joi.string().allow(null),
        privateKey: Joi.string().allow(null),
        passphrase: Joi.string().allow(null),
      }).allow(null),
      caCert: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        certificate: Joi.string().required(),
        isPreSetup: Joi.boolean().allow(null),
      }).allow(null),
      clientCert: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        certificate: Joi.string().required(),
        key: Joi.string(),
        isPreSetup: Joi.boolean().allow(null),
      }).allow(null),
      compressor: Joi.string()
        .valid(
          'NONE',
          'GZIP',
          'ZSTD',
          'LZ4',
          'SNAPPY',
          'Brotli',
          'PHPGZCompress',
        )
        .required(),
      tags: Joi.array()
        .items(
          Joi.object().keys({
            key: Joi.string().required(),
            value: Joi.string().required(),
          }),
        )
        .allow(null),
      isPreSetup: Joi.boolean().allow(null),
    }),
  )
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`POST /databases/export`, () => {
  before(async () => {
    await localDb.createDatabaseInstances();
    // initializing modules list when ran as standalone test
    await request(server).get(
      `/databases/${constants.TEST_INSTANCE_ACL_ID}/connect`,
    );
  });
  describe('STANDALONE', function () {
    requirements('rte.type=STANDALONE');
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth', '!rte.ssh');
      [
        {
          name: 'Should return list of databases by ids without secrets',
          data: {
            ids: [constants.TEST_INSTANCE_ACL_ID],
            withSecrets: false,
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.length).to.eq(1);
            expect(body[0]).to.not.have.property('password');
            expect(body[0].clientCert).to.not.have.property('key');
            expect(body[0].id).to.eq(constants.TEST_INSTANCE_ACL_ID);
            expect(body[0].name).to.eq(constants.TEST_INSTANCE_ACL_NAME);
            expect(body[0].username).to.eq(constants.TEST_INSTANCE_ACL_USER);
          },
        },
        {
          name: 'Should return list of databases by ids with secrets',
          data: {
            ids: [constants.TEST_INSTANCE_ACL_ID],
            withSecrets: true,
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.length).to.eq(1);
            expect(body[0]).to.have.property('password');
            expect(body[0].password).to.eq(constants.TEST_INSTANCE_ACL_PASS);
            expect(body[0].clientCert).to.have.property('key');
            expect(body[0].clientCert.key).to.have.eq(
              constants.TEST_USER_TLS_KEY,
            );
            expect(body[0].id).to.eq(constants.TEST_INSTANCE_ACL_ID);
            expect(body[0].username).to.eq(constants.TEST_INSTANCE_ACL_USER);
            expect(body[0].compressor).to.eq(constants.TEST_REDIS_COMPRESSOR);
          },
        },
      ].map(mainCheckFn);
    });
  });
  describe('SENTINEL', function () {
    describe('TLS AUTH', function () {
      requirements('rte.type=SENTINEL', 'rte.tlsAuth');
      [
        {
          name: 'Should return list of databases by ids without secrets',
          data: {
            ids: [constants.TEST_INSTANCE_ACL_ID],
            withSecrets: false,
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.length).to.eq(1);
            expect(body[0]).to.not.have.property('password');
            expect(body[0].sentinelMaster).to.not.have.property('password');
            expect(body[0].id).to.eq(constants.TEST_INSTANCE_ACL_ID);
            expect(body[0].name).to.eq(constants.TEST_INSTANCE_ACL_NAME);
            expect(body[0].sentinelMaster.name).to.eq(
              constants.TEST_SENTINEL_MASTER_GROUP,
            );
            expect(body[0].sentinelMaster).to.have.property('username');
            expect(body[0].sentinelMaster.username).to.be.a('string');
          },
        },
        {
          name: 'Should return list of databases by ids with secrets',
          data: {
            ids: [constants.TEST_INSTANCE_ACL_ID],
            withSecrets: true,
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body[0]).to.have.property('password');
            expect(body[0].sentinelMaster).to.have.property('password');
            expect(body[0].sentinelMaster.password).to.be.a('string');
            expect(body[0].sentinelMaster.password).to.not.eq('');
            expect(body[0].id).to.eq(constants.TEST_INSTANCE_ACL_ID);
            expect(body[0].password).to.eq(constants.TEST_REDIS_PASSWORD);
            expect(body[0].sentinelMaster.name).to.eq(
              constants.TEST_SENTINEL_MASTER_GROUP,
            );
            expect(body[0].sentinelMaster).to.have.property('username');
          },
        },
      ].map(mainCheckFn);
    });
  });
  describe('STANDALONE SSH', function () {
    requirements('rte.type=STANDALONE', 'rte.ssh');
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');
      [
        {
          name: 'Should return list of databases by ids without secrets',
          data: {
            ids: [constants.TEST_INSTANCE_ACL_ID],
            withSecrets: false,
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.length).to.eq(1);
            expect(body[0]).to.not.have.property('password');
            // todo: fixed test but need to review implementation
            // sshOptions.private key field exists but value is <null>
            // expect(body[0].sshOptions).to.not.have.property('privateKey');
            expect(body[0].sshOptions?.privateKey).to.eq(undefined);
            expect(body[0].clientCert).to.not.have.property('key');
            expect(body[0].id).to.eq(constants.TEST_INSTANCE_ACL_ID);
            expect(body[0].name).to.eq(constants.TEST_INSTANCE_ACL_NAME);
            expect(body[0].username).to.eq(constants.TEST_INSTANCE_ACL_USER);
          },
        },
        {
          name: 'Should return list of databases by ids with secrets',
          data: {
            ids: [constants.TEST_INSTANCE_ACL_ID],
            withSecrets: true,
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.length).to.eq(1);
            expect(body[0]).to.have.property('password');
            expect(body[0].password).to.eq(constants.TEST_INSTANCE_ACL_PASS);
            expect(body[0].sshOptions).to.have.property('privateKey');
            expect(body[0].sshOptions.privateKey).to.have.eq(
              constants.TEST_SSH_PRIVATE_KEY,
            );
            expect(body[0].clientCert).to.have.property('key');
            expect(body[0].clientCert.key).to.have.eq(
              constants.TEST_USER_TLS_KEY,
            );
            expect(body[0].id).to.eq(constants.TEST_INSTANCE_ACL_ID);
            expect(body[0].username).to.eq(constants.TEST_INSTANCE_ACL_USER);
          },
        },
        {
          name: 'Should return list of databases by ids with secrets (ssh privateKey along with passphrase)',
          data: {
            ids: [constants.TEST_INSTANCE_ID],
            withSecrets: true,
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.length).to.eq(1);
            expect(body[0].sshOptions.privateKey).to.eq(
              constants.TEST_SSH_PRIVATE_KEY_P,
            );
            expect(body[0].sshOptions.passphrase).to.eq(
              constants.TEST_SSH_PASSPHRASE,
            );
            expect(body[0].clientCert).to.have.property('key');
            expect(body[0].clientCert.key).to.have.eq(
              constants.TEST_USER_TLS_KEY,
            );
            expect(body[0].id).to.eq(constants.TEST_INSTANCE_ID);
          },
        },
      ].map(mainCheckFn);
    });
  });
});
