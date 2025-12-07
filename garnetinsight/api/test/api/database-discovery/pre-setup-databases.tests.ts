import {
  path,
  describe,
  deps,
  Joi,
  expect,
  after,
  before,
  getMainCheckFn,
  fsExtra,
} from '../deps';
import {
  cleanupPreSetupDatabases,
  getRepository,
  initSettings,
  repositories,
  resetSettings,
} from '../../helpers/local-db';
import { Repository } from 'typeorm';
import {
  cleanupTestEnvs,
  mockDatabaseToImportFromEnvsInput,
  mockDatabaseToImportFromEnvsPrepared,
  mockDatabaseToImportFromFileInput,
  mockDatabaseToImportFromFilePrepared,
  mockDatabaseToImportWithCertsFromEnvsInput,
  mockDatabaseToImportWithCertsFromEnvsPrepared,
  mockDatabaseToImportWithCertsFromFileInput,
  mockDatabaseToImportWithCertsFromFilePrepared,
} from 'src/__mocks__';
import { classToClass } from 'src/utils';
import { Database } from 'src/modules/database/models/database';

const { server, request, constants } = deps;

// endpoint to test
const endpoint = () => request(server).patch('/settings');

const responseSchema = Joi.object()
  .keys({
    theme: Joi.string().allow(null).required(),
    scanThreshold: Joi.number().required(),
    batchSize: Joi.number().required(),
    dateFormat: Joi.string().allow(null),
    timezone: Joi.string().allow(null),
    agreements: Joi.object()
      .keys({
        version: Joi.string().required(),
        eula: Joi.bool().required(),
        encryption: Joi.bool(),
      })
      .pattern(/./, Joi.boolean())
      .allow(null)
      .required(),
  })
  .required();

const validInputData = {
  theme: 'DARK',
  scanThreshold: 100000,
  batchSize: 5,
  dateFormat: null,
  timezone: null,
  agreements: {
    eula: true,
    analytics: false,
    encryption: false,
    notifications: false,
  },
};

const mainCheckFn = getMainCheckFn(endpoint);

let databaseRepository: Repository<any>;

