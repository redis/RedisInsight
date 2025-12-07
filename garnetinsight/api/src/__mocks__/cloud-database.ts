import {
  CloudDatabase,
  CloudDatabaseAlert,
  CloudDatabaseAlertName,
  CloudDatabaseDataEvictionPolicy,
  CloudDatabaseDetails,
  CloudDatabasePersistencePolicy,
  CloudDatabaseProtocol,
  CloudDatabaseStatus,
  ICloudCapiDatabase,
  ICloudCapiDatabaseTag,
} from 'src/modules/cloud/database/models';
import {
  mockCloudSubscription,
  mockCloudSubscriptionFixed,
} from 'src/__mocks__/cloud-subscription';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { mockCloudAccountInfo } from 'src/__mocks__/cloud-user';
import {
  CreateFreeCloudDatabaseDto,
  GetCloudSubscriptionDatabaseDto,
  GetCloudSubscriptionDatabasesDto,
} from 'src/modules/cloud/database/dto';
import { CloudDatabaseDetailsEntity } from 'src/modules/cloud/database/entities/cloud-database-details.entity';
import { mockCloudTaskInit } from 'src/__mocks__/cloud-task';
import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

export const mockCloudCapiDatabaseTags: ICloudCapiDatabaseTag[] = [
  {
    key: 'tag1',
    value: 'value1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
    links: ['link1', 'link2'],
  },
  {
    key: 'tag2',
    value: 'value2',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
    links: ['link3', 'link4'],
  },
];

export const mockCloudCapiDatabase: ICloudCapiDatabase = {
  databaseId: 50859754,
  name: 'bdb',
  protocol: CloudDatabaseProtocol.Redis,
  provider: 'GCP',
  region: 'us-central1',
  redisVersionCompliance: '5.0.5',
  status: CloudDatabaseStatus.Active,
  memoryLimitInGb: 1.0,
  memoryUsedInMb: 6.0,
  memoryStorage: 'ram',
  supportOSSClusterApi: false,
  dataPersistence: CloudDatabasePersistencePolicy.None,
  replication: true,
  dataEvictionPolicy: CloudDatabaseDataEvictionPolicy.VolatileLru,
  throughputMeasurement: {
    by: 'operations-per-second',
    value: 25000,
  },
  activatedOn: '2019-12-31T09:38:41Z',
  lastModified: '2019-12-31T09:38:41Z',
  publicEndpoint:
    'redis-14621.c34097.us-central1-mz.gcp.qa-cloud.rlrcp.com:14621',
  privateEndpoint:
    'redis-14621.internal.c34097.us-central1-mz.gcp.qa-cloud.rlrcp.com:14621',
  replicaOf: {
    endpoints: [
      'redis-19669.c9244.us-central1-mz.gcp.cloud.rlrcp.com:19669',
      'redis-14074.c9243.us-central1-mz.gcp.cloud.rlrcp.com:14074',
    ],
  },
  clustering: {
    numberOfShards: 1,
    regexRules: [],
    hashingPolicy: 'standard',
  },
  security: {
    sslClientAuthentication: false,
    sourceIps: ['0.0.0.0/0'],
  },
  modules: [
    {
      id: 1,
      name: 'ReJSON',
      version: 'v10007',
    },
  ],
  alerts: [],
};

export const mockCloudCapiDatabaseFixed: ICloudCapiDatabase = {
  ...mockCloudCapiDatabase,
  name: cloudConfig.freeDatabaseName,
  protocol: CloudDatabaseProtocol.Stack,
  planMemoryLimit: 256,
  memoryLimitMeasurementUnit: 'MB',
};

export const mockCloudDatabase = Object.assign(new CloudDatabase(), {
  subscriptionId: mockCloudSubscription.id,
  subscriptionType: CloudSubscriptionType.Flexible,
  databaseId: mockCloudCapiDatabase.databaseId,
  name: mockCloudCapiDatabase.name,
  publicEndpoint: mockCloudCapiDatabase.publicEndpoint,
  password: undefined,
  status: mockCloudCapiDatabase.status,
  sslClientAuthentication: false,
  modules: ['ReJSON'],
  options: {
    enabledBackup: false,
    enabledClustering: false,
    enabledDataPersistence: false,
    enabledRedisFlash: false,
    enabledReplication: true,
    isReplicaDestination: true,
    persistencePolicy: 'none',
  },
  cloudDetails: {
    cloudId: mockCloudCapiDatabase.databaseId,
    subscriptionType: CloudSubscriptionType.Flexible,
    memoryLimitMeasurementUnit: undefined,
    planMemoryLimit: undefined,
    subscriptionId: mockCloudSubscription.id,
    free: false,
  },
  tags: [],
});

export const mockCloudDatabaseFixed = Object.assign(new CloudDatabase(), {
  ...mockCloudDatabase,
  name: cloudConfig.freeDatabaseName,
  subscriptionType: CloudSubscriptionType.Fixed,
  cloudDetails: {
    cloudId: mockCloudCapiDatabaseFixed.databaseId,
    subscriptionType: CloudSubscriptionType.Fixed,
    subscriptionId: mockCloudSubscription.id,
    planMemoryLimit: mockCloudCapiDatabaseFixed.planMemoryLimit,
    memoryLimitMeasurementUnit:
      mockCloudCapiDatabaseFixed.memoryLimitMeasurementUnit,
    free: true,
  },
});

