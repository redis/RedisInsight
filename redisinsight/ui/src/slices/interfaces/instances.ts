import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'
import { Maybe, Nullable } from 'uiSrc/utils'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces/cloud'
import { DatabaseListColumn } from 'uiSrc/constants'
import { GetHashFieldsResponse } from 'apiSrc/modules/browser/hash/dto'
import { GetSetMembersResponse } from 'apiSrc/modules/browser/set/dto'
import {
  GetRejsonRlResponseDto,
  SafeRejsonRlDataDto,
} from 'apiSrc/modules/browser/rejson-rl/dto'
import {
  GetListElementsDto,
  GetListElementsResponse,
} from 'apiSrc/modules/browser/list/dto'
import { Database as DatabaseInstanceResponse } from 'apiSrc/modules/database/models/database'
import { SearchZSetMembersResponse } from 'apiSrc/modules/browser/z-set/dto'
import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'
import { CreateSentinelDatabaseDto } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.database.dto'
import { CreateSentinelDatabaseResponse } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.database.response'
import { RedisNodeInfoResponse } from 'apiSrc/modules/database/dto/redis-info.dto'
import { Tag } from './tag'

export interface Instance extends Partial<DatabaseInstanceResponse> {
  host: string
  port: number
  nameFromProvider?: Nullable<string>
  provider?: string
  id: string
  endpoints?: Nullable<Endpoints[]>
  connectionType?: ConnectionType
  lastConnection?: Date
  password?: Nullable<string>
  username?: Nullable<string>
  name?: string
  db?: number
  tls?: boolean
  ssh?: boolean
  sshOptions?: {
    host: string
    port: number
    username?: string
    password?: string | true
    privateKey?: string
    passphrase?: string | true
  }
  tlsClientAuthRequired?: boolean
  verifyServerCert?: boolean
  caCert?: CaCertificate
  clientCert?: ClientCertificate
  authUsername?: Nullable<string>
  authPass?: Nullable<string>
  isDeleting?: boolean
  sentinelMaster?: SentinelMaster
  modules: AdditionalRedisModule[]
  version: Nullable<string>
  isRediStack?: boolean
  visible?: boolean
  loading?: boolean
  isFreeDb?: boolean
  tags?: Tag[]
}

export interface AdditionalRedisModule {
  name: string
  version: number
  semanticVersion: string
}

interface CaCertificate {
  id?: string
  name?: string
  certificate?: string
}

interface ClientCertificate {
  id?: string
  name?: string
  key?: string
  certificate?: string
}

export enum ConnectionType {
  Standalone = 'STANDALONE',
  Cluster = 'CLUSTER',
  Sentinel = 'SENTINEL',
}

export enum ConnectionProvider {
  UNKNOWN = 'UNKNOWN',
  LOCALHOST = 'LOCALHOST',
  REDIS_SOFTWARE = 'REDIS_SOFTWARE',
  REDIS_CLOUD = 'REDIS_CLOUD',
  AZURE = 'AZURE',
  AWS = 'AWS',
  GOOGLE = 'GOOGLE',
}

export const CONNECTION_TYPE_DISPLAY = Object.freeze({
  [ConnectionType.Standalone]: 'Standalone',
  [ConnectionType.Cluster]: 'OSS Cluster',
  [ConnectionType.Sentinel]: 'Sentinel',
})

export interface Endpoints {
  host: string
  port: number
}

export interface InstanceRedisCluster {
  host: string
  port: number
  uid: number
  name: string
  id?: number
  dnsName: string
  address: string
  status: InstanceRedisClusterStatus
  modules: RedisDefaultModules[]
  tls: boolean
  options: any
  message?: string
  uidAdded?: number
  statusAdded?: AddRedisDatabaseStatus
  messageAdded?: string
  databaseDetails?: InstanceRedisCluster
}

