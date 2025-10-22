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
  getMainCheckFn,
  serverConfig,
  before,
} from '../deps';
import { databaseSchema } from './constants';
import { ServerService } from 'src/modules/server/server.service';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';
const { rte, request, server, localDb, constants, analytics } = deps;

const endpoint = () => request(server).post(`/${constants.API.DATABASES}`);

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
  timeout: constants.TEST_REDIS_TIMEOUT,
  compressor: constants.TEST_REDIS_COMPRESSOR,
  username: constants.TEST_REDIS_USER || undefined,
  password: constants.TEST_REDIS_PASSWORD || undefined,
};

const baseSentinelData = {
  name: constants.TEST_SENTINEL_MASTER_GROUP,
  username: constants.TEST_SENTINEL_MASTER_USER || null,
  password: constants.TEST_SENTINEL_MASTER_PASS || null,
};

const responseSchema = databaseSchema
  .keys({
    isPreSetup: Joi.boolean().allow(null),
  })
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases', () => {
  let existingCACertId,
    existingClientCertId,
    existingCACertName,
    existingClientCertName;

  describe('Validation', function () {
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
  describe('STANDALONE', () => {
    requirements('rte.type=STANDALONE', '!rte.ssh');
    describe('NO AUTH', function () {
      requirements('!rte.tls', '!rte.pass');
      describe('Analytics', () => {
        requirements('rte.serverType=local');

        // todo: investigate why fails
        xit('Create standalone without pass and tls, and send analytics event for it', async () => {
          const dbName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            statusCode: 201,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
            },
            responseSchema,
            responseBody: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              username: null,
              connectionType: constants.STANDALONE,
              new: true,
            },
            checkFn: async ({ body }) => {
              // todo: find a way to test rest of the fields
              await analytics.waitForEvent({
                event: 'CONFIG_DATABASES_DATABASE_ADDED',
                properties: {
                  databaseId: body.id,
                  connectionType: body.connectionType,
                  provider: body.provider,
                  useTLS: 'disabled',
                  verifyTLSCertificate: 'disabled',
                  useTLSAuthClients: 'disabled',
                  useSNI: 'disabled',
                  useSSH: 'disabled',
                  version: rte.env.version,
                  // numberOfKeys: 8,
                  // numberOfKeysRange: '0 - 500 000',
                  // totalMemory: 881632,
                  // numberedDatabases: 16,
                  // numberOfModules: 0,
                  timeout: body.timeout / 1000,
                  // RediSearch: { loaded: false },
                  // RedisAI: { loaded: false },
                  // RedisGraph: { loaded: false },
                  // RedisGears: { loaded: false },
                  // RedisBloom: { loaded: false },
                  // RedisJSON: { loaded: false },
                  // RedisTimeSeries: { loaded: false },
                  // customModules: [],
                  buildType: ServerService.getAppType(
                    serverConfig.get('server').buildType,
                  ),
                },
              });
            },
          });
        });
      });
      it('Create standalone without pass and tls', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            username: null,
            connectionType: constants.STANDALONE,
            new: true,
          },
        });
      });
      describe('Enterprise', () => {
        requirements('rte.re');
        it('Should throw an error if db index specified', async () => {
          const dbName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            statusCode: 400,
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
        it('Create standalone with particular db index', async () => {
          let addedId;
          const dbName = constants.getRandomString();
          const cliUuid = constants.getRandomString();
          const browserKeyName = constants.getRandomString();
          const cliKeyName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            statusCode: 201,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              db: constants.TEST_REDIS_DB_INDEX,
            },
            responseSchema,
            responseBody: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              db: constants.TEST_REDIS_DB_INDEX,
              username: null,
              connectionType: constants.STANDALONE,
              new: true,
            },
            checkFn: ({ body }) => {
              addedId = body.id;
            },
          });

          // Create string using Browser API to particular db index
          await validateApiCall({
            endpoint: () =>
              request(server).post(
                `/${constants.API.DATABASES}/${addedId}/string`,
              ),
            statusCode: 201,
            data: {
              keyName: browserKeyName,
              value: 'somevalue',
            },
          });

          // Create client for CLI
          await validateApiCall({
            endpoint: () =>
              request(server).patch(
                `/${constants.API.DATABASES}/${addedId}/cli/${cliUuid}`,
              ),
            statusCode: 200,
          });

          // Create string using CLI API to 0 db index
          await validateApiCall({
            endpoint: () =>
              request(server).post(
                `/${constants.API.DATABASES}/${addedId}/cli/${cliUuid}/send-command`,
              ),
            statusCode: 200,
            data: {
              command: `set ${cliKeyName} somevalue`,
            },
          });

          // check data created by db index
          await rte.data.executeCommand(
            'select',
            `${constants.TEST_REDIS_DB_INDEX}`,
          );
          expect(await rte.data.executeCommand('exists', cliKeyName)).to.eql(1);
          expect(
            await rte.data.executeCommand('exists', browserKeyName),
          ).to.eql(1);

          // check data created by db index
          await rte.data.executeCommand('select', '0');
          expect(await rte.data.executeCommand('exists', cliKeyName)).to.eql(0);
          expect(
            await rte.data.executeCommand('exists', browserKeyName),
          ).to.eql(0);
        });
      });
    });
    describe('PASS', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Create standalone with password', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            username: null,
            password: true,
            connectionType: constants.STANDALONE,
            new: true,
          },
        });

        const db = await localDb.getInstanceByName(dbName);
        expect(db).to.be.an('object');
        expect(db.new).to.eql(true);
      });
      // todo: cover connection error for incorrect username/password
    });
    describe('Cloud details', function () {
      before(async () => {
        await localDb.initLocalDb(deps.rte, deps.server);
      });
      describe('Cloud details without pass and TLS', function () {
        requirements('!rte.tls');
        it('Should throw an error if request with cloudDetails and the same connection already exists', async () => {
          const dbName = constants.getRandomString();
          // preconditions
          expect(
            await localDb.getInstanceById(constants.TEST_INSTANCE_ID),
          ).to.be.an('object');

          await validateApiCall({
            endpoint,
            statusCode: 409,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              username: constants.TEST_REDIS_USER,
              password: constants.TEST_REDIS_PASSWORD,
              cloudDetails: {
                cloudId: constants.TEST_CLOUD_ID,
                subscriptionType: constants.TEST_CLOUD_SUBSCRIPTION_TYPE,
              },
            },
            responseBody: {
              message: ERROR_MESSAGES.DATABASE_ALREADY_EXISTS,
              statusCode: 409,
              error: 'DatabaseAlreadyExists',
              errorCode: CustomErrorCodes.DatabaseAlreadyExists,
            },
            checkFn: async ({ body }) => {
              const database = await (
                await localDb.getRepository(localDb.repositories.DATABASE)
              ).findOneBy({ host: constants.TEST_REDIS_HOST });

              expect(body.resource.databaseId).to.eq(database.id);
            },
          });
        });
      });
      describe('Cloud details with pass and TLS', function () {
        requirements('rte.tlsAuth');
        it('Should throw an error if request with cloudDetails and the same connection already exists', async () => {
          const dbName = constants.getRandomString();
          const newClientCertName = constants.getRandomString();
          const newCaName = constants.getRandomString();
          // preconditions
          expect(
            await localDb.getInstanceById(constants.TEST_INSTANCE_ID),
          ).to.be.an('object');

          await validateApiCall({
            endpoint,
            statusCode: 409,
            data: {
              name: dbName,
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
              username: constants.TEST_REDIS_USER,
              password: constants.TEST_REDIS_PASSWORD,
              tls: true,
              cloudDetails: {
                cloudId: constants.TEST_CLOUD_ID,
                subscriptionType: constants.TEST_CLOUD_SUBSCRIPTION_TYPE,
              },
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
            responseBody: {
              message: ERROR_MESSAGES.DATABASE_ALREADY_EXISTS,
              statusCode: 409,
              error: 'DatabaseAlreadyExists',
              errorCode: CustomErrorCodes.DatabaseAlreadyExists,
            },
            checkFn: async ({ body }) => {
              const database = await (
                await localDb.getRepository(localDb.repositories.DATABASE)
              ).findOneBy({ host: constants.TEST_REDIS_HOST });

              expect(body.resource.databaseId).to.eq(database.id);
            },
          });
        });
      });
    });
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Create standalone instance using tls without CA verify', async () => {
        const dbName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: false,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: false,
            new: true,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Create standalone instance using tls and verify and create CA certificate (new)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 201,
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
            new: true,
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.id).to.be.a('string');
            expect(body.caCert.name).to.eq(newCaName);
            expect(body.caCert.certificate).to.be.undefined;

            const ca: any = await (
              await localDb.getRepository(
                localDb.repositories.CA_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.caCert.id });

            expect(ca.certificate).to.eql(
              localDb.encryptData(constants.TEST_REDIS_TLS_CA),
            );
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Should throw an error without CA cert when cert validation enabled', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 400,
          data: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            tls: true,
            verifyServerCert: true,
          },
          responseBody: {
            statusCode: 400,
            // todo: verify error handling because right now messages are different
            // message: 'Could not connect to',
            error: 'Bad Request',
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should throw an error with invalid CA cert', async () => {
        const dbName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 400,
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
            statusCode: 400,
            // todo: verify error handling because right now messages are different
            // message: 'Could not connect to',
            error: 'Bad Request',
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
    });
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');

      after(localDb.initAgreements);

      it('Create standalone instance and verify users certs (new certificates)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = (existingCACertName = constants.getRandomString());
        const newClientCertName = (existingClientCertName =
          constants.getRandomString());
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        const { body } = await validateApiCall({
          endpoint,
          statusCode: 201,
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.id).to.be.a('string');
            expect(body.caCert.name).to.eq(newCaName);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.be.a('string');
            expect(body.clientCert.name).to.deep.eq(newClientCertName);
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;

            const ca: any = await (
              await localDb.getRepository(
                localDb.repositories.CA_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.caCert.id });

            expect(ca.certificate).to.eql(
              localDb.encryptData(constants.TEST_REDIS_TLS_CA),
            );

            const clientPair: any = await (
              await localDb.getRepository(
                localDb.repositories.CLIENT_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.clientCert.id });

            expect(clientPair.certificate).to.eql(
              localDb.encryptData(constants.TEST_USER_TLS_CERT),
            );
            expect(clientPair.key).to.eql(
              localDb.encryptData(constants.TEST_USER_TLS_KEY),
            );
          },
        });

        // remember certificates ids
        existingCACertId = body.caCert.id;
        existingClientCertId = body.clientCert.id;

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Should create standalone instance with existing certificates', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              id: existingCACertId,
            },
            clientCert: {
              id: existingClientCertId,
            },
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.name).to.be.a('string');
            expect(body.caCert.id).to.eq(existingCACertId);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.deep.eq(existingClientCertId);
            expect(body.clientCert.name).to.be.a('string');
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Should throw an error if try to create client certificate with existing name', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 400,
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
              name: existingClientCertName,
              certificate: constants.TEST_USER_TLS_CERT,
              key: constants.TEST_USER_TLS_KEY,
            },
          },
          responseBody: {
            error: 'Bad Request',
            message: 'This client certificate name is already in use.',
            statusCode: 400,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Should throw an error if try to create ca certificate with existing name', async () => {
        const dbName = constants.getRandomString();
        const newClientName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 400,
          data: {
            ...baseDatabaseData,
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
          responseBody: {
            error: 'Bad Request',
            message: 'This ca certificate name is already in use.',
            statusCode: 400,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
      });
      it('Create standalone instance and verify users certs (new certificates !do not encrypt)', async () => {
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
          statusCode: 201,
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.id).to.be.a('string');
            expect(body.caCert.name).to.eq(newCaName);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.be.a('string');
            expect(body.clientCert.name).to.deep.eq(newClientCertName);
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;

            const ca: any = await (
              await localDb.getRepository(
                localDb.repositories.CA_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.caCert.id });

            expect(ca.certificate).to.eql(constants.TEST_REDIS_TLS_CA);

            const clientPair: any = await (
              await localDb.getRepository(
                localDb.repositories.CLIENT_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.clientCert.id });

            expect(clientPair.certificate).to.eql(constants.TEST_USER_TLS_CERT);
            expect(clientPair.key).to.eql(constants.TEST_USER_TLS_KEY);
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
    });
  });
  describe('STANDALONE SSH', () => {
    requirements('rte.type=STANDALONE', 'rte.ssh');
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');

      let existingCACertId,
        existingClientCertId,
        existingCACertName,
        existingClientCertName;

      after(localDb.initAgreements);

      it('Create standalone instance and verify users certs + ssh (basic)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = (existingCACertName = constants.getRandomString());
        const newClientCertName = (existingClientCertName =
          constants.getRandomString());
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        const { body } = await validateApiCall({
          endpoint,
          statusCode: 201,
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              // hide security fields (password, sshOptions.password, sshOptions.passphrase)
              password: true,
            },
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.id).to.be.a('string');
            expect(body.caCert.name).to.eq(newCaName);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.be.a('string');
            expect(body.clientCert.name).to.deep.eq(newClientCertName);
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;

            const ca: any = await (
              await localDb.getRepository(
                localDb.repositories.CA_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.caCert.id });

            expect(ca.certificate).to.eql(
              localDb.encryptData(constants.TEST_REDIS_TLS_CA),
            );

            const clientPair: any = await (
              await localDb.getRepository(
                localDb.repositories.CLIENT_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.clientCert.id });

            expect(clientPair.certificate).to.eql(
              localDb.encryptData(constants.TEST_USER_TLS_CERT),
            );
            expect(clientPair.key).to.eql(
              localDb.encryptData(constants.TEST_USER_TLS_KEY),
            );

            const sshOptions: any = await (
              await localDb.getRepository(
                localDb.repositories.SSH_OPTIONS_REPOSITORY,
              )
            ).findOneBy({ id: body.sshOptions.id });

            expect(sshOptions.username).to.eql(
              localDb.encryptData(constants.TEST_SSH_USER),
            );
            expect(sshOptions.password).to.eql(
              localDb.encryptData(constants.TEST_SSH_PASSWORD),
            );
          },
        });

        // remember certificates ids
        existingCACertId = body.caCert.id;
        existingClientCertId = body.clientCert.id;

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Should create standalone instance with existing certificates + ssh (pk)', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              id: existingCACertId,
            },
            clientCert: {
              id: existingClientCertId,
            },
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              privateKey: constants.TEST_SSH_PRIVATE_KEY,
            },
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              privateKey: constants.TEST_SSH_PRIVATE_KEY,
            },
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.name).to.be.a('string');
            expect(body.caCert.id).to.eq(existingCACertId);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.deep.eq(existingClientCertId);
            expect(body.clientCert.name).to.be.a('string');
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;

            const sshOptions: any = await (
              await localDb.getRepository(
                localDb.repositories.SSH_OPTIONS_REPOSITORY,
              )
            ).findOneBy({ id: body.sshOptions.id });

            expect(sshOptions.username).to.eql(
              localDb.encryptData(constants.TEST_SSH_USER),
            );
            expect(sshOptions.privateKey).to.eql(
              localDb.encryptData(constants.TEST_SSH_PRIVATE_KEY),
            );
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Should create standalone instance with existing certificates + ssh (pkp)', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              id: existingCACertId,
            },
            clientCert: {
              id: existingClientCertId,
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              privateKey: true,
              passphrase: true,
            },
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.name).to.be.a('string');
            expect(body.caCert.id).to.eq(existingCACertId);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.deep.eq(existingClientCertId);
            expect(body.clientCert.name).to.be.a('string');
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;

            const sshOptions: any = await (
              await localDb.getRepository(
                localDb.repositories.SSH_OPTIONS_REPOSITORY,
              )
            ).findOneBy({ id: body.sshOptions.id });

            expect(sshOptions.username).to.eql(
              localDb.encryptData(constants.TEST_SSH_USER),
            );
            expect(sshOptions.privateKey).to.eql(
              localDb.encryptData(constants.TEST_SSH_PRIVATE_KEY_P),
            );
            expect(sshOptions.passphrase).to.eql(
              localDb.encryptData(constants.TEST_SSH_PASSPHRASE),
            );
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Create standalone instance and verify users certs (new certificates !do not encrypt) + ssh (basic)', async () => {
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
          statusCode: 201,
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
            ssh: true,
            sshOptions: {
              host: constants.TEST_SSH_HOST,
              port: constants.TEST_SSH_PORT,
              username: constants.TEST_SSH_USER,
              // hide security fields (password, sshOptions.password, sshOptions.passphrase)
              password: true,
            },
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.id).to.be.a('string');
            expect(body.caCert.name).to.eq(newCaName);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.be.a('string');
            expect(body.clientCert.name).to.deep.eq(newClientCertName);
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;

            const ca: any = await (
              await localDb.getRepository(
                localDb.repositories.CA_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.caCert.id });

            expect(ca.certificate).to.eql(constants.TEST_REDIS_TLS_CA);

            const clientPair: any = await (
              await localDb.getRepository(
                localDb.repositories.CLIENT_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.clientCert.id });

            expect(clientPair.certificate).to.eql(constants.TEST_USER_TLS_CERT);
            expect(clientPair.key).to.eql(constants.TEST_USER_TLS_KEY);
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
    });
  });
  describe('CLUSTER', () => {
    requirements('rte.type=CLUSTER');
    describe('NO AUTH', function () {
      requirements('!rte.tls', '!rte.pass');
      it('Create instance without pass', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.CLUSTER,
            nodes: rte.env.nodes,
          },
        });
      });
      it('Should throw an error if db index specified', async () => {
        const dbName = constants.getRandomString();

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
      it('Should create instance without CA tls', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: false,
          },
          responseSchema,
          responseBody: {
            name: dbName,
            connectionType: constants.CLUSTER,
            tls: true,
            nodes: rte.env.nodes,
            verifyServerCert: false,
          },
        });
      });
      it('Should create instance tls and create new CA cert', async () => {
        const dbName = constants.getRandomString();

        const { body } = await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
            tls: true,
            verifyServerCert: true,
            caCert: {
              name: constants.getRandomString(),
              certificate: constants.TEST_REDIS_TLS_CA,
            },
          },
          responseSchema,
          responseBody: {
            name: dbName,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.CLUSTER,
            nodes: rte.env.nodes,
            tls: true,
            verifyServerCert: true,
          },
        });
      });
      // todo: Should throw an error without CA cert when cert validation enabled
      // todo: Should throw an error with invalid CA cert
    });
  });
  describe('SENTINEL', () => {
    requirements('rte.type=SENTINEL');
    describe('COMMON', function () {
      requirements('!rte.tls');
      it('Should always throw an Invalid Data error for sentinel', async () => {
        await validateApiCall({
          endpoint,
          data: {
            name: constants.getRandomString(),
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
          },
          statusCode: 424,
          responseBody: {
            statusCode: 424,
            error: 'RedisConnectionSentinelMasterRequiredException',
            message: 'Sentinel master name must be specified.',
          },
        });
      });
    });
    describe('PASS', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Create sentinel with password (different sentinel and master passwords)', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 201,
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            username: null,
            password: true,
            connectionType: constants.SENTINEL,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      // todo: cover connection error for incorrect username/password
    });
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');
      it('Create sentinel with tls pk', async () => {
        const dbName = constants.getRandomString();
        const newCaName = (existingCACertName = constants.getRandomString());
        const newClientCertName = (existingClientCertName =
          constants.getRandomString());

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
            tls: true,
            verifyServerCert: true,
            tlsServername: null,
            caCert: {
              name: newCaName,
              certificate: constants.TEST_REDIS_TLS_CA,
            },
            clientCert: {
              name: newClientCertName,
              certificate: constants.TEST_USER_TLS_CERT,
              key: constants.TEST_USER_TLS_KEY,
            },
            sentinelMaster: {
              ...baseSentinelData,
            },
          },
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            username: null,
            password: true,
            connectionType: constants.SENTINEL,
          },
          checkFn: async ({ body }) => {
            expect(body.caCert.id).to.be.a('string');
            expect(body.caCert.name).to.eq(newCaName);
            expect(body.caCert.certificate).to.be.undefined;

            expect(body.clientCert.id).to.be.a('string');
            expect(body.clientCert.name).to.deep.eq(newClientCertName);
            expect(body.clientCert.certificate).to.be.undefined;
            expect(body.clientCert.key).to.be.undefined;

            const ca: any = await (
              await localDb.getRepository(
                localDb.repositories.CA_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.caCert.id });

            expect(ca.certificate).to.eql(
              localDb.encryptData(constants.TEST_REDIS_TLS_CA),
            );

            const clientPair: any = await (
              await localDb.getRepository(
                localDb.repositories.CLIENT_CERT_REPOSITORY,
              )
            ).findOneBy({ id: body.clientCert.id });

            expect(clientPair.certificate).to.eql(
              localDb.encryptData(constants.TEST_USER_TLS_CERT),
            );
            expect(clientPair.key).to.eql(
              localDb.encryptData(constants.TEST_USER_TLS_KEY),
            );
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      // todo: cover connection error for incorrect username/password
    });
  });
});
