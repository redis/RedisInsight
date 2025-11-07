export enum RedisEnterprisePersistencePolicy {
  AofEveryOneSecond = 'aof-every-1-second',
  AofEveryWrite = 'aof-every-write',
  SnapshotEveryOneHour = 'snapshot-every-1-hour',
  SnapshotEverySixHours = 'snapshot-every-6-hours',
  SnapshotEveryTwelveHours = 'snapshot-every-12-hours',
  None = 'none',
}

type IRedisEnterpriseDatabaseTag = {
  key: string;
  value: string;
};

export interface IRedisEnterpriseDatabase {
  gradual_src_mode: string;
  group_uid: number;
  memory_size: number;
  last_changed_time: string;
  created_time: string;
  skip_import_analyze: string;
  rack_aware: boolean;
  shard_key_regex: any[];
  redis_version: string;
  oss_sharding: false;
  shard_list: number[];
  authentication_ssl_client_certs: any[];
  backup_progress: any;
  import_status: string;
  hash_slots_policy: string;
  dataset_import_sources: any;
  roles_permissions: any[];
  replication: boolean;
  authentication_admin_pass: string;
  default_user: boolean;
  name: string;
  crdt_causal_consistency: boolean;
  authentication_sasl_pass: string;
  import_failure_reason: string;
  oss_cluster: boolean;
  sync: string;
  background_op: any[];
  authentication_ssl_crdt_certs: any;
  port: number;
  crdt_guid: string;
  version: string;
  email_alerts: boolean;
  max_aof_load_time: number;
  crdt_sources: any[];
  auto_upgrade: boolean;
  backup_interval: number;
  slave_ha_priority: number;
  shards_placement: string;
  data_persistence: RedisEnterpriseDatabasePersistence;
  crdt_sync: string;
  backup_status: string;
  crdt: boolean;
  crdt_replicas: any;
  snapshot_policy: IRedisEnterpriseSnapshotPolicy[];
  backup: boolean;
  gradual_sync_max_shards_per_source: number;
  backup_interval_offset: number;
  tls_mode: 'enabled' | 'disabled';
  replica_sync: 'enabled' | 'disabled';
  authentication_redis_pass: string;
  implicit_shard_key: boolean;
  max_aof_file_size: number;
  bigstore: boolean;
  max_connections: number;
  module_list: IRedisEnterpriseModule[];
  eviction_policy: string;
  type: string;
  backup_history: number;
  sync_sources: any[];
  crdt_ghost_replica_ids: string;
  replica_sources: IRedisEnterpriseReplicaSource[];
  shard_block_foreign_keys: boolean;
  enforce_client_authentication: string;
  crdt_replica_id: number;
  crdt_config_version: number;
  proxy_policy: string;
  aof_policy: RedisEnterpriseDatabaseAofPolicy;
  endpoints: IRedisEnterpriseEndpoint[];
  wait_command: boolean;
  uid: number;
  authentication_sasl_uname: string;
  backup_failure_reason: string;
  bigstore_ram_size: number;
  shard_block_crossslot_keys: boolean;
  acl: any[];
  slave_ha: boolean;
  internal: boolean;
  shards_count: number;
  status: RedisEnterpriseDatabaseStatus;
  gradual_sync_mode: string;
  mkms: boolean;
  gradual_src_max_sources: number;
  sharding: boolean;
  oss_cluster_api_preferred_ip_type: string;
  ssl: boolean;
  dns_address_master: string;
  import_progress: any;
  tags: IRedisEnterpriseDatabaseTag[];
}

export interface IRedisEnterpriseModule {
  module_name: string;
  module_id: string;
  semantic_version: string;
  module_args: string;
}

interface IRedisEnterpriseSnapshotPolicy {
  secs: number;
  writes: number;
}

export interface IRedisEnterpriseReplicaSource {
  status: string;
  uid: number;
  uri: string;
  server_cert?: string;
  encryption?: boolean;
  lag?: number;
  rdb_transferred?: number;
  last_update?: string;
  rdb_size?: number;
  last_error?: string;
  client_cert?: string;
  replication_tls_sni?: string;
  compression?: number;
}

export interface IRedisEnterpriseEndpoint {
  oss_cluster_api_preferred_ip_type: string;
  uid: string;
  dns_name: string;
  addr_type: string;
  proxy_policy: string;
  port: number;
  addr: string[];
}
export enum RedisEnterpriseDatabasePersistence {
  Disabled = 'disabled',
  Aof = 'aof',
  Snapshot = 'snapshot',
}

export enum RedisEnterpriseDatabaseAofPolicy {
  AofEveryOneSecond = 'appendfsync-every-sec',
  AofEveryWrite = 'appendfsync-always',
}

export enum RedisEnterpriseDatabaseStatus {
  Pending = 'pending',
  CreationFailed = 'creation-failed',
  Active = 'active',
  ActiveChangePending = 'active-change-pending',
  ImportPending = 'import-pending',
  DeletePending = 'delete-pending',
  Recovery = 'recovery',
}
