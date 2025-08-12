import { FeatureFlags } from 'uiSrc/constants'
import { Maybe } from 'uiSrc/utils'

export interface IRoute {
  path: any
  component?: (routes: any) => JSX.Element | Element | null
  pageName?: PageNames
  exact?: boolean
  routes?: any
  protected?: boolean
  redirect?: (params: Record<string, Maybe<string>>) => string
  isAvailableWithoutAgreements?: boolean
  featureFlag?: FeatureFlags
}

export enum PageNames {
  workbench = 'workbench',
  vectorSearch = 'vector-search',
  vectorSearchCreateIndex = 'create-index',
  browser = 'browser',
  search = 'search',
  slowLog = 'slowlog',
  pubSub = 'pub-sub',
  analytics = 'analytics',
  clusterDetails = 'cluster-details',
  databaseAnalysis = 'database-analysis',
  settings = 'settings',
  // rdi pages
  rdiPipelineManagement = 'pipeline-management',
  rdiPipelineConfig = 'config',
  rdiPipelineJobs = 'jobs',
  rdiStatistics = 'statistics',
}

const redisCloud = '/redis-cloud'
const sentinel = '/sentinel'
const rdi = '/integrate'

export type PageValues = (typeof Pages)[keyof typeof Pages]
export const Pages = {
  home: '/',
  homeEditInstance: (instanceId: string) => `/?editInstance=${instanceId}`,
  notFound: '/not-found',
  redisEnterpriseAutodiscovery: '/redis-enterprise-autodiscovery',
  settings: `/${PageNames.settings}`,
  redisCloud,
  redisCloudSubscriptions: `${redisCloud}/subscriptions`,
  redisCloudDatabases: `${redisCloud}/databases`,
  redisCloudDatabasesResult: `${redisCloud}/databases-result`,
  sentinel,
  sentinelDatabases: `${sentinel}/databases`,
  sentinelDatabasesResult: `${sentinel}/databases-result`,
  browser: (instanceId: string) => `/${instanceId}/${PageNames.browser}`,
  vectorSearch: (instanceId: string) =>
    `/${instanceId}/${PageNames.vectorSearch}`,
  vectorSearchCreateIndex: (instanceId: string) =>
    `/${instanceId}/${PageNames.vectorSearch}/${PageNames.vectorSearchCreateIndex}`,
  workbench: (instanceId: string) => `/${instanceId}/${PageNames.workbench}`,
  search: (instanceId: string) => `/${instanceId}/${PageNames.search}`,
  pubSub: (instanceId: string) => `/${instanceId}/${PageNames.pubSub}`,
  analytics: (instanceId: string) => `/${instanceId}/${PageNames.analytics}`,
  slowLog: (instanceId: string) =>
    `/${instanceId}/${PageNames.analytics}/${PageNames.slowLog}`,
  clusterDetails: (instanceId: string) =>
    `/${instanceId}/${PageNames.analytics}/${PageNames.clusterDetails}`,
  databaseAnalysis: (instanceId: string) =>
    `/${instanceId}/${PageNames.analytics}/${PageNames.databaseAnalysis}`,
  // rdi pages
  rdi,
  rdiPipeline: (rdiInstance: string) => `${rdi}/${rdiInstance}`,
  rdiPipelineManagement: (rdiInstance: string) =>
    `${rdi}/${rdiInstance}/${PageNames.rdiPipelineManagement}`,
  rdiPipelineConfig: (rdiInstance: string) =>
    `${rdi}/${rdiInstance}/${PageNames.rdiPipelineManagement}/${PageNames.rdiPipelineConfig}`,
  rdiPipelineJobs: (rdiInstance: string, jobName: string) =>
    `${rdi}/${rdiInstance}/${PageNames.rdiPipelineManagement}/${PageNames.rdiPipelineJobs}/${jobName}`,
  rdiStatistics: (rdiInstance: string) => `${rdi}/${rdiInstance}/statistics`,
}
