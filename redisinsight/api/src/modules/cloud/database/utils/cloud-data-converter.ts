import { find, get, isArray } from 'lodash';
import { plainToInstance } from 'class-transformer';
import {
  CloudDatabase,
  CloudDatabaseMemoryStorage,
  CloudDatabasePersistencePolicy,
  CloudDatabaseProtocol,
  ICloudCapiDatabase,
  ICloudCapiSubscriptionDatabases,
  ICloudCapiDatabaseTag,
} from 'src/modules/cloud/database/models';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { REDIS_CLOUD_MODULES_NAMES } from 'src/constants';
import { Tag } from 'src/modules/tag/models/tag';

export function convertRedisCloudModuleName(name: string): string {
  return REDIS_CLOUD_MODULES_NAMES[name] ?? name;
}

export const parseCloudDatabaseCapiResponse = (
  database: ICloudCapiDatabase,
  tags: ICloudCapiDatabaseTag[],
  subscriptionId: number,
  subscriptionType: CloudSubscriptionType,
  free?: boolean,
): CloudDatabase => {
  const {
    databaseId,
    name,
    publicEndpoint,
    status,
    security,
    planMemoryLimit,
    memoryLimitMeasurementUnit,
  } = database;

  return plainToInstance(
    CloudDatabase,
    {
      subscriptionId,
      subscriptionType,
      databaseId,
      name,
      publicEndpoint,
      status,
      password: security?.password,
      sslClientAuthentication: security.sslClientAuthentication,
      modules: database.modules.map((module) =>
        convertRedisCloudModuleName(module.name),
      ),
      options: {
        enabledDataPersistence:
          database.dataPersistence !== CloudDatabasePersistencePolicy.None,
        persistencePolicy: database.dataPersistence,
        enabledRedisFlash:
          database.memoryStorage === CloudDatabaseMemoryStorage.RamAndFlash,
        enabledReplication: database.replication,
        enabledBackup: !!database.periodicBackupPath,
        enabledClustering: database.clustering.numberOfShards > 1,
        isReplicaDestination: !!database.replicaOf,
      },
      tags: tags.map((tag) => plainToInstance(Tag, tag)),
      cloudDetails: {
        cloudId: databaseId,
        subscriptionId,
        subscriptionType,
        planMemoryLimit,
        memoryLimitMeasurementUnit,
        free,
      },
    },
    { groups: ['security'] },
  );
};

export const findReplicasForDatabase = (
  databases: any[],
  sourceDatabaseId: number,
): any[] => {
  const sourceDatabase = find(databases, {
    databaseId: sourceDatabaseId,
  });
  if (!sourceDatabase) {
    return [];
  }
  return databases.filter((replica): boolean => {
    const endpoints = get(replica, ['replicaOf', 'endpoints']);
    if (
      replica.databaseId === sourceDatabaseId ||
      !endpoints ||
      !endpoints.length
    ) {
      return false;
    }
    return endpoints.some(
      (endpoint: string): boolean =>
        endpoint.includes(sourceDatabase.publicEndpoint) ||
        endpoint.includes(sourceDatabase.privateEndpoint),
    );
  });
};

export const parseCloudDatabasesCapiResponse = (
  response: ICloudCapiSubscriptionDatabases,
  subscriptionType: CloudSubscriptionType,
  free?: boolean,
): CloudDatabase[] => {
  const subscription = isArray(response.subscription)
    ? response.subscription[0]
    : response.subscription;

  const { subscriptionId, databases } = subscription;

  let result: CloudDatabase[] = [];
  databases.forEach((database): void => {
    // We do not send the databases which have 'memcached' as their protocol.
    if (
      [CloudDatabaseProtocol.Redis, CloudDatabaseProtocol.Stack].includes(
        database.protocol,
      )
    ) {
      result.push(
        parseCloudDatabaseCapiResponse(
          database,
          [],
          subscriptionId,
          subscriptionType,
          free,
        ),
      );
    }
  });
  result = result.map((database) => ({
    ...database,
    subscriptionType,
    options: {
      ...database.options,
      isReplicaSource: !!findReplicasForDatabase(databases, database.databaseId)
        .length,
    },
  }));
  return result;
};
