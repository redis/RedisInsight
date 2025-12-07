import { v4 as uuidv4 } from 'uuid';
import { pathExists, readFile } from 'fs-extra';
import { Database } from 'src/modules/database/models/database';
import {
  Compressor,
  ConnectionType,
} from 'src/modules/database/entities/database.entity';
import { Logger } from '@nestjs/common';
import { Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';

const logger = new Logger('LocalPreSetupDatabaseDiscoveryService');

const validator = new Validator();

export const scanProcessEnv = (): string[] => {
  const hostEnvs = [];

  Object.entries(process.env).forEach(([env]) => {
    if (env.startsWith('RI_REDIS_HOST') && process.env[env]) {
      hostEnvs.push(env);
    }
  });

  return hostEnvs;
};

/**
 * Explicitly set not defined data to default to be overwritten in database
 * @param database
 */
export const populateDefaultValues = (
  database: Partial<Database>,
): Database => {
  const {
    id = uuidv4(),
    host,
    port = 6379,
    name = `${host}:${port}`,
    db = null,
    provider = null,
    modules = [],
    verifyServerCert = null,
    ssh = null,
    sshOptions = null,
    tls = false,
    tlsServername = null,
    caCert = null,
    clientCert = null,
    nameFromProvider = null,
    username = null,
    password = null,
    compressor = Compressor.NONE,
  } = database;

  return {
    ...database,
    id,
    host,
    port,
    db,
    provider,
    modules,
    verifyServerCert,
    ssh,
    sshOptions,
    tls,
    tlsServername,
    caCert: caCert && {
      ...caCert,
      id: database.id,
      name: `${database.id}_${name}`,
      isPreSetup: true,
    },
    clientCert: clientCert && {
      ...clientCert,
      id: database.id,
      name: `${database.id}_${name}`,
      isPreSetup: true,
    },
    nameFromProvider,
    username,
    password,
    compressor,
    name,
    connectionType: ConnectionType.NOT_CONNECTED,
    isPreSetup: true,
  };
};

export const getCertificateData = async (
  envPrefix: string,
  id: string,
): Promise<string | null> => {
  try {
    const base64 = process.env[`${envPrefix}_BASE64${id}`] || '';

    if (base64) {
      return Buffer.from(base64, 'base64').toString();
    }

    const path = process.env[`${envPrefix}_PATH${id}`] || '';

    if (path) {
      return (await readFile(path, 'utf8')).toString();
    }
  } catch (error) {
    // ignore error
    logger.warn('Unable to get pre setup certificate data', error, {
      envPrefix,
      id,
    });
  }

  return null;
};

export const prepareDatabaseFromEnvs = async (
  hostEnv: string,
): Promise<Database> => {
  try {
    const id = hostEnv.replace(/^RI_REDIS_HOST/, '');

    const databaseToAdd: Partial<Database> = {
      id: id || '0',
      host: process.env[hostEnv],
      port: parseInt(process.env[`RI_REDIS_PORT${id}`], 10) || 6379,
      db: parseInt(process.env[`RI_REDIS_DB${id}`], 10) || 0,
      name: process.env[`RI_REDIS_ALIAS${id}`],
      username: process.env[`RI_REDIS_USERNAME${id}`],
      password: process.env[`RI_REDIS_PASSWORD${id}`],
      tls: process.env[`RI_REDIS_TLS${id}`] === 'true',
      compressor: process.env[`RI_REDIS_COMPRESSOR${id}`] as Compressor,
    };

    // CA certificate
    const tlsCA = await getCertificateData('RI_REDIS_TLS_CA', id);

    if (tlsCA) {
      databaseToAdd.caCert = {
        certificate: tlsCA,
      } as CaCertificate;
    }

    // User certificate
    const tlsCertificate = await getCertificateData('RI_REDIS_TLS_CERT', id);
    const tlsKey = await getCertificateData('RI_REDIS_TLS_KEY', id);

    if (tlsCertificate && tlsKey) {
      databaseToAdd.clientCert = {
        certificate: tlsCertificate,
        key: tlsKey,
      } as ClientCertificate;
      databaseToAdd.verifyServerCert = true;
    }

    const preparedDatabase = populateDefaultValues(databaseToAdd);

    await validator.validateOrReject(
      plainToClass(Database, preparedDatabase, { groups: ['security'] }),
    );

    return preparedDatabase;
  } catch (error) {
    // ignore error
    logger.warn('Unable to prepare pre setup database from env', error, {
      hostEnv,
    });
    return null;
  }
};

export const discoverEnvDatabasesToAdd = async (): Promise<Database[]> => {
  try {
    const hostEnvs = scanProcessEnv();

    return (await Promise.all(hostEnvs.map(prepareDatabaseFromEnvs))).filter(
      (v) => !!v,
    );
  } catch (e) {
    // ignore error
    return [];
  }
};

export const prepareDatabaseFromFile = async (
  database: Database,
): Promise<{}> => {
  try {
    const databaseToAdd = populateDefaultValues(database);

    await validator.validateOrReject(
      plainToClass(Database, databaseToAdd, { groups: ['security'] }),
    );
    return databaseToAdd;
  } catch (error) {
    // ignore error
    logger.warn('Unable to prepare pre setup database from file', error, {
      databaseId: database?.['id'],
    });
    return null;
  }
};

export const discoverFileDatabasesToAdd = async (
  path: string,
): Promise<Database[]> => {
  try {
    if (await pathExists(path)) {
      const fileData = JSON.parse((await readFile(path, 'utf8')).toString());

      return (await Promise.all(fileData.map(prepareDatabaseFromFile))).filter(
        (v) => !!v,
      );
    }
  } catch (error) {
    // ignore error
    logger.warn('Unable to discover pre setup databases from file', error);
  }

  return [];
};
