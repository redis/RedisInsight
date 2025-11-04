import {
  Joi,
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  getMainCheckFn,
  generateInvalidDataArray,
  _,
} from '../deps';
import { randomBytes } from 'crypto';
import { cloneDeep, set } from 'lodash';
const { rte, request, server, localDb, constants } = deps;

const endpoint = () =>
  request(server).post(`/${constants.API.DATABASES}/import`);

// input data schema
const databaseSchema = Joi.object({
  name: Joi.string().allow(null, ''),
  host: Joi.string().required(),
  port: Joi.number().integer().allow(true).required(),
  db: Joi.number().integer().allow(null, ''),
  username: Joi.string().allow(null, ''),
  password: Joi.string().allow(null, ''),
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
  username: constants.TEST_REDIS_USER || '',
  password: constants.TEST_REDIS_PASSWORD || '',
  compressor: constants.TEST_REDIS_COMPRESSOR,
};

const baseTls = {
  tls: constants.TEST_REDIS_TLS_CA ? true : undefined,
  caCert: constants.TEST_REDIS_TLS_CA
    ? {
        name: constants.TEST_CA_NAME,
        certificate: constants.TEST_REDIS_TLS_CA,
      }
    : undefined,
  clientCert: constants.TEST_USER_TLS_CERT
    ? {
        name: constants.TEST_CLIENT_CERT_NAME,
        certificate: constants.TEST_USER_TLS_CERT,
        key: constants.TEST_USER_TLS_KEY,
      }
    : undefined,
};

const baseSentinelData = {
  sentinelMaster:
    constants.TEST_RTE_TYPE === 'SENTINEL'
      ? {
          name: constants.TEST_SENTINEL_MASTER_GROUP,
          username: constants.TEST_SENTINEL_MASTER_USER || null,
          password: constants.TEST_SENTINEL_MASTER_PASS || null,
        }
      : undefined,
};

const sshBasicData = {
  ssh: true,
  sshOptions: {
    host: constants.TEST_SSH_HOST,
    port: constants.TEST_SSH_PORT,
    username: constants.TEST_SSH_USER,
    password: constants.TEST_SSH_PASSWORD,
  },
};

const sshPKData = {
  ...sshBasicData,
  sshOptions: {
    ...sshBasicData.sshOptions,
    password: undefined,
    privateKey: constants.TEST_SSH_PRIVATE_KEY,
  },
};

const sshPKPData = {
  ...sshBasicData,
  sshOptions: {
    ...sshPKData.sshOptions,
    privateKey: constants.TEST_SSH_PRIVATE_KEY_P,
    passphrase: constants.TEST_SSH_PASSPHRASE,
  },
};

const importDatabaseFormat0 = {
  ...baseDatabaseData,
  ...baseTls,
  ...baseSentinelData,
  connectionType: 'STANDALONE',
  verifyServerCert: true,
};

const baseSentinelDataFormat1 = {
  sentinelOptions: baseSentinelData.sentinelMaster
    ? {
        sentinelPassword: baseSentinelData.sentinelMaster.password,
        name: baseSentinelData.sentinelMaster.name,
      }
    : undefined,
};

const sshBasicDataFormat1 = {
  sshHost: constants.TEST_SSH_HOST,
  sshPort: constants.TEST_SSH_PORT,
  sshUser: constants.TEST_SSH_USER,
  sshPassword: constants.TEST_SSH_PASSWORD,
};

const sshPKDataFormat1 = {
  ...sshBasicDataFormat1,
  sshPassword: undefined,
  sshKeyFile: constants.TEST_SSH_PRIVATE_KEY,
};

const sshPKPDataFormat1 = {
  ...sshPKDataFormat1,
  sshKeyFile: constants.TEST_SSH_PRIVATE_KEY_P,
  sshKeyPassphrase: constants.TEST_SSH_PASSPHRASE,
};

const importDatabaseFormat1 = {
  id: '1393c216-3fd0-4ad5-8412-209a8e8ec77c',
  name: baseDatabaseData.name,
  type: 'standalone',
  keyPrefix: null,
  host: baseDatabaseData.host,
  port: baseDatabaseData.port,
  username: baseDatabaseData.username,
  password: baseDatabaseData.password,
  db: 0,
  ssl: !!baseTls.tls,
  caCert: baseTls.caCert ? constants.TEST_CA_CERT_PATH : null,
  certificate: baseTls.clientCert ? constants.TEST_CLIENT_CERT_PATH : null,
  keyFile: baseTls.clientCert ? constants.TEST_CLIENT_KEY_PATH : null,
  ...baseSentinelDataFormat1,
};

const baseSentinelDataFormat2 = {
  sentinelOptions: baseSentinelData.sentinelMaster
    ? {
        masterName: baseSentinelData.sentinelMaster.name,
        nodePassword: baseSentinelData.sentinelMaster.password,
      }
    : undefined,
};

const sshBasicDataFormat2 = {
  ssh: true,
  sshOptions: {
    host: constants.TEST_SSH_HOST,
    port: constants.TEST_SSH_PORT,
    username: constants.TEST_SSH_USER,
    password: constants.TEST_SSH_PASSWORD,
  },
};

const sshPKDataFormat2 = {
  ...sshBasicDataFormat2,
  sshOptions: {
    ...sshBasicDataFormat2.sshOptions,
    password: undefined,
    privatekey: constants.TEST_SSH_PRIVATE_KEY,
  },
};

const sshPKPDataFormat2 = {
  ...sshBasicDataFormat2,
  sshOptions: {
    ...sshBasicDataFormat2.sshOptions,
    privatekey: constants.TEST_SSH_PRIVATE_KEY_P,
    passphrase: constants.TEST_SSH_PASSPHRASE,
  },
};

const importDatabaseFormat2 = {
  host: baseDatabaseData.host,
  port: `${baseDatabaseData.port}`,
  auth: baseDatabaseData.password,
  username: baseDatabaseData.username,
  connectionName: baseDatabaseData.name,
  cluster: false,
  sslOptions: baseTls.caCert
    ? {
        key: baseTls.clientCert ? constants.TEST_CLIENT_KEY_PATH : undefined,
        cert: baseTls.clientCert ? constants.TEST_CLIENT_CERT_PATH : undefined,
        ca: baseTls.caCert ? constants.TEST_CA_CERT_PATH : undefined,
      }
    : undefined,
  ...baseSentinelDataFormat2,
};

const sshBasicDataFormat3 = {
  ssh_host: constants.TEST_SSH_HOST,
  ssh_port: constants.TEST_SSH_PORT,
  ssh_user: constants.TEST_SSH_USER,
  ssh_password: constants.TEST_SSH_PASSWORD,
};

const sshPKDataFormat3 = {
  ...sshBasicDataFormat3,
  ssh_password: undefined,
  ssh_private_key_path: constants.TEST_SSH_PRIVATE_KEY,
};

const sshPKPDataFormat3 = {
  ...sshPKDataFormat3,
  ssh_private_key_path: constants.TEST_SSH_PRIVATE_KEY_P,
  ssh_password: constants.TEST_SSH_PASSPHRASE,
};

const importDatabaseFormat3 = {
  name: baseDatabaseData.name,
  host: baseDatabaseData.host,
  port: baseDatabaseData.port,
  auth: baseDatabaseData.password,
  username: baseDatabaseData.username,
  ssl: !!baseTls.tls,
  ssl_ca_cert_path: baseTls.caCert ? constants.TEST_CA_CERT_PATH : undefined,
  ssl_local_cert_path: baseTls.clientCert
    ? constants.TEST_CLIENT_CERT_PATH
    : undefined,
  ssl_private_key_path: baseTls.clientCert
    ? constants.TEST_CLIENT_KEY_PATH
    : undefined,
};

const mainCheckFn = getMainCheckFn(endpoint);

const checkConnection = async (databaseId: string, statusCode = 200) => {
  await validateApiCall({
    endpoint: () =>
      request(server).get(`/${constants.API.DATABASES}/${databaseId}/connect`),
    statusCode,
  });
};

const checkDataManagement = async (databaseId: string) => {
  await validateApiCall({
    endpoint: () =>
      request(server).post(
        `/${constants.API.DATABASES}/${databaseId}/workbench/command-executions`,
      ),
    data: {
      commands: ['set string value'],
    },
    checkFn: ({ body }) => {
      expect(body[0].result).to.deep.eq([
        {
          status: 'success',
          response: 'OK',
        },
      ]);
    },
  });
};

const validateImportedDatabase = async (
  name: string,
  initType: string,
  detectedType: string,
  dataCheck = true,
) => {
  let database = await localDb.getInstanceByName(name);
  expect(database.connectionType).to.eq(initType);
  expect(database.new).to.eq(true);

  await checkConnection(database.id);
  database = await localDb.getInstanceByName(name);

  expect(database.connectionType).to.eq(detectedType);
  expect(database.new).to.eq(false);

  if (dataCheck) {
    await checkDataManagement(database.id);
  }
};

const validatePartialImportedDatabase = async (
  name: string,
  initType: string,
  detectedType: string,
  statusCode = 424,
) => {
  let database = await localDb.getInstanceByName(name);
  expect(database.connectionType).to.eq(initType);
  expect(database.new).to.eq(true);

  await checkConnection(database.id, statusCode);
  database = await localDb.getInstanceByName(name);

  expect(database.connectionType).to.eq(detectedType);
  expect(database.new).to.eq(true);
};

let name;

describe('POST /databases/import', () => {
  beforeEach(() => {
    name = constants.getRandomString();
  });
  describe('Validation', function () {
    generateInvalidDataArray(databaseSchema)
      .map(({ path, value }) => {
        const database = path?.length
          ? set(cloneDeep(validInputData), path, value)
          : value;
        return {
          name: `Should not import when database: ${path.join('.')} = "${value}"`,
          attach: [
            'file',
            Buffer.from(JSON.stringify([database])),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [],
            partial: [],
          },
          checkFn: ({ body }) => {
            expect(body.fail.length).to.eq(1);
            expect(body.fail[0].status).to.eq('fail');
            expect(body.fail[0].index).to.eq(0);
            expect(body.fail[0].errors.length).to.eq(1);
            expect(body.fail[0].errors[0].message).to.be.a('string');
            expect(body.fail[0].errors[0].statusCode).to.eq(400);
            expect(body.fail[0].errors[0].error).to.eq('Bad Request');
            if (body.fail[0].host) {
              expect(body.fail[0].host).to.be.a('string');
            }
            if (body.fail[0].port) {
              expect(body.fail[0].port).to.be.a('number');
            }
          },
        };
      })
      .map(async (testCase) => {
        it(testCase.name, async () => {
          await validateApiCall({
            endpoint,
            ...testCase,
          });
        });
      });

    [
      {
        name: 'Should fail due to file was not provided',
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          message: 'No import file provided',
          error: 'No Database Import File Provided',
        },
      },
      {
        name: 'Should fail due to file size (>10mb)',
        statusCode: 400,
        attach: ['file', randomBytes(11 * 1024 * 1024), 'filename.json'],
        responseBody: {
          statusCode: 400,
          message: 'Import file is too big. Maximum 10mb allowed',
          error: 'Invalid Database Import File',
        },
      },
      {
        name: 'Should fail to incorrect file format',
        statusCode: 400,
        attach: ['file', randomBytes(10), 'filename.json'],
        responseBody: {
          statusCode: 400,
          message: 'Unable to parse filename.json',
          error: 'Unable To Parse Database Import File',
        },
      },
      {
        name: 'Should truncate error message',
        statusCode: 400,
        attach: ['file', randomBytes(10), new Array(10_000).fill(1).join('')],
        responseBody: {
          statusCode: 400,
          message: `Unable to parse ${new Array(50).fill(1).join('')}...`,
          error: 'Unable To Parse Database Import File',
        },
      },
      {
        name: 'Should return 0/0 imported if mandatory field was not defined (host)',
        statusCode: 400,
        attach: ['file', randomBytes(10), new Array(10_000).fill(1).join('')],
        responseBody: {
          statusCode: 400,
          message: `Unable to parse ${new Array(50).fill(1).join('')}...`,
          error: 'Unable To Parse Database Import File',
        },
      },
    ].map(mainCheckFn);
  });
  describe('Certificates', () => {
    describe('CA', () => {
      it('Should create only 1 certificate', async () => {
        const caCertName = constants.getRandomString();

        const caCerts = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();

        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify(
                new Array(10).fill(1).map((c, idx) => {
                  return {
                    ...baseDatabaseData,
                    tls: true,
                    caCert: {
                      name: caCertName,
                      certificate: `-----BEGIN CERTIFICATE-----caCert`,
                    },
                    name,
                  };
                }),
              ),
            ),
            'file.json',
          ],
          responseBody: {
            total: 10,
            success: new Array(10).fill(1).map((_v, index) => ({
              index,
              status: 'success',
              host: importDatabaseFormat0.host,
              port: importDatabaseFormat0.port,
            })),
            partial: [],
            fail: [],
          },
        });

        const caCerts2 = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const diff = _.differenceWith(caCerts2, caCerts, _.isEqual);

        expect(diff.length).to.eq(1);
        expect(diff[0].name).to.eq(caCertName);

        // import more
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify(
                new Array(10).fill(1).map((c, idx) => {
                  return {
                    ...baseDatabaseData,
                    tls: true,
                    caCert: {
                      name: caCertName,
                      certificate: `-----BEGIN CERTIFICATE-----caCert`,
                    },
                    name,
                  };
                }),
              ),
            ),
            'file.json',
          ],
          responseBody: {
            total: 10,
            success: new Array(10).fill(1).map((_v, index) => ({
              index,
              status: 'success',
              host: importDatabaseFormat0.host,
              port: importDatabaseFormat0.port,
            })),
            partial: [],
            fail: [],
          },
        });

        const caCerts3 = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const diff2 = _.differenceWith(caCerts3, caCerts2, _.isEqual);

        expect(diff2.length).to.eq(0);
      });
      it('Should create multiple certs with name prefixes', async () => {
        const caCertName = constants.getRandomString();

        const caCerts = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();

        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify(
                new Array(10).fill(1).map((c, idx) => {
                  return {
                    ...baseDatabaseData,
                    tls: true,
                    caCert: {
                      name: caCertName,
                      certificate: `-----BEGIN CERTIFICATE-----caCert_${idx}`,
                    },
                    name,
                  };
                }),
              ),
            ),
            'file.json',
          ],
          responseBody: {
            total: 10,
            success: new Array(10).fill(1).map((_v, index) => ({
              index,
              status: 'success',
              host: importDatabaseFormat0.host,
              port: importDatabaseFormat0.port,
            })),
            partial: [],
            fail: [],
          },
        });

        const caCerts2 = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const diff = _.differenceWith(caCerts2, caCerts, _.isEqual);

        expect(diff.length).to.eq(10);
        expect(diff[0].name).to.eq(caCertName);
        expect(diff[1].name).to.eq(`1_${caCertName}`);
        expect(diff[2].name).to.eq(`2_${caCertName}`);
        expect(diff[3].name).to.eq(`3_${caCertName}`);
        expect(diff[9].name).to.eq(`9_${caCertName}`);
      });
    });
    describe('CLIENT', () => {
      it('Should create only 1 certificate', async () => {
        const caCertName = constants.getRandomString();
        const clientCertName = constants.getRandomString();

        const caCerts = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const clientCerts = await (
          await localDb.getRepository(
            localDb.repositories.CLIENT_CERT_REPOSITORY,
          )
        ).find();

        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify(
                new Array(10).fill(1).map((c, idx) => {
                  return {
                    ...baseDatabaseData,
                    tls: true,
                    caCert: {
                      name: caCertName,
                      certificate: `-----BEGIN CERTIFICATE-----caCert__`,
                    },
                    clientCert: {
                      name: clientCertName,
                      certificate: `-----BEGIN CERTIFICATE-----clientCert__`,
                      key: `-----BEGIN PRIVATE KEY-----clientKey__`,
                    },
                    name,
                  };
                }),
              ),
            ),
            'file.json',
          ],
          responseBody: {
            total: 10,
            success: new Array(10).fill(1).map((_v, index) => ({
              index,
              status: 'success',
              host: importDatabaseFormat0.host,
              port: importDatabaseFormat0.port,
            })),
            partial: [],
            fail: [],
          },
        });

        const caCerts2 = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const diff = _.differenceWith(caCerts2, caCerts, _.isEqual);
        expect(diff.length).to.eq(1);
        expect(diff[0].name).to.eq(caCertName);

        const clientCerts2 = await (
          await localDb.getRepository(
            localDb.repositories.CLIENT_CERT_REPOSITORY,
          )
        ).find();
        const clientDiff = _.differenceWith(
          clientCerts2,
          clientCerts,
          _.isEqual,
        );
        expect(clientDiff.length).to.eq(1);
        expect(clientDiff[0].name).to.eq(clientCertName);

        // import more
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify(
                new Array(10).fill(1).map((c, idx) => {
                  return {
                    ...baseDatabaseData,
                    tls: true,
                    caCert: {
                      name: caCertName,
                      certificate: `-----BEGIN CERTIFICATE-----caCert__`,
                    },
                    clientCert: {
                      name: clientCertName,
                      certificate: `-----BEGIN CERTIFICATE-----clientCert__`,
                      key: `-----BEGIN PRIVATE KEY-----clientKey__`,
                    },
                    name,
                  };
                }),
              ),
            ),
            'file.json',
          ],
          responseBody: {
            total: 10,
            success: new Array(10).fill(1).map((_v, index) => ({
              index,
              status: 'success',
              host: importDatabaseFormat0.host,
              port: importDatabaseFormat0.port,
            })),
            partial: [],
            fail: [],
          },
        });

        const caCerts3 = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const diff2 = _.differenceWith(caCerts3, caCerts2, _.isEqual);
        expect(diff2.length).to.eq(0);

        const clientCerts3 = await (
          await localDb.getRepository(
            localDb.repositories.CLIENT_CERT_REPOSITORY,
          )
        ).find();
        const clientDiff2 = _.differenceWith(
          clientCerts3,
          clientCerts2,
          _.isEqual,
        );
        expect(clientDiff2.length).to.eq(0);
      });
      it('Should create multiple certs with name prefixes', async () => {
        const caCertName = constants.getRandomString();
        const clientCertName = constants.getRandomString();

        const caCerts = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const clientCerts = await (
          await localDb.getRepository(
            localDb.repositories.CLIENT_CERT_REPOSITORY,
          )
        ).find();

        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify(
                new Array(10).fill(1).map((c, idx) => {
                  return {
                    ...baseDatabaseData,
                    tls: true,
                    caCert: {
                      name: caCertName,
                      certificate: `-----BEGIN CERTIFICATE-----caCert__${idx}`,
                    },
                    clientCert: {
                      name: clientCertName,
                      certificate: `-----BEGIN CERTIFICATE-----clientCert__${idx}`,
                      key: `-----BEGIN PRIVATE KEY-----clientKey__${idx}`,
                    },
                    name,
                  };
                }),
              ),
            ),
            'file.json',
          ],
          responseBody: {
            total: 10,
            success: new Array(10).fill(1).map((_v, index) => ({
              index,
              status: 'success',
              host: importDatabaseFormat0.host,
              port: importDatabaseFormat0.port,
            })),
            partial: [],
            fail: [],
          },
        });

        const caCerts2 = await (
          await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
        ).find();
        const diff = _.differenceWith(caCerts2, caCerts, _.isEqual);
        expect(diff.length).to.eq(10);
        expect(diff[0].name).to.eq(caCertName);
        expect(diff[1].name).to.eq(`1_${caCertName}`);
        expect(diff[2].name).to.eq(`2_${caCertName}`);
        expect(diff[3].name).to.eq(`3_${caCertName}`);
        expect(diff[9].name).to.eq(`9_${caCertName}`);

        const clientCerts2 = await (
          await localDb.getRepository(
            localDb.repositories.CLIENT_CERT_REPOSITORY,
          )
        ).find();
        const clientDiff = _.differenceWith(
          clientCerts2,
          clientCerts,
          _.isEqual,
        );
        expect(clientDiff.length).to.eq(10);
        expect(clientDiff[0].name).to.eq(clientCertName);
        expect(clientDiff[1].name).to.eq(`1_${clientCertName}`);
        expect(clientDiff[2].name).to.eq(`2_${clientCertName}`);
        expect(clientDiff[3].name).to.eq(`3_${clientCertName}`);
        expect(clientDiff[9].name).to.eq(`9_${clientCertName}`);
      });
    });
  });
  describe('STANDALONE', () => {
    requirements('rte.type=STANDALONE', '!rte.ssh');
    describe('NO TLS', function () {
      requirements('!rte.tls');
      it('Import standalone (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone (format 3)', async () => {
        const name = constants.getRandomString();

        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      describe('Oss', () => {
        requirements('!rte.re');
        it('Import standalone with particular db index (format 1)', async () => {
          const name = constants.getRandomString();
          const cliUuid = constants.getRandomString();
          const browserKeyName = constants.getRandomString();
          const cliKeyName = constants.getRandomString();

          await validateApiCall({
            endpoint,
            attach: [
              'file',
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat0,
                    name,
                    db: constants.TEST_REDIS_DB_INDEX,
                  },
                ]),
              ),
              'file.json',
            ],
            responseBody: {
              total: 1,
              success: [
                {
                  index: 0,
                  status: 'success',
                  host: importDatabaseFormat0.host,
                  port: importDatabaseFormat0.port,
                },
              ],
              partial: [],
              fail: [],
            },
          });

          // check connection
          const database = await localDb.getInstanceByName(name);
          await validateApiCall({
            endpoint: () =>
              request(server).get(
                `/${constants.API.DATABASES}/${database.id}/connect`,
              ),
            statusCode: 200,
          });

          // Create string using Browser API to particular db index
          await validateApiCall({
            endpoint: () =>
              request(server).post(
                `/${constants.API.DATABASES}/${database.id}/string`,
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
                `/${constants.API.DATABASES}/${database.id}/cli/${cliUuid}`,
              ),
            statusCode: 200,
          });

          // Create string using CLI API to 0 db index
          await validateApiCall({
            endpoint: () =>
              request(server).post(
                `/${constants.API.DATABASES}/${database.id}/cli/${cliUuid}/send-command`,
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
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Import standalone with CA tls (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA tls partial with wrong body (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  caCert: {
                    ...importDatabaseFormat0.caCert,
                    certificate: 'bad body',
                  },
                  name,
                },
              ]),
            ),
            'file',
          ],
          responseBody: {
            total: 1,
            success: [],
            partial: [
              {
                index: 0,
                status: 'partial',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
                errors: [
                  {
                    message: 'Invalid CA body',
                    statusCode: 400,
                    error: 'Invalid Ca Certificate Body',
                  },
                ],
              },
            ],
            fail: [],
          },
        });

        await validatePartialImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA tls partial with no ca name (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  caCert: {
                    ...importDatabaseFormat0.caCert,
                    name: undefined,
                  },
                  name,
                },
              ]),
            ),
            'file',
          ],
          responseBody: {
            total: 1,
            success: [],
            partial: [
              {
                index: 0,
                status: 'partial',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
                errors: [
                  {
                    message: 'Certificate name is not defined',
                    statusCode: 400,
                    error: 'Invalid Certificate Name',
                  },
                ],
              },
            ],
            fail: [],
          },
        });

        await validatePartialImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA tls (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA tls partial with no ca file (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  caCert: 'not-existing-path',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [],
            partial: [
              {
                index: 0,
                status: 'partial',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
                errors: [
                  {
                    message: 'Invalid CA body',
                    statusCode: 400,
                    error: 'Invalid Ca Certificate Body',
                  },
                ],
              },
            ],
            fail: [],
          },
        });

        await validatePartialImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA tls (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone with CA tls (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
    });
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');
      it('Import standalone with CA + CLIENT tls (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls partial with wrong bodies (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  caCert: {
                    ...importDatabaseFormat0.caCert,
                    certificate: 'bad body',
                  },
                  clientCert: {
                    ...importDatabaseFormat0.clientCert,
                    certificate: 'bad body',
                  },
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [],
            partial: [
              {
                index: 0,
                status: 'partial',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
                errors: [
                  {
                    message: 'Invalid CA body',
                    statusCode: 400,
                    error: 'Invalid Ca Certificate Body',
                  },
                  {
                    message: 'Invalid certificate body',
                    statusCode: 400,
                    error: 'Invalid Client Certificate Body',
                  },
                ],
              },
            ],
            fail: [],
          },
        });

        await validatePartialImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls partial with no cert name (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  caCert: {
                    ...importDatabaseFormat0.caCert,
                    certificate: 'bad body',
                  },
                  clientCert: {
                    ...importDatabaseFormat0.clientCert,
                    name: undefined,
                  },
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [],
            partial: [
              {
                index: 0,
                status: 'partial',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
                errors: [
                  {
                    message: 'Invalid CA body',
                    statusCode: 400,
                    error: 'Invalid Ca Certificate Body',
                  },
                  {
                    message: 'Certificate name is not defined',
                    statusCode: 400,
                    error: 'Invalid Certificate Name',
                  },
                ],
              },
            ],
            fail: [],
          },
        });

        await validatePartialImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls partial with wrong key (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  clientCert: {
                    ...importDatabaseFormat0.clientCert,
                    key: 'bad path',
                  },
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [],
            partial: [
              {
                index: 0,
                status: 'partial',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
                errors: [
                  {
                    message: 'Invalid private key',
                    statusCode: 400,
                    error: 'Invalid Client Private Key',
                  },
                ],
              },
            ],
            fail: [],
          },
        });

        await validatePartialImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
    });
  });
  describe('STANDALONE SSH', () => {
    requirements('rte.type=STANDALONE', 'rte.ssh');
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');
      it('Import standalone with CA + CLIENT tls + ssh basic (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  ...sshBasicData,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PK (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  ...sshPKData,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PKP (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  ...sshPKPData,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh basic (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  ...sshBasicDataFormat1,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PK (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  ...sshPKDataFormat1,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PKP (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  ...sshPKPDataFormat1,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'STANDALONE', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh basic (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    ...sshBasicDataFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PK (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    ...sshPKDataFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PKP (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    ...sshPKPDataFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh basic (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  ...sshBasicDataFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PK (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  ...sshPKDataFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
      it('Import standalone with CA + CLIENT tls + ssh PKP (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  ...sshPKPDataFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'STANDALONE');
      });
    });
  });
  describe('CLUSTER', () => {
    requirements('rte.type=CLUSTER');
    describe('NO TLS', function () {
      requirements('!rte.tls');
      it('Import cluster (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  connectionType: 'CLUSTER',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'CLUSTER', 'CLUSTER');
      });
      it('Import cluster (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  type: 'cluster',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'CLUSTER', 'CLUSTER');
      });
      it('Import cluster (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                    cluster: true,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'CLUSTER', 'CLUSTER');
      });
      it('Import cluster auto discovered (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                    cluster: false,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'CLUSTER');
      });
      it('Import cluster (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'CLUSTER');
      });
    });
    describe('TLS CA', function () {
      requirements('rte.tls', '!rte.tlsAuth');
      it('Import cluster with CA tls (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  connectionType: 'CLUSTER',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'CLUSTER', 'CLUSTER');
      });
      it('Import cluster with CA tls (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  type: 'cluster',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'CLUSTER', 'CLUSTER');
      });
      it('Import cluster with CA tls (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                    cluster: true,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'CLUSTER', 'CLUSTER');
      });
      it('Import cluster with CA tls (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'NOT CONNECTED', 'CLUSTER');
      });
    });
  });
  describe('SENTINEL', () => {
    requirements('rte.type=SENTINEL');
    describe('NO TLS', function () {
      requirements('!rte.tls');
      it('Import sentinel (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  connectionType: 'SENTINEL',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'SENTINEL', 'SENTINEL');
      });
      it('Import sentinel (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  type: 'sentinel',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'SENTINEL', 'SENTINEL');
      });
      it('Import sentinel (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'SENTINEL', 'SENTINEL');
      });
      // Note: disable this test since this export format does not support different passwords
      // for sentinel and for the redis itself
      xit('Import sentinel (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        // should determine connection type as standalone since we don't have sentinel auto discovery
        await validateImportedDatabase(
          name,
          'NOT CONNECTED',
          'STANDALONE',
          false,
        );
      });
    });
    describe('TLS AUTH', function () {
      requirements('rte.tls', 'rte.tlsAuth');
      it('Import sentinel with CA + CLIENT tls (format 0)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat0,
                  connectionType: 'SENTINEL',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat0.host,
                port: importDatabaseFormat0.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'SENTINEL', 'SENTINEL');
      });
      it('Import sentinel with CA + CLIENT tls (format 1)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat1,
                  type: 'sentinel',
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat1.host,
                port: importDatabaseFormat1.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'SENTINEL', 'SENTINEL');
      });
      it('Import sentinel with CA + CLIENT tls (format 2)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              Buffer.from(
                JSON.stringify([
                  {
                    ...importDatabaseFormat2,
                    name,
                  },
                ]),
              ).toString('base64'),
            ),
            'file.ano',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat2.host,
                port: parseInt(importDatabaseFormat2.port, 10),
              },
            ],
            partial: [],
            fail: [],
          },
        });

        await validateImportedDatabase(name, 'SENTINEL', 'SENTINEL');
      });
      it('Import sentinel with CA + CLIENT tls (format 3)', async () => {
        await validateApiCall({
          endpoint,
          attach: [
            'file',
            Buffer.from(
              JSON.stringify([
                {
                  ...importDatabaseFormat3,
                  name,
                },
              ]),
            ),
            'file.json',
          ],
          responseBody: {
            total: 1,
            success: [
              {
                index: 0,
                status: 'success',
                host: importDatabaseFormat3.host,
                port: importDatabaseFormat3.port,
              },
            ],
            partial: [],
            fail: [],
          },
        });

        // should determine connection type as standalone since we don't have sentinel auto discovery
        await validateImportedDatabase(
          name,
          'NOT CONNECTED',
          'STANDALONE',
          false,
        );
      });
    });
  });
});
