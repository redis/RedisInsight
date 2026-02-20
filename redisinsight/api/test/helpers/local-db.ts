import { Connection, createConnection, getConnectionManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { constants } from './constants';
import { createCipheriv, createDecipheriv, createHash } from 'crypto';
import { TagEntity } from 'src/modules/tag/entities/tag.entity';
import { queryLibraryEntityFactory } from 'src/modules/query-library/__tests__/query-library.factory';

export const repositories = {
  DATABASE: 'DatabaseEntity',
  TAG: 'TagEntity',
  CA_CERT_REPOSITORY: 'CaCertificateEntity',
  CLIENT_CERT_REPOSITORY: 'ClientCertificateEntity',
  SSH_OPTIONS_REPOSITORY: 'SshOptionsEntity',
  AGREEMENTS: 'AgreementsEntity',
  COMMAND_EXECUTION: 'CommandExecutionEntity',
  PLUGIN_STATE: 'PluginStateEntity',
  SETTINGS: 'SettingsEntity',
  NOTIFICATION: 'NotificationEntity',
  DATABASE_ANALYSIS: 'DatabaseAnalysisEntity',
  DATABASE_RECOMMENDATION: 'DatabaseRecommendationEntity',
  BROWSER_HISTORY: 'BrowserHistoryEntity',
  CUSTOM_TUTORIAL: 'CustomTutorialEntity',
  FEATURES_CONFIG: 'FeaturesConfigEntity',
  FEATURE: 'FeatureEntity',
  CLOUD_DATABASE_DETAILS: 'CloudDatabaseDetailsEntity',
  RDI: 'RdiEntity',
  QUERY_LIBRARY: 'QueryLibraryEntity',
};

let localDbConnection;
const getDBConnection = async (): Promise<Connection> => {
  if (!localDbConnection) {
    const dbFile = constants.TEST_LOCAL_DB_FILE_PATH;
    localDbConnection = await createConnection({
      name: 'integrationtests',
      type: 'sqlite',
      database: dbFile,
      entities: [`./../**/*.entity.ts`],
      synchronize: false,
      migrationsRun: false,
    }).catch((err) => {
      if (err.name === 'AlreadyHasActiveConnectionError') {
        return getConnectionManager().get('default');
      }
      throw err;
    });
  }

  return localDbConnection;
};

export const getRepository = async (repository: string) => {
  return (await getDBConnection()).getRepository(repository);
};

export const encryptData = (data) => {
  if (!data) {
    return null;
  }

  if (constants.TEST_ENCRYPTION_STRATEGY === 'KEYTAR') {
    let cipherKey = createHash('sha256')
      .update(constants.TEST_KEYTAR_PASSWORD, 'utf8') // lgtm[js/insufficient-password-hash]
      .digest();
    const cipher = createCipheriv(
      'aes-256-cbc',
      cipherKey,
      Buffer.alloc(16, 0),
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  return data;
};

export const decryptData = (data) => {
  if (!data) {
    return null;
  }

  if (constants.TEST_ENCRYPTION_STRATEGY === 'KEYTAR') {
    let cipherKey = createHash('sha256')
      .update(constants.TEST_KEYTAR_PASSWORD, 'utf8') // lgtm[js/insufficient-password-hash]
      .digest();

    const decipher = createDecipheriv(
      'aes-256-cbc',
      cipherKey,
      Buffer.alloc(16, 0),
    );
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  return data;
};

export const generateNCommandExecutions = async (
  partial: Record<string, any>,
  number: number,
  truncate: boolean = false,
) => {
  const result = [];
  const rep = await getRepository(repositories.COMMAND_EXECUTION);

  if (truncate) {
    await rep.clear();
  }

  for (let i = 0; i < number; i++) {
    result.push(
      await rep.save({
        id: uuidv4(),
        command: encryptData('set foo bar'),
        result: encryptData(
          JSON.stringify([
            {
              status: 'success',
              response: `"OK_${i}"`,
            },
          ]),
        ),
        nodeOptions: null,
        role: null,
        mode: 'ASCII',
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        executionTime: Math.round(Math.random() * 10000),
        createdAt: new Date(),
        ...partial,
      }),
    );
  }

  return result;
};

export const generateNDatabaseAnalysis = async (
  partial: Record<string, any>,
  number: number,
  truncate: boolean = false,
) => {
  const result = [];
  const rep = await getRepository(repositories.DATABASE_ANALYSIS);

  if (truncate) {
    await rep.clear();
  }

  for (let i = 0; i < number; i++) {
    result.push(
      await rep.save({
        id: uuidv4(),
        databaseId: uuidv4(),
        db: constants.TEST_DATABASE_ANALYSIS_DB_1,
        delimiter: constants.TEST_DATABASE_ANALYSIS_DELIMITER_1,
        filter: encryptData(
          JSON.stringify(constants.TEST_DATABASE_ANALYSIS_FILTER_1),
        ),
        progress: encryptData(
          JSON.stringify(constants.TEST_DATABASE_ANALYSIS_PROGRESS_1),
        ),
        totalKeys: encryptData(
          JSON.stringify(constants.TEST_DATABASE_ANALYSIS_TOTAL_KEYS_1),
        ),
        totalMemory: encryptData(
          JSON.stringify(constants.TEST_DATABASE_ANALYSIS_TOTAL_MEMORY_1),
        ),
        topKeysNsp: encryptData(
          JSON.stringify([
            {
              ...constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_NSP_1,
              nsp: Buffer.from(
                constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_NSP_1.nsp,
              ),
            },
          ]),
        ),
        topMemoryNsp: encryptData(
          JSON.stringify([
            {
              ...constants.TEST_DATABASE_ANALYSIS_TOP_MEMORY_NSP_1,
              nsp: Buffer.from(
                constants.TEST_DATABASE_ANALYSIS_TOP_MEMORY_NSP_1.nsp,
              ),
            },
          ]),
        ),
        topKeysLength: encryptData(
          JSON.stringify([
            {
              ...constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1,
              name: Buffer.from(
                constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1.name,
              ),
            },
          ]),
        ),
        topKeysMemory: encryptData(
          JSON.stringify([
            {
              ...constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1,
              name: Buffer.from(
                constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1.name,
              ),
            },
          ]),
        ),
        expirationGroups: encryptData(
          JSON.stringify([constants.TEST_DATABASE_ANALYSIS_EXPIRATION_GROUP_1]),
        ),
        recommendations: encryptData(
          JSON.stringify([constants.TEST_LUA_DATABASE_ANALYSIS_RECOMMENDATION]),
        ),
        createdAt: new Date(),
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        ...partial,
      }),
    );
  }

  return result;
};

export const generatePluginState = async (
  partial: Record<string, any>,
  truncate: boolean = false,
) => {
  const rep = await getRepository(repositories.PLUGIN_STATE);

  if (truncate) {
    await rep.clear();
  }

  return rep.save({
    id: uuidv4(),
    state: encryptData(JSON.stringify('some state')),
    encryption: constants.TEST_ENCRYPTION_STRATEGY,
    createdAt: new Date(),
    ...partial,
  });
};

export const generateRdis = async (
  partial: Record<string, any>,
  number: number = 2,
  truncate: boolean = false,
) => {
  const result = [];
  const rep = await getRepository(repositories.RDI);

  if (truncate) {
    await rep.clear();
  }

  for (let i = 0; i < number; i++) {
    result.push(
      await rep.save({
        id: uuidv4(),
        url: 'http://localhost:4000',
        name: 'Rdi',
        username: 'Rdi Username',
        password: encryptData(constants.TEST_KEYTAR_PASSWORD),
        lastConnection: new Date(),
        version: '1.2',
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        ...partial,
      }),
    );
  }

  return result;
};

export const getRdiById = async (id: string) => {
  const rep = await getRepository(repositories.RDI);
  return rep.findOneBy({ id });
};

export const generateBrowserHistory = async (
  partial: Record<string, any>,
  number: number,
  truncate: boolean = false,
) => {
  const result = [];
  const rep = await getRepository(repositories.BROWSER_HISTORY);

  if (truncate) {
    await rep.clear();
  }

  result.push(
    await rep.save({
      id: constants.TEST_BROWSER_HISTORY_ID_1,
      databaseId: constants.TEST_BROWSER_HISTORY_DATABASE_ID,
      filter: encryptData(
        JSON.stringify(constants.TEST_BROWSER_HISTORY_FILTER_1),
      ),
      createdAt: new Date(),
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      ...partial,
    }),
  );

  result.push(
    await rep.save({
      id: constants.TEST_BROWSER_HISTORY_ID_2,
      databaseId: constants.TEST_BROWSER_HISTORY_DATABASE_ID,
      filter: encryptData(
        JSON.stringify(constants.TEST_BROWSER_HISTORY_FILTER_2),
      ),
      createdAt: new Date(),
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      ...partial,
    }),
  );

  for (let i = result.length; i < number; i++) {
    result.push(
      await rep.save({
        id: uuidv4(),
        databaseId: uuidv4(),
        filter: encryptData(
          JSON.stringify(constants.TEST_BROWSER_HISTORY_FILTER_1),
        ),
        createdAt: new Date(),
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        ...partial,
      }),
    );
  }

  return result;
};

export const generateDatabaseRecommendations = async (
  partial: Record<string, any>,
  truncate: boolean = false,
) => {
  const result = [];
  const rep = await getRepository(repositories.DATABASE_RECOMMENDATION);

  if (truncate) {
    await rep.clear();
  }

  result.push(
    await rep.save({
      id: constants.TEST_RECOMMENDATION_ID_1,
      databaseId: constants.TEST_RECOMMENDATIONS_DATABASE_ID,
      name: constants.TEST_RECOMMENDATION_NAME_1,
      createdAt: new Date(),
      read: false,
      vote: null,
      ...partial,
    }),
  );

  result.push(
    await rep.save({
      id: constants.TEST_RECOMMENDATION_ID_2,
      databaseId: constants.TEST_RECOMMENDATIONS_DATABASE_ID,
      name: constants.TEST_RECOMMENDATION_NAME_2,
      createdAt: new Date(),
      read: false,
      vote: null,
      ...partial,
    }),
  );

  result.push(
    await rep.save({
      id: constants.TEST_RECOMMENDATION_ID_3,
      databaseId: constants.TEST_RECOMMENDATIONS_DATABASE_ID,
      name: constants.TEST_RECOMMENDATION_NAME_3,
      createdAt: new Date(),
      read: false,
      db: 3,
      vote: null,
      ...partial,
    }),
  );

  return result;
};

const createCACertificate = async (certificate) => {
  const rep = await getRepository(repositories.CA_CERT_REPOSITORY);
  return rep.save(certificate);
};

const createClientCertificate = async (certificate) => {
  const rep = await getRepository(repositories.CLIENT_CERT_REPOSITORY);
  return rep.save(certificate);
};

/**
 * Remove all pre setup databases and certificates
 */
export const cleanupPreSetupDatabases = async () => {
  const databaseRepository = await getRepository(repositories.DATABASE);
  await databaseRepository
    .createQueryBuilder()
    .delete()
    .where({ isPreSetup: true })
    .execute();

  const caCertificateRepository = await getRepository(
    repositories.CA_CERT_REPOSITORY,
  );
  await caCertificateRepository
    .createQueryBuilder()
    .delete()
    .where({ isPreSetup: true })
    .execute();

  const clientCertificateRepository = await getRepository(
    repositories.CLIENT_CERT_REPOSITORY,
  );
  await clientCertificateRepository
    .createQueryBuilder()
    .delete()
    .where({ isPreSetup: true })
    .execute();
};

export const createTestDbInstance = async (
  rte,
  server,
  data: any = {},
): Promise<void> => {
  const rep = await getRepository(repositories.DATABASE);

  const instance: any = {
    id: constants.TEST_INSTANCE_ID,
    name: constants.TEST_INSTANCE_NAME,
    host: constants.TEST_REDIS_HOST,
    port: constants.TEST_REDIS_PORT,
    username: constants.TEST_REDIS_USER,
    password: encryptData(constants.TEST_REDIS_PASSWORD),
    encryption: constants.TEST_ENCRYPTION_STRATEGY,
    tls: false,
    verifyServerCert: false,
    connectionType: rte.env.type,
  };

  if (rte.env.type === constants.CLUSTER) {
    instance.nodes = JSON.stringify(rte.env.nodes);
  }

  if (rte.env.type === constants.SENTINEL) {
    instance.nodes = JSON.stringify([
      {
        host: constants.TEST_REDIS_HOST,
        port: constants.TEST_REDIS_PORT,
      },
    ]);
    instance.sentinelMasterName = constants.TEST_SENTINEL_MASTER_GROUP;
    instance.sentinelMasterUsername = constants.TEST_SENTINEL_MASTER_USER;
    instance.sentinelMasterPassword = encryptData(
      constants.TEST_SENTINEL_MASTER_PASS,
    );
  }

  if (constants.TEST_REDIS_TLS_CA) {
    instance.tls = true;
    instance.verifyServerCert = true;
    instance.caCert = await createCACertificate({
      id: constants.TEST_CA_ID,
      name: constants.TEST_CA_NAME,
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      certificate: encryptData(constants.TEST_REDIS_TLS_CA),
    });

    if (constants.TEST_USER_TLS_CERT && constants.TEST_USER_TLS_CERT) {
      instance.clientCert = await createClientCertificate({
        id: constants.TEST_USER_CERT_ID,
        name: constants.TEST_USER_CERT_NAME,
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        certificate: encryptData(constants.TEST_USER_TLS_CERT),
        key: encryptData(constants.TEST_USER_TLS_KEY),
      });
    }
  }

  if (constants.TEST_SSH_USER) {
    instance.ssh = true;
    instance.sshOptions = {
      host: constants.TEST_SSH_HOST,
      port: constants.TEST_SSH_PORT,
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      username: encryptData(constants.TEST_SSH_USER),
      privateKey: encryptData(constants.TEST_SSH_PRIVATE_KEY_P),
      passphrase: encryptData(constants.TEST_SSH_PASSPHRASE),
    };
  }
  await rep.save({ ...instance, ...data });
};

export const createDatabaseInstances = async () => {
  const rep = await getRepository(repositories.DATABASE);
  const instances = [
    {
      id: constants.TEST_INSTANCE_ID_2,
      name: constants.TEST_INSTANCE_NAME_2,
      host: constants.TEST_INSTANCE_HOST_2,
      db: constants.TEST_REDIS_DB_INDEX,
      timeout: 30000,
    },
    {
      id: constants.TEST_INSTANCE_ID_3,
      name: constants.TEST_INSTANCE_NAME_3,
      host: constants.TEST_INSTANCE_HOST_3,
      timeout: 30000,
    },
    {
      id: constants.TEST_INSTANCE_ID_4,
      name: constants.TEST_INSTANCE_NAME_4,
      host: constants.TEST_INSTANCE_HOST_4,
      port: constants.TEST_INSTANCE_PORT_4,
      timeout: 30000,
    },
  ];

  for (let instance of instances) {
    // await rep.remove(instance);
    await rep.save({
      tls: false,
      verifyServerCert: false,
      host: 'localhost',
      port: 3679,
      connectionType: 'STANDALONE',
      ...instance,
      modules: '[]',
      version: '7.0',
    });
  }
};

const encryptTags = (tags: TagEntity[]) =>
  tags.map(
    ({ key, value, ...rest }) =>
      ({
        key: encryptData(key),
        value: encryptData(value),
        ...rest,
      }) as TagEntity,
  );

const decryptTags = (tags: TagEntity[]) =>
  tags.map(
    ({ key, value, ...rest }) =>
      ({
        key: decryptData(key),
        value: decryptData(value),
        ...rest,
      }) as TagEntity,
  );

export const getAllTags = async () => {
  const rep = await getRepository(repositories.TAG);
  const tags = (await rep.find()) as TagEntity[];
  const decryptedTags = decryptTags(tags);

  return decryptedTags;
};

export const initTags = async () => {
  const rep = await getRepository(repositories.TAG);

  await rep.createQueryBuilder().delete().execute();
};

export const createInstancesWithTags = async () => {
  await initTags();

  const rep = await getRepository(repositories.DATABASE);
  const instances = [
    {
      id: constants.TEST_INSTANCE_ID_6,
      name: constants.TEST_INSTANCE_NAME_6,
      host: constants.TEST_INSTANCE_HOST_6,
      db: constants.TEST_REDIS_DB_INDEX,
      tags: encryptTags([constants.TEST_TAGS[0], constants.TEST_TAGS[2]]),
      timeout: 30000,
    },
    {
      id: constants.TEST_INSTANCE_ID_7,
      name: constants.TEST_INSTANCE_NAME_7,
      host: constants.TEST_INSTANCE_HOST_7,
      tags: encryptTags([constants.TEST_TAGS[1]]),
      timeout: 30000,
    },
  ];

  for (let instance of instances) {
    await rep.save({
      tls: false,
      verifyServerCert: false,
      host: 'localhost',
      port: 3679,
      connectionType: 'STANDALONE',
      ...instance,
      modules: '[]',
      version: '7.0',
    });
  }
};

export const createIncorrectDatabaseInstances = async () => {
  const rep = await getRepository(repositories.DATABASE);

  await rep.save({
    tls: false,
    verifyServerCert: false,
    host: constants.TEST_INSTANCE_HOST_5,
    port: constants.TEST_INSTANCE_PORT_5,
    connectionType: 'STANDALONE',
    id: constants.TEST_INSTANCE_ID_5,
    name: constants.TEST_INSTANCE_ID_5,
    password: constants.TEST_INCORRECT_PASSWORD,
    modules: '[]',
    version: '7.0',
    timeout: 30000,
  });
};

export const createAclInstance = async (rte, _server): Promise<void> => {
  const rep = await getRepository(repositories.DATABASE);
  const instance: any = {
    id: constants.TEST_INSTANCE_ACL_ID,
    name: constants.TEST_INSTANCE_ACL_NAME,
    host: constants.TEST_REDIS_HOST,
    port: constants.TEST_REDIS_PORT,
    username: constants.TEST_INSTANCE_ACL_USER,
    password: encryptData(constants.TEST_INSTANCE_ACL_PASS),
    encryption: constants.TEST_ENCRYPTION_STRATEGY,
    tls: false,
    verifyServerCert: false,
    connectionType: rte.env.type,
    timeout: 30000,
  };

  if (rte.env.type === constants.CLUSTER) {
    instance.nodes = JSON.stringify(rte.env.nodes);
  }

  if (rte.env.type === constants.SENTINEL) {
    instance.nodes = JSON.stringify([
      {
        host: constants.TEST_REDIS_HOST,
        port: constants.TEST_REDIS_PORT,
      },
    ]);
    instance.username = constants.TEST_REDIS_USER;
    instance.password = encryptData(constants.TEST_REDIS_PASSWORD);
    instance.sentinelMasterName = constants.TEST_SENTINEL_MASTER_GROUP;
    instance.sentinelMasterUsername = constants.TEST_INSTANCE_ACL_USER;
    instance.sentinelMasterPassword = encryptData(
      constants.TEST_INSTANCE_ACL_PASS,
    );
  }

  if (constants.TEST_REDIS_TLS_CA) {
    instance.tls = true;
    instance.verifyServerCert = true;
    instance.caCert = await createCACertificate({
      id: constants.TEST_CA_ID,
      name: constants.TEST_CA_NAME,
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      certificate: encryptData(constants.TEST_REDIS_TLS_CA),
    });

    if (constants.TEST_USER_TLS_CERT && constants.TEST_USER_TLS_CERT) {
      instance.clientCert = await createClientCertificate({
        id: constants.TEST_USER_CERT_ID,
        name: constants.TEST_USER_CERT_NAME,
        certFilename: constants.TEST_USER_CERT_FILENAME,
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        certificate: encryptData(constants.TEST_USER_TLS_CERT),
        key: encryptData(constants.TEST_USER_TLS_KEY),
      });
    }
  }

  if (constants.TEST_SSH_USER) {
    instance.ssh = true;
    instance.sshOptions = {
      host: constants.TEST_SSH_HOST,
      port: constants.TEST_SSH_PORT,
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      username: encryptData(constants.TEST_SSH_USER),
      privateKey: encryptData(constants.TEST_SSH_PRIVATE_KEY),
    };
  }

  await rep.save(instance);
};

export const getInstanceByName = async (name: string) => {
  const rep = await getRepository(repositories.DATABASE);
  return rep.findOneBy({ name });
};

export const getInstanceById = async (id: string) => {
  const rep = await getRepository(repositories.DATABASE);
  const instance = await rep.findOneBy({ id });

  if (instance?.tags) {
    instance.tags = decryptTags(instance.tags);
  }

  return instance;
};

export const getBrowserHistoryById = async (id: string) => {
  const rep = await getRepository(repositories.BROWSER_HISTORY);
  return rep.findOneBy({ id });
};

export const applyEulaAgreement = async () => {
  const rep = await getRepository(repositories.AGREEMENTS);
  const agreements: any = await rep.findOneBy({});
  agreements.version = '1.0.0';
  agreements.data = JSON.stringify({ eula: true, encryption: true });

  await rep.save(agreements);
};

export const setAgreements = async (agreements = {}) => {
  const defaultAgreements = { eula: true, encryption: true };

  const rep = await getRepository(repositories.AGREEMENTS);
  const entity: any = await rep.findOneBy({});

  entity.version = '1.0.0';
  entity.data = JSON.stringify({ ...defaultAgreements, ...agreements });

  await rep.save(entity);
};

const resetAgreements = async () => {
  const rep = await getRepository(repositories.AGREEMENTS);
  const agreements: any = await rep.findOneBy({});
  agreements.version = null;
  agreements.data = null;

  await rep.save(agreements);
};

export const initAgreements = async () => {
  const rep = await getRepository(repositories.AGREEMENTS);
  const agreements: any = await rep.findOneBy({});
  agreements.version = constants.TEST_AGREEMENTS_VERSION;
  agreements.data = JSON.stringify({
    eula: true,
    encryption: constants.TEST_ENCRYPTION_STRATEGY === 'KEYTAR',
    analytics: true,
    notifications: true,
  });

  await rep.save(agreements);
};

export const resetSettings = async () => {
  await resetAgreements();
  const rep = await getRepository(repositories.SETTINGS);
  const settings: any = await rep.findOneBy({});
  settings.data = null;

  await rep.save(settings);
};

export const enableAllDbFeatures = async () => {
  const rep = await getRepository(repositories.FEATURE);
  await rep.deleteAll();
  await rep.insert([{ name: 'insightsRecommendations', flag: true }]);
};

export const initSettings = async () => {
  await initAgreements();
  const rep = await getRepository(repositories.SETTINGS);
  const settings: any = await rep.findOneBy({});
  settings.data = null;

  await rep.save(settings);
};

export const setAppSettings = async (data: object) => {
  const rep = await getRepository(repositories.SETTINGS);
  const settings: any = await rep.findOneBy({});
  settings.data = JSON.stringify({
    ...JSON.parse(settings.data),
    ...data,
  });
  await rep.save(settings);
};

const truncateAll = async () => {
  await (await getRepository(repositories.QUERY_LIBRARY)).clear();
  await (await getRepository(repositories.TAG)).clear();
  await (await getRepository(repositories.DATABASE)).clear();
  await (await getRepository(repositories.FEATURE)).clear();
  await (await getRepository(repositories.FEATURES_CONFIG)).clear();
  await (await getRepository(repositories.CA_CERT_REPOSITORY)).clear();
  await (await getRepository(repositories.CLIENT_CERT_REPOSITORY)).clear();
  await (await getRepository(repositories.CUSTOM_TUTORIAL)).clear();
  await await resetSettings();
};

export const initLocalDb = async (rte, server) => {
  await truncateAll();
  await createTestDbInstance(rte, server);
  await initAgreements();
  if (rte.env.acl) {
    await createAclInstance(rte, server);
  }
};

export const createNotifications = async (
  notifications: object[],
  truncate: boolean,
) => {
  const rep = await getRepository(repositories.NOTIFICATION);

  if (truncate) {
    await rep.createQueryBuilder().delete().execute();
  }

  await rep.insert(notifications);
};

export const createDefaultNotifications = async (truncate: boolean = false) => {
  const notifications = [
    constants.TEST_NOTIFICATION_1,
    constants.TEST_NOTIFICATION_2,
    constants.TEST_NOTIFICATION_3,
  ];

  await createNotifications(notifications, truncate);
};

export const createNotExistingNotifications = async (
  truncate: boolean = false,
) => {
  const notifications = [
    constants.TEST_NOTIFICATION_NE_1,
    constants.TEST_NOTIFICATION_NE_2,
    constants.TEST_NOTIFICATION_NE_3,
  ];

  await createNotifications(notifications, truncate);
};

export const generateNQueryLibraryItems = async (
  partial: Record<string, any>,
  number: number,
  truncate: boolean = false,
) => {
  const result = [];
  const rep = await getRepository(repositories.QUERY_LIBRARY);

  if (truncate) {
    await rep.clear();
  }

  for (let i = 0; i < number; i++) {
    const entity = queryLibraryEntityFactory.build(partial);

    result.push(
      await rep.save({
        ...entity,
        description: encryptData(entity.description),
        query: encryptData(entity.query),
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
      }),
    );
  }

  return result;
};
