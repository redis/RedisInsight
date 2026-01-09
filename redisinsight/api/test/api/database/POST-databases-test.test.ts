import {
  Joi,
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  after,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
const { request, server, localDb, constants } = deps;

const endpoint = () => request(server).post(`/${constants.API.DATABASES}/test`);

// input data schema
const dataSchema = Joi.object({
  name: Joi.string().max(500).required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  db: Joi.number().integer().allow(null),
  username: Joi.string().allow(null),
  password: Joi.string().allow(null),
  timeout: Joi.number().integer().allow(null),
  compressor: Joi.string()
    .valid('NONE', 'LZ4', 'GZIP', 'ZSTD', 'SNAPPY')
    .allow(null),
  tls: Joi.boolean().allow(null),
  tlsServername: Joi.string().allow(null),
  verifyServerCert: Joi.boolean().allow(null),
  sentinelMaster: Joi.object({
    name: Joi.string().required(),
    username: Joi.string(),
    password: Joi.string(),
  }).allow(null),
  ssh: Joi.boolean().allow(null),
  sshOptions: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    username: Joi.string().required(),
    password: Joi.string().allow(null),
    privateKey: Joi.string().allow(null),
    passphrase: Joi.string().allow(null),
  }).allow(null),
})
  .messages({
    'any.required': '{#label} should not be empty',
  })
  .strict(true);

const validInputData = {
  name: constants.getRandomString(),
  host: constants.getRandomString(),
  port: 111,
};

const baseDatabaseData = {
  name: 'someName',
  host: constants.TEST_REDIS_HOST,
  port: constants.TEST_REDIS_PORT,
  username: constants.TEST_REDIS_USER || undefined,
  password: constants.TEST_REDIS_PASSWORD || undefined,
};

const baseSentinelData = {
  name: constants.TEST_SENTINEL_MASTER_GROUP,
  username: constants.TEST_SENTINEL_MASTER_USER || null,
  password: constants.TEST_SENTINEL_MASTER_PASS || null,
};

