import {
  expect,
  describe,
  deps,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  requirements,
  getMainCheckFn,
  _,
  it,
  validateApiCall,
  after,
} from '../deps';
import { Joi } from '../../helpers/test';

const { request, server, localDb, constants } = deps;

const baseDatabaseData = {
  name: 'someName',
  host: constants.TEST_REDIS_HOST,
  port: constants.TEST_REDIS_PORT,
  username: constants.TEST_REDIS_USER || undefined,
  password: constants.TEST_REDIS_PASSWORD || undefined,
};

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/${constants.API.DATABASES}/test/${id}`);

// input data schema
const dataSchema = Joi.object({
  name: Joi.string().max(500),
  host: Joi.string(),
  port: Joi.number().integer(),
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
  ssh: Joi.boolean().allow(null),
  sshOptions: Joi.object({
    // todo why allow null
    host: Joi.string().allow(null),
    port: Joi.number().allow(null),
    username: Joi.string().allow(null),
    password: Joi.string().allow(null),
    privateKey: Joi.string().allow(null),
    passphrase: Joi.string().allow(null),
  }).allow(null),
  caCert: Joi.object({
    name: Joi.string(),
    certificate: Joi.string(),
  }).allow(null),
  clientCert: Joi.object({
    name: Joi.string(),
    certificate: Joi.string(),
    key: Joi.string(),
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

const mainCheckFn = getMainCheckFn(endpoint);

let oldDatabase;
let newDatabase;
describe(`POST /databases/test/:id`, () => {
  beforeEach(async () => await localDb.createDatabaseInstances());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );

    [
      {
        name: 'should deprecate to pass both cert id and other cert fields',
        data: {
          ...validInputData,
          caCert: {
            id: 'id',
            name: 'ca',
            certificate: 'ca_certificate',
          },
          clientCert: {
            id: 'id',
            name: 'client',
            certificate: 'client_cert',
            key: 'client_key',
          },
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'Bad Request',
        },
        checkFn: ({ body }) => {
          expect(body.message).to.contain(
            'caCert.property name should not exist',
          );
          expect(body.message).to.contain(
            'caCert.property certificate should not exist',
          );
          expect(body.message).to.contain(
            'clientCert.property name should not exist',
          );
          expect(body.message).to.contain(
            'clientCert.property certificate should not exist',
          );
          expect(body.message).to.contain(
            'clientCert.property key should not exist',
          );
        },
      },
    ].map(mainCheckFn);
  });
  describe('Common', () => {
    const newName = constants.getRandomString();

    [
      {
        name: 'Should not change exist database name',
        data: {
          name: newName,
        },
        before: async () => {
          oldDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID,
          );
          expect(oldDatabase.name).to.not.eq(newName);
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID,
          );
          expect(newDatabase.name).to.not.eq(newName);
        },
      },
      {
        name: 'Should return 424 error if incorrect connection data provided',
        data: {
          name: 'new name',
          port: 1111,
          ssh: false,
        },
        statusCode: 424,
        responseBody: {
          statusCode: 424,
          message: `Could not connect to ${constants.TEST_REDIS_HOST}:1111, please check the connection details.`,
          error: 'RedisConnectionUnavailableException',
          errorCode: 10904,
        },
        after: async () => {
          // check that instance wasn't changed
          const newDb = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID,
          );
          expect(newDb.name).to.not.eql('new name');
          expect(newDb.port).to.eql(constants.TEST_REDIS_PORT);
        },
      },
      {
        name: 'Should return Not Found Error',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          name: 'new name',
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
    ].map(mainCheckFn);
  });
  describe('STANDALONE', () => {
    requirements('rte.type=STANDALONE', '!rte.ssh');
    describe('NO AUTH', function () {
      requirements('!rte.tls', '!rte.pass');

      [
        {
          name: 'Should not change host and port and recalculate data such as (provider, modules, etc...)',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          data: {
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
          },
          before: async () => {
            oldDatabase = await localDb.getInstanceById(
              constants.TEST_INSTANCE_ID_3,
            );
            expect(oldDatabase.name).to.eq(constants.TEST_INSTANCE_NAME_3);
            expect(oldDatabase.modules).to.eq('[]');
            expect(oldDatabase.host).to.not.eq(constants.TEST_REDIS_HOST);
            expect(oldDatabase.port).to.not.eq(constants.TEST_REDIS_PORT);
          },
          after: async () => {
            newDatabase = await localDb.getInstanceById(
              constants.TEST_INSTANCE_ID_3,
            );
            expect(newDatabase.name).to.eq(constants.TEST_INSTANCE_NAME_3);
            expect(newDatabase.modules).to.eq('[]');
            expect(newDatabase.host).to.not.eq(constants.TEST_REDIS_HOST);
            expect(newDatabase.port).to.not.eq(constants.TEST_REDIS_PORT);
          },
        },
      ].map(mainCheckFn);

      describe('Enterprise', () => {
        requirements('rte.re');
        it('Should throw an error if db index specified', async () => {
          await validateApiCall({
            endpoint,
            statusCode: 424,
            data: {
              db: constants.TEST_REDIS_DB_INDEX,
            },
          });
        });
      });
    });
    describe('PASS', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Should not update standalone with password', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      // todo: cover connection error for incorrect username/password
    });
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Should not update standalone instance using tls without CA verify', async () => {
        const dbName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: false,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should not update standalone instance using tls and verify and create CA certificate (new)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
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

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should throw an error without CA cert when cert validation enabled', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
          statusCode: 424,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: true,
            verifyServerCert: true,
            caCert: null,
          },
          responseBody: {
            statusCode: 424,
            message: 'Could not connect to redis:6379, please check the CA or Client certificate.',
            error: 'RedisConnectionIncorrectCertificateException',
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should throw an error with invalid CA cert', async () => {
        const dbName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
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
            message: 'Could not connect to redis:6379, please check the CA or Client certificate.',
            error: 'RedisConnectionIncorrectCertificateException',
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
    });
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');

      let existingCACertId,
        existingClientCertId,
        existingCACertName,
        existingClientCertName;

      beforeEach(localDb.initAgreements);
      after(localDb.initAgreements);

      // should be first test to not break other tests
      it('Should not update standalone instance and verify users certs (new certificates !do not encrypt)', async () => {
        await localDb.setAgreements({
          encryption: false,
        });

        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();
        const newClientCertName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          data: {
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

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Update standalone instance and verify users certs (new certificates)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = (existingCACertName = constants.getRandomString());
        const newClientCertName = (existingClientCertName =
          constants.getRandomString());
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          data: {
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

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should not update standalone instance with existing certificates', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 400,
          data: {
            tls: true,
            verifyServerCert: true,
            caCert: {
              id: existingCACertId,
            },
            clientCert: {
              id: existingClientCertId,
            },
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should not throw an error if try to create client certificate with existing name', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 200,
          data: {
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: newCaName,
              certificate: constants.TEST_REDIS_TLS_CA,
            },
            clientCert: {
              name: existingClientCertName,
              certificate: constants.TEST_USER_TLS_CERT,
              key: constants.TEST_USER_TLS_KEY,
            },
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should not throw an error if try to create ca certificate with existing name', async () => {
        const dbName = constants.getRandomString();
        const newClientName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 200,
          data: {
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: existingCACertName,
              certificate: constants.TEST_REDIS_TLS_CA,
            },
            clientCert: {
              name: newClientName,
              certificate: constants.TEST_USER_TLS_CERT,
              key: constants.TEST_USER_TLS_KEY,
            },
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
    });
  });
  describe('CLUSTER', () => {
    requirements('rte.type=CLUSTER');
    describe('NO AUTH', function () {
      requirements('!rte.tls', '!rte.pass');
      it('Should not update instance without pass', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 200,
          data: {
            name: dbName,
          },
        });
      });
      it('Should throw an error if db index specified', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
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
      it('Should not create instance without CA tls', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          statusCode: 424,
          data: {
            name: dbName,
            tls: true,
            verifyServerCert: false,
          },
        });
      });
      it('Should not create instance tls and create new CA cert', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          statusCode: 424,
          data: {
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: constants.getRandomString(),
              certificate: constants.TEST_REDIS_TLS_CA,
            },
          },
        });
      });
      it('Should throw an error without CA cert', async () => {
        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          data: {
            caCert: null,
          },
          statusCode: 424,
        });
      });
      it('Should throw an error without invalid cert', async () => {
        const newClientName = constants.getRandomString();

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          data: {
            clientCert: {
              name: newClientName,
              certificate: '-----BEGIN CERTIFICATE REQUEST-----dasdas',
              key: constants.TEST_USER_TLS_KEY,
            },
          },
          statusCode: 400,
        });
      });
    });
  });
  describe('SENTINEL', () => {
    describe('PASS', function () {
      requirements('rte.type=SENTINEL', '!rte.tls', 'rte.pass');
      it('Should test connection without full sentinel master information', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          data: {
            name: dbName,
            sentinelMaster: {
              password: constants.TEST_SENTINEL_MASTER_PASS || null,
            },
          },
        });
      });

      it('Should throw Unauthorized error', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 424,
          data: {
            name: dbName,
            sentinelMaster: {
              password: 'incorrect password',
            },
          },
          responseBody: {
            statusCode: 424,
            message:
              'Failed to authenticate, please check the username or password.',
            error: 'RedisConnectionUnauthorizedException',
          },
        });
      });
    });
  });
});