export interface InstanceRedisCloud {
  accessKey: string
  secretKey: string
  credentials: Nullable<ICredentialsRedisCluster>
  account: Nullable<RedisCloudAccount>
  host: string
  port: number
  uid: number
  name: string
  id?: number
  dnsName: string
  address: string
  status: InstanceRedisClusterStatus
  modules: RedisDefaultModules[]
  tls: boolean
  options: any
  message?: string
  publicEndpoint?: string
  databaseId: number
  databaseIdAdded?: number
  subscriptionId?: number
  subscriptionType?: RedisCloudSubscriptionType
  subscriptionName: string
  subscriptionIdAdded?: number
  statusAdded?: AddRedisDatabaseStatus
  messageAdded?: string
  databaseDetails?: InstanceRedisCluster
  free: boolean
}

export interface IBulkOperationResult {
  status: AddRedisDatabaseStatus
  message: string
  error?: any
}

export enum AddRedisDatabaseStatus {
  Success = 'success',
  Fail = 'fail',
}

export enum RedisDefaultModules {
  AI = 'ai',
  Graph = 'graph',
  Gears = 'rg',
  Bloom = 'bf',
  ReJSON = 'ReJSON',
  Search = 'search',
  SearchLight = 'searchlight',
  TimeSeries = 'timeseries',
  FT = 'ft',
  FTL = 'ftl',
  RedisGears = 'redisgears',
  RedisGears2 = 'redisgears_2',
}

export enum RedisCustomModulesName {
  Proto = 'PB',
  IpTables = 'iptables-input-filter',
}

export const REDISEARCH_MODULES: string[] = [
  RedisDefaultModules.Search,
  RedisDefaultModules.SearchLight,
  RedisDefaultModules.FT,
  RedisDefaultModules.FTL,
]

export const COMMAND_MODULES = {
  [RedisDefaultModules.Search]: REDISEARCH_MODULES,
  [RedisDefaultModules.ReJSON]: [RedisDefaultModules.ReJSON],
  [RedisDefaultModules.TimeSeries]: [RedisDefaultModules.TimeSeries],
  [RedisDefaultModules.Bloom]: [RedisDefaultModules.Bloom],
}

// Enums don't allow to use dynamic key
export const DATABASE_LIST_MODULES_TEXT = Object.freeze({
  [RedisDefaultModules.AI]: 'AI',
  [RedisDefaultModules.Graph]: 'Graph',
  [RedisDefaultModules.Gears]: 'Gears',
  [RedisDefaultModules.RedisGears]: 'Gears',
  [RedisDefaultModules.RedisGears2]: 'Gears',
  [RedisDefaultModules.Bloom]: 'Probabilistic',
  [RedisDefaultModules.ReJSON]: 'JSON',
  [RedisDefaultModules.TimeSeries]: 'Time Series',
  [RedisCustomModulesName.Proto]: 'redis-protobuf',
  [RedisCustomModulesName.IpTables]: 'RedisPushIpTables',
  [RedisDefaultModules.Search]: 'Redis Query Engine',
  [RedisDefaultModules.SearchLight]: 'Redis Query Engine',
  [RedisDefaultModules.FT]: 'Redis Query Engine',
  [RedisDefaultModules.FTL]: 'Redis Query Engine',
})

export enum AddRedisClusterDatabaseOptions {
  ActiveActive = 'enabledActiveActive',
  Backup = 'enabledBackup',
  Clustering = 'enabledClustering',
  PersistencePolicy = 'persistencePolicy',
  Flash = 'enabledRedisFlash',
  Replication = 'enabledReplication',
  ReplicaDestination = 'isReplicaDestination',
  ReplicaSource = 'isReplicaSource',
}

// Enums don't allow to use dynamic key
export const DATABASE_LIST_OPTIONS_TEXT = Object.freeze({
  [AddRedisClusterDatabaseOptions.ActiveActive]: 'Active-Active',
  [AddRedisClusterDatabaseOptions.Backup]: 'Backup',
  [AddRedisClusterDatabaseOptions.Clustering]: 'Clustering',
  [AddRedisClusterDatabaseOptions.PersistencePolicy]: 'Persistence',
  [AddRedisClusterDatabaseOptions.Flash]: 'Flash',
  [AddRedisClusterDatabaseOptions.Replication]: 'Replication',
  [AddRedisClusterDatabaseOptions.ReplicaDestination]: 'Replica Destination',
  [AddRedisClusterDatabaseOptions.ReplicaSource]: 'Replica Source',
})

