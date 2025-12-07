import {
  Joi,
  expect,
  describe,
  after,
  it,
  deps,
  requirements,
  validateApiCall,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';
const { rte, request, server, constants, localDb } = deps;

const endpoint = () => request(server).post('/redis-sentinel/databases');

// input data schema
const dataSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  db: Joi.number().integer().allow(null),
  username: Joi.string().allow(null),
  password: Joi.string().allow(null),
  tls: Joi.boolean().allow(null),
  tlsServername: Joi.string().allow(null),
  verifyServerCert: Joi.boolean().allow(null),
})
  .messages({
    'any.required': '{#label} should not be empty',
  })
  .strict(true);

const validInputData = {
  host: constants.getRandomString(),
  port: 111,
};

const baseSentinelData = {
  alias: constants.getRandomString(),
  name: constants.TEST_SENTINEL_MASTER_GROUP,
  username: constants.TEST_SENTINEL_MASTER_USER || null,
  password: constants.TEST_SENTINEL_MASTER_PASS || null,
};

const baseDatabaseData = {
  host: constants.TEST_REDIS_HOST,
  port: constants.TEST_REDIS_PORT,
  username: constants.TEST_REDIS_USER || undefined,
  password: constants.TEST_REDIS_PASSWORD || undefined,
  masters: [baseSentinelData],
};

const responseSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      status: Joi.string().required(),
      message: Joi.string().required(),
    }),
  )
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /redis-sentinel/databases', () => {
  requirements('rte.type=SENTINEL');
  after(localDb.initAgreements);

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

  // todo: cover connection error for incorrect host + port [describe('common')]
  describe('NO TLS', () => {
    requirements('!rte.tls');
    it('Create sentinel database', async () => {
      const dbName = constants.getRandomString();

      await validateApiCall({
        endpoint,
        statusCode: 201,
        data: {
          ...baseDatabaseData,
          masters: [
            {
              ...baseSentinelData,
              alias: dbName,
            },
          ],
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].status).to.eql('success');
          expect(body[0].message).to.eql('Added');

          const db: any = await (
            await localDb.getRepository(localDb.repositories.DATABASE)
          ).findOneBy({
            id: body[0].id,
          });

          expect(db.password).to.eql(
            localDb.encryptData(constants.TEST_REDIS_PASSWORD),
          );
          expect(db.sentinelMasterPassword).to.eql(
            localDb.encryptData(constants.TEST_SENTINEL_MASTER_PASS),
          );
        },
      });
    });
    it('Create sentinel database with particular db index', async () => {
      let addedId;
      const dbName = constants.getRandomString();
      const cliUuid = constants.getRandomString();
      const browserKeyName = constants.getRandomString();
      const cliKeyName = constants.getRandomString();

      await validateApiCall({
        endpoint,
        statusCode: 201,
        data: {
          ...baseDatabaseData,
          masters: [
            {
              ...baseSentinelData,
              alias: dbName,
              db: constants.TEST_REDIS_DB_INDEX,
            },
          ],
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.length).to.eql(1);
          addedId = body[0].id;
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].status).to.eql('success');
          expect(body[0].message).to.eql('Added');
        },
      });

      // Create string using Browser API to particular db index
      await validateApiCall({
        endpoint: () =>
          request(server).post(`/${constants.API.DATABASES}/${addedId}/string`),
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
      expect(await rte.data.executeCommand('exists', browserKeyName)).to.eql(1);

      // check data created by db index
      await rte.data.executeCommand('select', '0');
      expect(await rte.data.executeCommand('exists', cliKeyName)).to.eql(0);
      expect(await rte.data.executeCommand('exists', browserKeyName)).to.eql(0);
    });
  });
  describe('TLS AUTH', () => {
    requirements('rte.tlsAuth');
    let existingCACertId,
      existingClientCertId,
      existingCACertName,
      existingClientCertName;

    it('Create sentinel database (tls)', async () => {
      const dbName = constants.getRandomString();
      const newCaName = (existingCACertName = constants.getRandomString());
      const newClientCertName = (existingClientCertName =
        constants.getRandomString());

      await validateApiCall({
        endpoint,
        statusCode: 201,
        data: {
          ...baseDatabaseData,
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
          masters: [
            {
              ...baseSentinelData,
              alias: dbName,
            },
          ],
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].status).to.eql('success');
          expect(body[0].message).to.eql('Added');

          const db: any = await (
            await localDb.getRepository(localDb.repositories.DATABASE)
          ).findOneBy({
            id: body[0].id,
          });

          expect(db.password).to.eql(
            localDb.encryptData(constants.TEST_REDIS_PASSWORD),
          );
          expect(db.sentinelMasterPassword).to.eql(
            localDb.encryptData(constants.TEST_SENTINEL_MASTER_PASS),
          );
          expect(db.caCert.certificate).to.eql(
            localDb.encryptData(constants.TEST_REDIS_TLS_CA),
          );
          expect(db.clientCert.certificate).to.eql(
            localDb.encryptData(constants.TEST_USER_TLS_CERT),
          );
          expect(db.clientCert.key).to.eql(
            localDb.encryptData(constants.TEST_USER_TLS_KEY),
          );
        },
      });
    });
    it('Create sentinel database with plain auth data', async () => {
      await localDb.setAgreements({
        encryption: false,
      });

      const dbName = constants.getRandomString();
      const newCaName = (existingCACertName = constants.getRandomString());
      const newClientCertName = (existingClientCertName =
        constants.getRandomString());

      await validateApiCall({
        endpoint,
        statusCode: 201,
        data: {
          ...baseDatabaseData,
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
          masters: [
            {
              ...baseSentinelData,
              alias: dbName,
            },
          ],
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(1);
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].status).to.eql('success');
          expect(body[0].message).to.eql('Added');

          const db: any = await (
            await localDb.getRepository(localDb.repositories.DATABASE)
          ).findOneBy({
            id: body[0].id,
          });

          expect(db.password).to.eql(constants.TEST_REDIS_PASSWORD);
          expect(db.sentinelMasterPassword).to.eql(
            constants.TEST_SENTINEL_MASTER_PASS,
          );
          expect(db.caCert.certificate).to.eql(constants.TEST_REDIS_TLS_CA);
          expect(db.clientCert.certificate).to.eql(
            constants.TEST_USER_TLS_CERT,
          );
          expect(db.clientCert.key).to.eql(constants.TEST_USER_TLS_KEY);
        },
      });
    });
  });
});