describe('Databases discovery', () => {
  let databases = [];
  let preSetupDatabases = [];

  before(async () => {
    databaseRepository = await getRepository(repositories.DATABASE);
    await cleanupPreSetupDatabases();
  });

  beforeEach(async () => {
    const allDatabases = await databaseRepository.find();
    databases = allDatabases.filter((db) => !db.isPreSetup);
    preSetupDatabases = allDatabases.filter((db) => db.isPreSetup);
  });

  afterEach(() => {
    cleanupTestEnvs();
    // remove pre setup databases file
    try {
      fsExtra.unlinkSync(constants.TEST_PRE_SETUP_DATABASES_PATH);
    } catch (e) {
      // ignore error
    }
  });

  after(initSettings);

  describe('settings', () => {
    [
      {
        name: 'Should accept eula and discover env databases',
        before: async () => {
          await resetSettings();
          // no pre setup database before accept eula
          expect(preSetupDatabases.length).deep.eq(0);

          // simple db
          process.env.RI_REDIS_HOST = mockDatabaseToImportFromEnvsInput.host;
          process.env.RI_REDIS_PORT = `${mockDatabaseToImportFromEnvsInput.port}`;
          process.env.RI_REDIS_ALIAS = mockDatabaseToImportFromEnvsInput.name;

          // with base64 certs
          process.env.RI_REDIS_HOST_1 =
            mockDatabaseToImportWithCertsFromEnvsInput.host;
          process.env.RI_REDIS_PORT_1 = `${mockDatabaseToImportWithCertsFromEnvsInput.port}`;
          process.env.RI_REDIS_ALIAS_1 =
            mockDatabaseToImportWithCertsFromEnvsInput.name;
          process.env.RI_REDIS_TLS_1 = 'true';
          process.env.RI_REDIS_TLS_CA_BASE64_1 = Buffer.from(
            mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
            'utf8',
          ).toString('base64');
          process.env.RI_REDIS_TLS_CERT_BASE64_1 = Buffer.from(
            mockDatabaseToImportWithCertsFromEnvsInput.clientCert.certificate,
            'utf8',
          ).toString('base64');
          process.env.RI_REDIS_TLS_KEY_BASE64_1 = Buffer.from(
            mockDatabaseToImportWithCertsFromEnvsInput.clientCert.key,
            'utf8',
          ).toString('base64');
        },
        data: validInputData,
        responseSchema,
        checkFn: async () => {
          const allDatabases = await databaseRepository.find();
          // no other databases affected during discovery
          expect(allDatabases.filter((db) => !db.isPreSetup)).deep.eq(
            databases,
          );

          // verify discovered databases
          const preSetupDatabases = allDatabases
            .filter((db) => db.isPreSetup)
            .map((db) => classToClass(Database, db));
          expect(preSetupDatabases.length).to.eq(2);
          expect(preSetupDatabases[0]).to.deep.include({
            ...mockDatabaseToImportFromEnvsPrepared,
          });
          expect(preSetupDatabases[1]).to.deep.include({
            ...mockDatabaseToImportWithCertsFromEnvsPrepared,
          });
        },
      },
      {
        name: 'Should remove existing pre setup databases when no any config for them was provided',
        before: async () => {
          await resetSettings();
          // 2 previously added databases
          expect(preSetupDatabases.length).deep.eq(2);
        },
        data: validInputData,
        responseSchema,
        checkFn: async () => {
          const allDatabases = await databaseRepository.find();
          // no other databases affected during discovery
          expect(allDatabases.filter((db) => !db.isPreSetup)).deep.eq(
            databases,
          );

          // verify there are no pre setup databases
          expect(allDatabases.filter((db) => db.isPreSetup).length).to.eq(0);
        },
      },
      {
        name: 'Should accept eula and discover env databases (with certs from file)',
        before: async () => {
          await resetSettings();
          // no pre setup database before accept eula
          expect(preSetupDatabases.length).deep.eq(0);

          // simple db with password
          process.env.RI_REDIS_HOST = mockDatabaseToImportFromEnvsInput.host;
          process.env.RI_REDIS_PORT = `${mockDatabaseToImportFromEnvsInput.port}`;
          process.env.RI_REDIS_ALIAS = mockDatabaseToImportFromEnvsInput.name;
          process.env.RI_REDIS_USERNAME = 'admin';
          process.env.RI_REDIS_PASSWORD = 'pass';

          // prepare certs
          const caPath = path.join(constants.TEST_DATA_DIR, 'ca.crt');
          await fsExtra.writeFile(
            caPath,
            Buffer.from(
              mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
              'utf8',
            ),
          );

          const certificatePath = path.join(
            constants.TEST_DATA_DIR,
            'user.crt',
          );
          await fsExtra.writeFile(
            certificatePath,
            Buffer.from(
              mockDatabaseToImportWithCertsFromEnvsInput.clientCert.certificate,
              'utf8',
            ),
          );

          const keyPath = path.join(constants.TEST_DATA_DIR, 'user.key');
          await fsExtra.writeFile(
            keyPath,
            Buffer.from(
              mockDatabaseToImportWithCertsFromEnvsInput.clientCert.key,
              'utf8',
            ),
          );

          // with path certs
          process.env.RI_REDIS_HOST_1 =
            mockDatabaseToImportWithCertsFromEnvsInput.host;
          process.env.RI_REDIS_PORT_1 = `${mockDatabaseToImportWithCertsFromEnvsInput.port}`;
          process.env.RI_REDIS_ALIAS_1 =
            mockDatabaseToImportWithCertsFromEnvsInput.name;
          process.env.RI_REDIS_TLS_1 = 'true';
          process.env.RI_REDIS_TLS_CA_PATH_1 = caPath;
          process.env.RI_REDIS_TLS_CERT_PATH_1 = certificatePath;
          process.env.RI_REDIS_TLS_KEY_PATH_1 = keyPath;
        },
        data: validInputData,
        responseSchema,
        checkFn: async () => {
          const allDatabases = await databaseRepository.find();

          // no other databases affected during discovery
          expect(allDatabases.filter((db) => !db.isPreSetup)).deep.eq(
            databases,
          );

          // verify discovered databases
          const preSetupDatabases = allDatabases
            .filter((db) => db.isPreSetup)
            .map((db) => classToClass(Database, db));
          expect(preSetupDatabases.length).to.eq(2);
          expect(preSetupDatabases[0]).to.deep.include({
            ...mockDatabaseToImportFromEnvsPrepared,
            password: 'pass',
            username: 'admin',
          });
          expect(preSetupDatabases[1]).to.deep.include({
            ...mockDatabaseToImportWithCertsFromEnvsPrepared,
          });
        },
      },
      {
        name: 'Should not run database discovery (remove existing pre setup dbs) since we had eula before',
        before: async () => {
          // 2 previously added databases
          expect(preSetupDatabases.length).deep.eq(2);
        },
        data: validInputData,
        responseSchema,
        checkFn: async () => {
          const allDatabases = await databaseRepository.find();
          // no other databases affected during discovery
          expect(allDatabases.filter((db) => !db.isPreSetup)).deep.eq(
            databases,
          );

          // verify there are no pre setup databases
          expect(allDatabases.filter((db) => db.isPreSetup).length).to.eq(2);
        },
      },
      {
        name: 'Should accept eula and discover databases from json and remove discovered databases from envs',
        before: async () => {
          await resetSettings();
          // 2 pre setup database before accept eula
          expect(preSetupDatabases.length).deep.eq(2);

          // prepare databases json
          const databasesFilePath = path.join(
            constants.TEST_PRE_SETUP_DATABASES_PATH,
          );
          await fsExtra.writeFile(
            databasesFilePath,
            JSON.stringify([
              mockDatabaseToImportFromFileInput,
              mockDatabaseToImportWithCertsFromFileInput,
            ]),
          );
        },
        data: validInputData,
        responseSchema,
        checkFn: async () => {
          const allDatabases = await databaseRepository.find();

          // no other databases affected during discovery
          expect(allDatabases.filter((db) => !db.isPreSetup)).deep.eq(
            databases,
          );

          // verify discovered databases
          const preSetupDatabases = allDatabases
            .filter((db) => db.isPreSetup)
            .map((db) => classToClass(Database, db));
          expect(preSetupDatabases.length).to.eq(2);
          expect(preSetupDatabases[0]).to.deep.include({
            ...mockDatabaseToImportFromFilePrepared,
          });
          expect(preSetupDatabases[1]).to.deep.include({
            ...mockDatabaseToImportWithCertsFromFilePrepared,
          });
        },
      },
    ].forEach(mainCheckFn);
  });
});