export enum PersistencePolicy {
  'none' = 'none',
  'aof-every-1-second' = 'Append-only file (AOF) every 1 second',
  'aof-every-write' = 'Append-only file (AOF) every write',
  'snapshot-every-1-hour' = 'Redis database backup (RDB) every 1 hour',
  'snapshot-every-6-hours' = 'Redis database backup (RDB) every 6 hours',
  'snapshot-every-12-hours' = 'Redis database backup (RDB) every 12 hours',
}

export enum InstanceRedisClusterStatus {
  Pending = 'pending',
  CreationFailed = 'creation-failed',
  Active = 'active',
  ActiveChangePending = 'active-change-pending',
  ImportPending = 'import-pending',
  DeletePending = 'delete-pending',
  Recovery = 'recovery',
}

export interface TlsSettings {
  caCertId?: string
  clientCertPairId?: string
  verifyServerCert?: boolean
}

export interface ClusterNode {
  host: string
  port: number
  role?: 'slave' | 'master'
  slot?: number
}

export enum RedisCloudSubscriptionStatus {
  Active = 'active',
  NotActivated = 'not_activated',
  Deleting = 'deleting',
  Pending = 'pending',
  Error = 'error',
}

export const RedisCloudSubscriptionStatusText = Object.freeze({
  [RedisCloudSubscriptionStatus.Active]: 'Active',
  [RedisCloudSubscriptionStatus.NotActivated]: 'Not Activated',
  [RedisCloudSubscriptionStatus.Deleting]: 'Deleting',
  [RedisCloudSubscriptionStatus.Pending]: 'Pending',
  [RedisCloudSubscriptionStatus.Error]: 'Error',
})

export enum RedisCloudSubscriptionType {
  Flexible = 'flexible',
  Fixed = 'fixed',
}

export const RedisCloudSubscriptionTypeText = Object.freeze({
  [RedisCloudSubscriptionType.Fixed]: 'Fixed',
  [RedisCloudSubscriptionType.Flexible]: 'Flexible',
})

export interface RedisCloudSubscription {
  id: number
  name: string
  type: RedisCloudSubscriptionType
  numberOfDatabases: number
  provider: string
  region: string
  status: RedisCloudSubscriptionStatus
  free: boolean
}

export interface DatabaseConfigInfo {
  version: string
  totalKeys?: Nullable<number>
  usedMemory?: Nullable<number>
  connectedClients?: Nullable<number>
  opsPerSecond?: Nullable<number>
  networkInKbps?: Nullable<number>
  networkOutKbps?: Nullable<number>
  cpuUsagePercentage?: Nullable<number>
  serverName?: Nullable<string>
  cloudDetails?: {
    cloudId: number
    subscriptionId: number
    subscriptionType: 'fixed' | 'flexible'
    planMemoryLimit: number
    memoryLimitMeasurementUnit: string
    isBdbPackages: boolean
  }
}

export interface InitialStateInstances {
  loading: boolean
  error: string
  data: Instance[]
  loadingChanging: boolean
  errorChanging: string
  changedSuccessfully: boolean
  deletedSuccessfully: boolean
  connectedInstance: Instance
  editedInstance: InitialStateEditedInstances
  instanceOverview: DatabaseConfigInfo
  instanceInfo: RedisNodeInfoResponse
  freeInstances: Nullable<Instance[]>
  importInstances: {
    loading: boolean
    error: string
    data: Nullable<ImportDatabasesData>
  }
  shownColumns: DatabaseListColumn[]
}

export interface ErrorImportResult {
  statusCode: number
  message: string
  error: string
}

export interface ImportDatabasesData {
  fail: Array<FailedImportStatusResult>
  partial: Array<FailedImportStatusResult>
  success: Array<SuccessImportStatusResult>
  total: number
}

export interface FailedImportStatusResult {
  host?: string
  port?: number
  index: number
  errors: Array<ErrorImportResult>
  status: string
}

