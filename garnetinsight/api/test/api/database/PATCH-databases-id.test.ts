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
import { databaseSchema } from './constants';

const { request, server, localDb, constants, rte } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).patch(`/${constants.API.DATABASES}/${id}`);

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

const baseDatabaseData = {
  name: 'someName',
  host: constants.TEST_REDIS_HOST,
  port: constants.TEST_REDIS_PORT,
  username: constants.TEST_REDIS_USER || undefined,
  password: constants.TEST_REDIS_PASSWORD || undefined,
};

const responseSchema = databaseSchema
  .keys({
    isPreSetup: Joi.boolean().allow(null),
  })
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

let oldDatabase;
let newDatabase;
describe(`PATCH /databases/:id`, () => {
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
        name: 'Should change name (only) for existing database',
        data: {
          name: newName,
        },
        responseSchema,
        before: async () => {
          oldDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID,
          );
          expect(oldDatabase.name).to.not.eq(newName);
        },
        responseBody: {
          name: newName,
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID,
          );
          expect(newDatabase.name).to.eq(newName);
        },
      },
      {
        name: 'Should update database without test connections if updated fields does not affect connection details',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_5),
        data: {
          name: newName,
          timeout: 45_000,
        },
        responseSchema,
        before: async () => {
          await localDb.createIncorrectDatabaseInstances();
          oldDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_5,
          );
          expect(oldDatabase.name).to.not.eq(newName);
          // check connection
          await validateApiCall({
            endpoint: () =>
              request(server).get(
                `/${constants.API.DATABASES}/${oldDatabase.id}/connect`,
              ),
            statusCode: 424,
          });
        },
        responseBody: {
          name: newName,
          timeout: 45_000,
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_5,
          );
          expect(newDatabase.name).to.eq(newName);
          expect(newDatabase.timeout).to.eq(45_000);
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
  describe('TAGS', () => {
    const newTagsDto1 = [
      {
        key: constants.TEST_TAGS[1].key,
        value: constants.TEST_TAGS[1].value,
      },
      {
        key: 'newKey',
        value: 'newValue',
      },
    ];
    const newTagsDto2 = [
      {
        key: constants.TEST_TAGS[1].key,
        value: constants.TEST_TAGS[1].value,
      },
      {
        key: constants.TEST_TAGS[2].key,
        value: constants.TEST_TAGS[2].value,
      },
    ];
    const newTagsDto3 = [];
    const newTagsDto4 = [
      {
        key: 'duplicateKey',
        value: 'value1',
      },
      {
        key: 'duplicateKey',
        value: 'value2',
      },
    ];

    const expectTagsCount = async (count: number) => {
      const tags = await localDb.getAllTags();
      expect(tags.length).to.eq(count);
    };
    const extractTagPairs = (tags: any[]) =>
      tags
        .map(({ key, value }) => ({ key, value }))
        .sort((a, b) => a.key.localeCompare(b.key));

    [
      {
        name: 'Should update database with new tags and remove unused ones (+1,-2)',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_6),
        data: {
          tags: newTagsDto1,
        },
        responseSchema,
        before: async () => {
          await localDb.createInstancesWithTags();

          oldDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_6,
          );
          const tagPairs = extractTagPairs(oldDatabase.tags);

          expect(tagPairs).to.not.eql(newTagsDto1);
          await expectTagsCount(constants.TEST_TAGS.length);
        },
        responseBody: {
          tags: newTagsDto1,
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_6,
          );
          const tagPairs = extractTagPairs(newDatabase.tags);

          expect(tagPairs).to.eql(newTagsDto1);
          await expectTagsCount(constants.TEST_TAGS.length - 1);
        },
      },
      {
        name: 'Should update database with new tags and remove unused ones (+0,+0)',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_7),
        data: {
          tags: newTagsDto2,
        },
        responseSchema,
        before: async () => {
          await localDb.createInstancesWithTags();

          oldDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_7,
          );
          const tagPairs = extractTagPairs(oldDatabase.tags);

          expect(tagPairs).to.not.eql(newTagsDto2);
          await expectTagsCount(constants.TEST_TAGS.length);
        },
        responseBody: {
          tags: newTagsDto2,
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_7,
          );
          const tagPairs = extractTagPairs(newDatabase.tags);

          expect(tagPairs).to.eql(newTagsDto2);
          await expectTagsCount(constants.TEST_TAGS.length);
        },
      },
      {
        name: 'Should update database with new tags and remove unused ones (+0,-2)',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_6),
        data: {
          tags: newTagsDto3,
        },
        responseSchema,
        before: async () => {
          await localDb.createInstancesWithTags();

          oldDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_6,
          );
          const tagPairs = extractTagPairs(oldDatabase.tags);

          expect(tagPairs).to.not.eql(newTagsDto3);
          await expectTagsCount(constants.TEST_TAGS.length);
        },
        responseBody: {
          tags: newTagsDto3,
        },
        after: async () => {
          newDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_6,
          );
          const tagPairs = extractTagPairs(newDatabase.tags);

          expect(tagPairs).to.eql(newTagsDto3);
          await expectTagsCount(constants.TEST_TAGS.length - 2);
        },
      },
      {
        name: 'Should not allow adding duplicated tags by key to a database',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_6),
        data: {
          tags: newTagsDto4,
        },
        before: async () => {
          await localDb.createInstancesWithTags();

          oldDatabase = await localDb.getInstanceById(
            constants.TEST_INSTANCE_ID_6,
          );
          const tagPairs = extractTagPairs(oldDatabase.tags);

          expect(tagPairs).to.not.eql(newTagsDto4);
          await expectTagsCount(constants.TEST_TAGS.length);
        },
        statusCode: 400,
        responseBody: {
          message: ['Tags must not contain duplicates by key.'],
          error: 'Bad Request',
          statusCode: 400,
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
          name: 'Should change host and port and recalculate data such as (provider, modules, etc...)',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          data: {
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
          },
          responseSchema,
          before: async () => {
            oldDatabase = await localDb.getInstanceById(
              constants.TEST_INSTANCE_ID_3,
            );
            expect(oldDatabase.name).to.eq(constants.TEST_INSTANCE_NAME_3);
            expect(oldDatabase.modules).to.eq('[]');
            expect(oldDatabase.host).to.not.eq(constants.TEST_REDIS_HOST);
            expect(oldDatabase.port).to.not.eq(constants.TEST_REDIS_PORT);
          },
          responseBody: {
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            timeout: constants.TEST_REDIS_TIMEOUT,
            compressor: constants.TEST_REDIS_COMPRESSOR,
            username: null,
            connectionType: constants.STANDALONE,
            tls: false,
            verifyServerCert: false,
            tlsServername: null,
          },
          after: async () => {
            newDatabase = await localDb.getInstanceById(
              constants.TEST_INSTANCE_ID_3,
            );
            expect(newDatabase).to.contain({
              ..._.omit(oldDatabase, [
                'modules',
                'provider',
                'lastConnection',
                'new',
                'timeout',
                'compressor',
                'version',
                'createdAt',
                'tags',
              ]),
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
            });
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
      describe('Oss', () => {
        requirements('!rte.re');
        it('Update standalone with particular db index', async () => {
          let addedId;
          const cliUuid = constants.getRandomString();
          const browserKeyName = constants.getRandomString();
          const cliKeyName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            data: {
              db: constants.TEST_REDIS_DB_INDEX,
            },
            responseSchema,
            responseBody: {
              db: constants.TEST_REDIS_DB_INDEX,
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

          // switch back to db index 0
          await validateApiCall({
            endpoint,
            data: {
              db: 0,
            },
            responseSchema,
            responseBody: {
              db: 0,
            },
            checkFn: ({ body }) => {
              addedId = body.id;
            },
          });
        });
      });
    });
    describe('PASS', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Update standalone with password', async () => {
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            username: null,
            password: true,
            connectionType: constants.STANDALONE,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      // todo: cover connection error for incorrect username/password
    });
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('update standalone instance using tls without CA verify', async () => {
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
          responseSchema,
          responseBody: {
            name: dbName,
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            connectionType: constants.STANDALONE,
            tls: true,
            verifyServerCert: false,
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
      it('Update standalone instance using tls and verify and create CA certificate (new)', async () => {
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
      it('Update standalone instance and verify users certs (new certificates !do not encrypt)', async () => {
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
      it('Update standalone instance and verify users certs (new certificates)', async () => {
        const dbName = constants.getRandomString();
        const newCaName = (existingCACertName = constants.getRandomString());
        const newClientCertName = (existingClientCertName =
          constants.getRandomString());
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        const { body } = await validateApiCall({
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
      it('Should update standalone instance with existing certificates', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
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
          responseSchema,
          responseBody: {
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
      });
      it('Should throw an error if try to create client certificate with existing name', async () => {
        const dbName = constants.getRandomString();
        const newCaName = constants.getRandomString();

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
              name: existingClientCertName,
              certificate: constants.TEST_USER_TLS_CERT,
              key: constants.TEST_USER_TLS_KEY,
            },
          },
          statusCode: 400,
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
          statusCode: 400,
          responseBody: {
            error: 'Bad Request',
            message: 'This ca certificate name is already in use.',
            statusCode: 400,
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
      it('Update instance without pass', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          data: {
            name: dbName,
          },
          responseSchema,
          responseBody: {
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
      it('Should create instance without CA tls', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint: () => endpoint(constants.TEST_INSTANCE_ID_3),
          data: {
            name: dbName,
          },
          responseSchema,
          responseBody: {
            name: dbName,
          },
        });
      });
      it('Should create instance tls and create new CA cert', async () => {
        const dbName = constants.getRandomString();

        await validateApiCall({
          endpoint,
          data: {
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
      it('Should throw an error without CA cert', async () => {
        await validateApiCall({
          endpoint,
          data: {
            caCert: null,
          },
          statusCode: 424,
          responseBody: {
            error: 'RedisConnectionIncorrectCertificateException',
            statusCode: 424,
            errorCode: 10907
          },
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
          responseBody: {
            statusCode: 400,
          },
        });
      });
    });
  });

  describe('STANDALONE SSH', () => {
    requirements('rte.type=STANDALONE', 'rte.ssh');
    it('Should not update database with incorrect sshOptions', async () => {
      await validateApiCall({
        endpoint,
        data: {
          sshOptions: {
            passphrase: 'incorrect passphrase',
          },
        },
        statusCode: 500,
        responseBody: {
          error: 'Bad Request',
          statusCode: 500,
        },
      });
    });
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');

      it('Should update database with partial sshOptions', async () => {
        await validateApiCall({
          endpoint,
          data: {
            sshOptions: {
              username: constants.TEST_SSH_USER,
              password: constants.TEST_SSH_PASSWORD,
            },
          },
        });
      });

      it('Should update standalone instance with existing certificates + ssh (pk)', async () => {
        await validateApiCall({
          endpoint,
          data: {
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
        const dbName = constants.getRandomString();
        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
        await validateApiCall({
          endpoint,
          data: {
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

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
      });
    });
  });

  describe('SENTINEL', () => {
    describe('PASS', function () {
      requirements('rte.type=SENTINEL', '!rte.tls', 'rte.pass');
      it('Should update database without full sentinel master information', async () => {
        const dbName = constants.getRandomString();

        expect(await localDb.getInstanceByName(dbName)).to.eql(null);

        await validateApiCall({
          endpoint,
          data: {
            name: dbName,
            sentinelMaster: {
              password: constants.TEST_SENTINEL_MASTER_PASS || null,
            },
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
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
