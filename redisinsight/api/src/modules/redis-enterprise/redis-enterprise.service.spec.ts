import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import axios from 'axios';
import { RedisErrorCodes } from 'src/constants';
import {
  mockDatabaseService,
  mockRedisEnterpriseAnalytics,
  mockSessionMetadata,
} from 'src/__mocks__';
import {
  IRedisEnterpriseDatabase,
  IRedisEnterpriseEndpoint,
  RedisEnterpriseDatabaseAofPolicy,
  RedisEnterpriseDatabasePersistence,
  RedisEnterpriseDatabaseStatus,
  RedisEnterprisePersistencePolicy,
} from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { RedisEnterpriseService } from 'src/modules/redis-enterprise/redis-enterprise.service';
import { ClusterConnectionDetailsDto } from 'src/modules/redis-enterprise/dto/cluster.dto';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';
import { DatabaseService } from 'src/modules/database/database.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);
const mockGetDatabasesDto: ClusterConnectionDetailsDto = {
  host: 'localhost',
  port: 9443,
  username: 'admin@gmail.com',
  password: 'adminpassword',
};

const mockRedisSoftwareDatabaseEndpoint: IRedisEnterpriseEndpoint = {
  oss_cluster_api_preferred_ip_type: 'internal',
  uid: '2:1',
  addr_type: 'external',
  dns_name: 'redis-11305.testcluster.local',
  proxy_policy: 'single',
  port: 11305,
  addr: ['172.17.0.2'],
};
const mockRedisSoftwareDatabase: IRedisEnterpriseDatabase = {
  gradual_src_mode: 'disabled',
  group_uid: 0,
  memory_size: 107374182,
  last_changed_time: '2021-02-15T11:56:40Z',
  created_time: '2021-02-15T11:56:40Z',
  skip_import_analyze: 'disabled',
  rack_aware: false,
  redis_version: '6.0',
  oss_sharding: false,
  shard_list: [2],
  authentication_ssl_client_certs: [],
  backup_progress: 0.0,
  import_status: '',
  hash_slots_policy: '16k',
  dataset_import_sources: [],
  roles_permissions: [],
  replication: false,
  authentication_admin_pass: '',
  default_user: true,
  name: 'basic',
  crdt_causal_consistency: false,
  authentication_sasl_pass: '',
  import_failure_reason: '',
  oss_cluster: false,
  sync: 'disabled',
  background_op: [{ status: 'idle' }],
  authentication_ssl_crdt_certs: [],
  port: 0,
  crdt_guid: '',
  version: '6.0.4',
  email_alerts: false,
  max_aof_load_time: 3600,
  crdt_sources: [],
  auto_upgrade: false,
  backup_interval: 0,
  slave_ha_priority: 0,
  shards_placement: 'dense',
  data_persistence: RedisEnterpriseDatabasePersistence.Disabled,
  crdt_sync: 'disabled',
  backup_status: '',
  crdt: false,
  crdt_replicas: '',
  snapshot_policy: [],
  backup: false,
  gradual_sync_max_shards_per_source: 1,
  backup_interval_offset: 0,
  tls_mode: 'disabled',
  replica_sync: 'disabled',
  authentication_redis_pass: '',
  implicit_shard_key: false,
  max_aof_file_size: 322122547200,
  bigstore: false,
  max_connections: 0,
  module_list: [],
  eviction_policy: 'volatile-lru',
  type: 'redis',
  backup_history: 0,
  sync_sources: [],
  crdt_ghost_replica_ids: '',
  replica_sources: [],
  shard_block_foreign_keys: true,
  enforce_client_authentication: 'enabled',
  crdt_replica_id: 0,
  crdt_config_version: 0,
  proxy_policy: 'single',
  aof_policy: RedisEnterpriseDatabaseAofPolicy.AofEveryOneSecond,
  wait_command: true,
  uid: 2,
  authentication_sasl_uname: '',
  backup_failure_reason: '',
  bigstore_ram_size: 0,
  shard_block_crossslot_keys: false,
  acl: [],
  slave_ha: false,
  internal: false,
  shards_count: 1,
  shard_key_regex: [],
  status: RedisEnterpriseDatabaseStatus.Active,
  gradual_sync_mode: 'auto',
  mkms: true,
  gradual_src_max_sources: 1,
  sharding: false,
  oss_cluster_api_preferred_ip_type: 'internal',
  ssl: false,
  dns_address_master: '',
  import_progress: 0.0,
  endpoints: [mockRedisSoftwareDatabaseEndpoint],
  tags: [],
};
const mockRedisSoftwareDbsResponse: IRedisEnterpriseDatabase[] = [
  mockRedisSoftwareDatabase,
];