export interface SuccessImportStatusResult {
  host: string
  port: number
  index: number
  status: string
}

export interface InitialStateEditedInstances {
  loading: boolean
  error: string
  data: Nullable<Instance>
}

export interface InitialStateCluster {
  loading: boolean
  data: Nullable<InstanceRedisCluster[]>
  dataAdded: InstanceRedisCluster[]
  error: string
  credentials: Nullable<ICredentialsRedisCluster>
}

export interface InitialStateCloud {
  loading: boolean
  data: Nullable<InstanceRedisCloud[]>
  dataAdded: InstanceRedisCloud[]
  error: string
  credentials: Nullable<ICredentialsRedisCloud>
  subscriptions: Nullable<RedisCloudSubscription[]>
  ssoFlow: Maybe<OAuthSocialAction>
  isRecommendedSettings: Maybe<boolean>
  account: {
    data: Nullable<RedisCloudAccount>
    error: string
  }
  loaded: ILoadedCloud
}

export interface InitialStateSentinel {
  loading: boolean
  instance: Nullable<Instance>
  data: ModifiedSentinelMaster[]
  statuses: CreateSentinelDatabaseResponse[]
  error: string
  loaded: ILoadedSentinel
}

export enum LoadedCloud {
  Subscriptions = 'subscriptions',
  Instances = 'instances',
  InstancesAdded = 'instancesAdded',
}

export enum LoadedSentinel {
  Masters = 'masters',
  MastersAdded = 'mastersAdded',
}

export interface ILoadedCloud {
  [LoadedCloud.Subscriptions]?: boolean
  [LoadedCloud.Instances]?: boolean
  [LoadedCloud.InstancesAdded]?: boolean
}

export interface ILoadedSentinel {
  [LoadedSentinel.Masters]?: boolean
  [LoadedSentinel.MastersAdded]?: boolean
}

export interface ModifiedGetSetMembersResponse extends GetSetMembersResponse {
  key?: RedisResponseBuffer
  match?: string
}

export interface ModifiedZsetMembersResponse extends SearchZSetMembersResponse {
  key?: RedisResponseBuffer
  match?: string
}

export interface ModifiedGetHashMembersResponse extends GetHashFieldsResponse {
  key?: RedisResponseBuffer
  match?: string
}

export interface ModifiedSentinelMaster extends CreateSentinelDatabaseDto {
  id?: string
  alias: string
  host?: string
  port?: string
  username?: string
  password?: string
  loading?: boolean
  message?: string
  status?: AddRedisDatabaseStatus
  error?:
    | string
    | {
        statusCode?: number
        name?: string
      }
  numberOfSlaves?: number
}

export interface ModifiedGetListElementsResponse
  extends GetListElementsDto,
    GetListElementsResponse {
  elements: { index: number; element: RedisResponseBuffer }[]
  key?: RedisString
  searchedIndex: Nullable<number>
}

export interface InitialStateSet {
  loading: boolean
  error: string
  data: ModifiedGetSetMembersResponse
}

export interface GetRejsonRlResponse extends GetRejsonRlResponseDto {
  data: Maybe<SafeRejsonRlDataDto[] | string | number | boolean | null>
}

export enum EditorType {
  Default = 'default',
  Text = 'text',
}

export interface InitialStateRejson {
  loading: boolean
  error: Nullable<string>
  data: GetRejsonRlResponse
  editorType: EditorType
  isWithinThreshold: boolean
}

export interface ICredentialsRedisCluster {
  host: string
  port: number
  username: string
  password: string
}

export interface RedisCloudAccount {
  accountId: Nullable<number>
  accountName: Nullable<string>
  ownerEmail: Nullable<string>
  ownerName: Nullable<string>
}

export interface ICredentialsRedisCloud {
  accessKey: Nullable<string>
  secretKey: Nullable<string>
}

export enum InstanceType {
  Standalone = 'Redis Database',
  RedisCloudPro = 'Redis Cloud',
  RedisEnterpriseCluster = 'Enterprise Software',
  AWSElasticache = 'AWS Elasticache',
  Sentinel = 'Sentinel',
}