let dbName;
let newCaName;
let newClientCertName;
describe('POST /databases/test', () => {
  beforeEach(async () => {
    dbName = constants.getRandomString();
    newCaName = constants.getRandomString();
    newClientCertName = constants.getRandomString();
  });

  afterEach(async () => {
    expect(await localDb.getInstanceByName(dbName)).to.eql(null);
    expect(
      await (
        await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
      ).findOneBy({ name: newCaName }),
    ).to.eql(null);
    expect(
      await (
        await localDb.getRepository(localDb.repositories.CLIENT_CERT_REPOSITORY)
      ).findOneBy({ name: newCaName }),
    ).to.eql(null);
  });

  describe('Validation', function () {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });
  describe('STANDALONE', () => {
    requirements('rte.type=STANDALONE', '!rte.ssh');
    describe('NO AUTH', function () {
      requirements('!rte.tls', '!rte.pass');
      it('Test standalone without pass and tls', async () => {
        await validateApiCall({
          endpoint,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
          },
        });
      });
      describe('Enterprise', () => {
        requirements('rte.re');
        it('Should throw an error if db index specified', async () => {
          await validateApiCall({
            endpoint,
            statusCode: 424,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              db: constants.TEST_REDIS_DB_INDEX,
            },
          });
        });
      });
      describe('Oss', () => {
        requirements('!rte.re');
        it('Test standalone with particular db index', async () => {
          await validateApiCall({
            endpoint,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              db: constants.TEST_REDIS_DB_INDEX,
            },
          });
        });
      });
    });
    describe('PASS', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Test standalone with password', async () => {
        await validateApiCall({
          endpoint,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
          },
        });
      });
      // todo: cover connection error for incorrect username/password
    });
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Test standalone instance using tls without CA verify', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: false,
          },
        });
      });
      it('Test standalone instance using tls and verify BUT NOT create CA certificate (new)', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: newCaName,
              certificate: constants.TEST_REDIS_TLS_CA,
            },
          },
        });
      });
      it('Should throw an error without CA cert when cert validation enabled', async () => {
        await validateApiCall({
          endpoint,
          statusCode: 424,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: true,
            verifyServerCert: true,
          },
          responseBody: {
            statusCode: 424,
            message:
              'Could not connect to redis:6379, please check the CA or Client certificate.',
            error: 'RedisConnectionIncorrectCertificateException',
          },
        });
      });
      it('Should throw an error with invalid CA cert', async () => {
        await validateApiCall({
          endpoint,
          statusCode: 424,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: dbName,
              certificate: 'invalid',
            },
          },
          responseBody: {
            statusCode: 424,
            message:
              'Could not connect to redis:6379, please check the CA or Client certificate.',
            error: 'RedisConnectionIncorrectCertificateException',
          },
        });
      });
    });
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');

      after(localDb.initAgreements);

      it('Test standalone instance and verify users certs (new certificates)', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: newCaName,
              certificate: constants.TEST_REDIS_TLS_CA,
            },
            clientCert: {
              name: newClientCertName,
              certificate: constants.TEST_USER_TLS_CERT,
              key: constants.TEST_USER_TLS_KEY,
            },
          },
        });
      });
      it('Should test standalone instance with existing certificates', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              id: constants.TEST_CA_ID,
            },
            clientCert: {
              id: constants.TEST_USER_CERT_ID,
            },
          },
        });
      });
    });
  });
  describe('STANDALONE SSH', () => {
    requirements('rte.type=STANDALONE', 'rte.ssh');
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');

      after(localDb.initAgreements);

      it('Test standalone instance and verify users certs + ssh (basic)', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: newCaName,
              certificate: constants.TEST_REDIS_TLS_CA,
            },
            clientCert: {
              name: newClientCertName,
              certificate: constants.TEST_USER_TLS_CERT,
              key: constants.TEST_USER_TLS_KEY,
            },
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              password: constants.TEST_SSH_PASSWORD,
            },
          },
        });
      });
      it('Should test standalone instance with existing certificates + ssh (pk)', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              id: constants.TEST_CA_ID,
            },
            clientCert: {
              id: constants.TEST_USER_CERT_ID,
            },
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              privateKey: constants.TEST_SSH_PRIVATE_KEY,
            },
          },
        });
      });
      it('Should test standalone instance with existing certificates + ssh (pkp)', async () => {
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              id: constants.TEST_CA_ID,
            },
            clientCert: {
              id: constants.TEST_USER_CERT_ID,
            },
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              privateKey: constants.TEST_SSH_PRIVATE_KEY_P,
              passphrase: constants.TEST_SSH_PASSPHRASE,
            },
          },
        });
      });
    });
  });
  describe('CLUSTER', () => {
    requirements('rte.type=CLUSTER');
    describe('NO AUTH', function () {
      requirements('!rte.tls', '!rte.pass');
      it('Test instance without pass', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
          },
        });
      });
      it('Should throw an error if db index specified', async () => {
        await validateApiCall({
          endpoint,
          statusCode: 424,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            db: constants.TEST_REDIS_DB_INDEX,
          },
        });
      });
    });
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Should test instance without CA tls', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: false,
          },
        });
      });
      it('Should test instance tls BUT NOT create new CA cert', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: newCaName,
              certificate: constants.TEST_REDIS_TLS_CA,
            },
          },
        });
      });
      // todo: Should throw an error without CA cert when cert validation enabled
      // todo: Should throw an error with invalid CA cert
    });
  });
  describe('SENTINEL', () => {
    requirements('rte.type=SENTINEL', '!rte.tls');
    it('Should !!!NOT throw an Invalid Data error for sentinel (without sentinelMaster provided)', async () => {
      await validateApiCall({
        endpoint,
        data: {
          name: constants.getRandomString(),
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          password: constants.TEST_REDIS_PASSWORD,
        },
      });
    });
    describe('PASS', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Test sentinel with password', async () => {
        await validateApiCall({
          endpoint,
          data: {
            ...baseDatabaseData,
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
            sentinelMaster: {
              ...baseSentinelData,
            },
          },
        });
      });
      // todo: cover connection error for incorrect username/password
    });
  });
});