export const mockCloudDatabaseFromList = Object.assign(new CloudDatabase(), {
  ...mockCloudDatabase,
  options: {
    ...mockCloudDatabase.options,
    isReplicaSource: false,
  },
});

export const mockCloudDatabaseFromListFixed = Object.assign(
  new CloudDatabase(),
  {
    ...mockCloudDatabaseFixed,
    options: {
      ...mockCloudDatabaseFixed.options,
      isReplicaSource: false,
    },
  },
);

export const mockCloudCapiSubscriptionDatabases = {
  accountId: mockCloudAccountInfo.accountId,
  subscription: [
    {
      subscriptionId: mockCloudSubscription.id,
      numberOfDatabases: mockCloudSubscription.numberOfDatabases,
      databases: [mockCloudCapiDatabase],
    },
  ],
};

export const mockCloudCapiSubscriptionDatabasesFixed = {
  ...mockCloudCapiSubscriptionDatabases,
  subscription: {
    ...mockCloudCapiSubscriptionDatabases.subscription[0],
    databases: [mockCloudCapiDatabaseFixed],
  },
};

export const mockCloudDatabaseDetails = Object.assign(
  new CloudDatabaseDetails(),
  {
    cloudId: mockCloudDatabase.databaseId,
    subscriptionType: mockCloudDatabase.subscriptionType,
    planMemoryLimit: 30,
    memoryLimitMeasurementUnit: 'MB',
    free: false,
  },
);

export const mockCloudDatabaseDetailsEntity = Object.assign(
  new CloudDatabaseDetailsEntity(),
  {
    ...mockCloudDatabaseDetails,
  },
);

export const mockGetCloudSubscriptionDatabasesDto = Object.assign(
  new GetCloudSubscriptionDatabasesDto(),
  {
    subscriptionId: mockCloudSubscription.id,
    subscriptionType: mockCloudSubscription.type,
    free: false,
  },
);

export const mockGetCloudSubscriptionDatabasesDtoFixed = Object.assign(
  new GetCloudSubscriptionDatabasesDto(),
  {
    subscriptionId: mockCloudSubscription.id,
    subscriptionType: CloudSubscriptionType.Fixed,
    free: true,
  },
);

export const mockGetCloudSubscriptionDatabaseDto = Object.assign(
  new GetCloudSubscriptionDatabaseDto(),
  {
    subscriptionId: mockCloudSubscription.id,
    subscriptionType: mockCloudSubscription.type,
    databaseId: mockCloudDatabase.databaseId,
    free: false,
  },
);

export const mockGetCloudSubscriptionDatabaseDtoFixed = Object.assign(
  new GetCloudSubscriptionDatabaseDto(),
  {
    ...mockGetCloudSubscriptionDatabaseDto,
    subscriptionType: mockCloudSubscriptionFixed.type,
    free: true,
  },
);

export const mockCloudDatabaseConnectionLimitAlert = Object.assign(
  new CloudDatabaseAlert(),
  {
    name: CloudDatabaseAlertName.ConnectionsLimit,
    value: 80,
  },
);

export const mockCloudDatabaseDatasetsSizeAlert = Object.assign(
  new CloudDatabaseAlert(),
  {
    name: CloudDatabaseAlertName.DatasetsSize,
    value: 80,
  },
);

export const mockCreateFreeCloudDatabaseDto = Object.assign(
  new CreateFreeCloudDatabaseDto(),
  {
    name: mockCloudDatabaseFixed.name,
    subscriptionId: mockCloudSubscriptionFixed.id,
    subscriptionType: mockCloudSubscriptionFixed.type,
    protocol: CloudDatabaseProtocol.Stack,
    dataPersistence: CloudDatabasePersistencePolicy.None,
    dataEvictionPolicy: CloudDatabaseDataEvictionPolicy.VolatileLru,
    replication: false,
    free: true,
    alerts: [
      mockCloudDatabaseConnectionLimitAlert,
      mockCloudDatabaseDatasetsSizeAlert,
    ],
  },
);

export const mockCloudDatabaseCapiProvider = jest.fn(() => ({
  getDatabase: jest.fn().mockResolvedValue(mockCloudCapiDatabase),
  getDatabases: jest.fn().mockResolvedValue(mockCloudCapiSubscriptionDatabases),
  getDatabaseTags: jest.fn().mockResolvedValue(mockCloudCapiDatabaseTags),
  createFreeDatabase: jest.fn().mockResolvedValue(mockCloudTaskInit),
}));

export const mockCloudDatabaseCapiService = jest.fn(() => ({
  getDatabase: jest.fn().mockResolvedValue(mockCloudDatabase),
  getDatabases: jest.fn().mockResolvedValue([mockCloudDatabase]),
  createFreeDatabase: jest.fn().mockResolvedValue(mockCloudTaskInit),
}));