describe('RedisEnterpriseService', () => {
  let service;
  let parseClusterDbsResponse;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: RedisEnterpriseAnalytics,
          useFactory: mockRedisEnterpriseAnalytics,
        },
        RedisEnterpriseService,
      ],
    }).compile();

    service = await module.get<RedisEnterpriseService>(RedisEnterpriseService);
    parseClusterDbsResponse = jest.spyOn(service, 'parseClusterDbsResponse');
  });

  describe('getDatabases', () => {
    it('successfully get databases from RE cluster', async () => {
      const response = { status: 200, data: mockRedisSoftwareDbsResponse };
      mockedAxios.get.mockResolvedValue(response);

      await expect(
        service.getDatabases(mockSessionMetadata, mockGetDatabasesDto),
      ).resolves.not.toThrow();
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(parseClusterDbsResponse).toHaveBeenCalledWith(
        mockRedisSoftwareDbsResponse,
      );
    });
    it('the user could not be authenticated', async () => {
      const apiResponse = {
        message: 'Request failed with status code 401',
        response: {
          status: 401,
        },
      };
      mockedAxios.get.mockRejectedValue(apiResponse);

      await expect(
        service.getDatabases(mockSessionMetadata, mockGetDatabasesDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('connection refused', async () => {
      const apiResponse = {
        code: RedisErrorCodes.ConnectionRefused,
        message: 'connect ECONNREFUSED',
      };
      mockedAxios.get.mockRejectedValue(apiResponse);

      await expect(
        service.getDatabases(mockSessionMetadata, mockGetDatabasesDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDatabaseExternalEndpoint', () => {
    const externalEndpoint: IRedisEnterpriseEndpoint =
      mockRedisSoftwareDatabaseEndpoint;
    const internalEndpoint: IRedisEnterpriseEndpoint = {
      ...mockRedisSoftwareDatabaseEndpoint,
      addr_type: 'internal',
    };
    it('should return only one external endpoints', async () => {
      const result = service.getDatabaseExternalEndpoint({
        ...mockRedisSoftwareDatabase,
        endpoints: [externalEndpoint, internalEndpoint],
      });
      expect(result).toEqual(externalEndpoint);
    });
    it('should return undefined', async () => {
      const result = service.getDatabaseExternalEndpoint({
        ...mockRedisSoftwareDatabase,
        endpoints: [internalEndpoint],
      });
      expect(result).toBeUndefined();
    });
  });

  describe('getDatabasePersistencePolicy', () => {
    it('should return AofEveryOneSecond', async () => {
      const result = service.getDatabasePersistencePolicy({
        ...mockRedisSoftwareDatabase,
        data_persistence: RedisEnterpriseDatabasePersistence.Aof,
        aof_policy: RedisEnterpriseDatabaseAofPolicy.AofEveryOneSecond,
      });
      expect(result).toEqual(
        RedisEnterprisePersistencePolicy.AofEveryOneSecond,
      );
    });
    it('should return AofEveryWrite', async () => {
      const result = service.getDatabasePersistencePolicy({
        ...mockRedisSoftwareDatabase,
        data_persistence: RedisEnterpriseDatabasePersistence.Aof,
        aof_policy: RedisEnterpriseDatabaseAofPolicy.AofEveryWrite,
      });
      expect(result).toEqual(RedisEnterprisePersistencePolicy.AofEveryWrite);
    });
    it('should return SnapshotEveryOneHour', async () => {
      const result = service.getDatabasePersistencePolicy({
        ...mockRedisSoftwareDatabase,
        data_persistence: RedisEnterpriseDatabasePersistence.Snapshot,
        snapshot_policy: [{ secs: 3600 }],
      });
      expect(result).toEqual(
        RedisEnterprisePersistencePolicy.SnapshotEveryOneHour,
      );
    });
    it('should return SnapshotEverySixHours', async () => {
      const result = service.getDatabasePersistencePolicy({
        ...mockRedisSoftwareDatabase,
        data_persistence: RedisEnterpriseDatabasePersistence.Snapshot,
        snapshot_policy: [{ secs: 21600 }],
      });
      expect(result).toEqual(
        RedisEnterprisePersistencePolicy.SnapshotEverySixHours,
      );
    });
    it('should return SnapshotEveryTwelveHours', async () => {
      const result = service.getDatabasePersistencePolicy({
        ...mockRedisSoftwareDatabase,
        data_persistence: RedisEnterpriseDatabasePersistence.Snapshot,
        snapshot_policy: [{ secs: 43200 }],
      });
      expect(result).toEqual(
        RedisEnterprisePersistencePolicy.SnapshotEveryTwelveHours,
      );
    });
    it('should return None', async () => {
      const result = service.getDatabasePersistencePolicy({
        ...mockRedisSoftwareDatabase,
        data_persistence: null,
      });
      expect(result).toEqual(RedisEnterprisePersistencePolicy.None);
    });
  });

  describe('findReplicasForDatabase', () => {
    it('successfully return replicas', async () => {
      const soursDatabase = mockRedisSoftwareDatabase;
      const sourceEndpoint = mockRedisSoftwareDatabase.endpoints[0];
      const replicaDatabase: IRedisEnterpriseDatabase = {
        ...mockRedisSoftwareDatabase,
        uid: 1,
        replica_sources: [
          {
            uid: 2,
            status: RedisEnterpriseDatabaseStatus.Active,
            uri: `${sourceEndpoint.dns_name}:${sourceEndpoint.port}`,
          },
        ],
      };
      const result = service.findReplicasForDatabase(
        [soursDatabase, replicaDatabase],
        soursDatabase,
      );

      expect(result).toEqual([replicaDatabase]);
    });
    it('source dont have replicas', async () => {
      const databases = [
        mockRedisSoftwareDatabase,
        {
          ...mockRedisSoftwareDatabase,
          uid: 3,
        },
        {
          ...mockRedisSoftwareDatabase,
          uid: 4,
          replica_sources: [
            {
              uid: 3,
              status: RedisEnterpriseDatabaseStatus.Active,
              uri: 'redis-11400.testcluster.local:11400',
            },
          ],
        },
      ];
      const result = service.findReplicasForDatabase(
        databases,
        mockRedisSoftwareDatabase,
      );

      expect(result).toEqual([]);
    });
  });
});
