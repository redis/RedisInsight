import {
  CloudDatabaseProtocol,
  CloudDatabaseStatus,
} from 'src/modules/cloud/database/models';

interface ICloudCapiDatabaseAlert {
  name: string;
  value: number;
}

interface ICloudCapiDatabaseClustering {
  numberOfShards: number;
  regexRules: any[];
  hashingPolicy: string;
}

export interface ICloudCapiDatabaseModule {
  id: number;
  name: string;
  version: string;
  description?: string;
  parameters?: any[];
}

interface ICloudCapiDatabaseSecurity {
  password?: string;
  sslClientAuthentication: boolean;
  sourceIps: string[];
}

export interface ICloudCapiDatabaseTag {
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  links: string[];
}

export interface ICloudCapiDatabase {
  databaseId: number;
  name: string;
  protocol: CloudDatabaseProtocol;
  provider: string;
  region: string;
  redisVersionCompliance: string;
  status: CloudDatabaseStatus;
  memoryLimitInGb: number;
  memoryUsedInMb: number;
  memoryStorage: string;
  supportOSSClusterApi: boolean;
  dataPersistence: string;
  replication: boolean;
  periodicBackupPath?: string;
  dataEvictionPolicy: string;
  throughputMeasurement: {
    by: string;
    value: number;
  };
  activatedOn: string;
  lastModified: string;
  publicEndpoint: string;
  privateEndpoint: string;
  replicaOf: {
    endpoints: string[];
  };
  clustering: ICloudCapiDatabaseClustering;
  security: ICloudCapiDatabaseSecurity;
  modules: ICloudCapiDatabaseModule[];
  alerts: ICloudCapiDatabaseAlert[];
  planMemoryLimit?: number;
  memoryLimitMeasurementUnit?: string;
}

export interface ICloudCapiSubscriptionDatabasesSubscription {
  subscriptionId: number;
  numberOfDatabases: number;
  databases: ICloudCapiDatabase[];
}

export interface ICloudCapiSubscriptionDatabases {
  accountId: number;
  subscription:
    | ICloudCapiSubscriptionDatabasesSubscription
    | ICloudCapiSubscriptionDatabasesSubscription[];
}
