import { lazy } from 'react'
import { IRoute, FeatureFlags, PageNames, Pages } from 'uiSrc/constants'
import {
  BrowserPage,
  HomePage,
  InstancePage,
  RedisCloudDatabasesPage,
  RedisCloudDatabasesResultPage,
  RedisCloudPage,
  RedisCloudSubscriptionsPage,
  RedisClusterDatabasesPage,
  AzurePage,
  AzureSubscriptionsPage,
  AzureDatabasesPage,
} from 'uiSrc/pages'
import { VectorSearchPageRouterDeprecated } from 'uiSrc/pages/vector-search-deprecated'
import { VectorSearchPageRouter } from 'uiSrc/pages/vector-search'
import WorkbenchPage from 'uiSrc/pages/workbench'
import PubSubPage from 'uiSrc/pages/pub-sub'
import AnalyticsPage from 'uiSrc/pages/analytics'
import RdiPage from 'uiSrc/pages/rdi/home'
import RdiInstancePage from 'uiSrc/pages/rdi/instance'
import RdiStatisticsPage from 'uiSrc/pages/rdi/statistics'
import PipelineManagementPage from 'uiSrc/pages/rdi/pipeline-management'
import { ANALYTICS_ROUTES, RDI_PIPELINE_MANAGEMENT_ROUTES } from './sub-routes'
import COMMON_ROUTES from './commonRoutes'
import { getRouteIncludedByEnv, LAZY_LOAD } from '../config'
import {
  VECTOR_SEARCH_ROUTES,
  VECTOR_SEARCH_DEPRECATED_ROUTES,
} from './sub-routes/vectorSearchRoutes'

const LazyBrowserPage = lazy(() => import('uiSrc/pages/browser'))
const LazyVectorSearchPageRouter = lazy(
  () => import('uiSrc/pages/vector-search/VectorSearchPageRouter'),
)
const LazyVectorSearchPageRouterDeprecated = lazy(
  () =>
    import('uiSrc/pages/vector-search-deprecated/pages/VectorSearchPageRouter'),
)
const LazyHomePage = lazy(() => import('uiSrc/pages/home'))
const LazyWorkbenchPage = lazy(() => import('uiSrc/pages/workbench'))
const LazyPubSubPage = lazy(() => import('uiSrc/pages/pub-sub'))
const LazyInstancePage = lazy(() => import('uiSrc/pages/instance'))
const LazyRedisCloudDatabasesPage = lazy(
  () => import('uiSrc/pages/autodiscover-cloud/redis-cloud-databases'),
)
const LazyRedisCloudDatabasesResultPage = lazy(
  () => import('uiSrc/pages/autodiscover-cloud/redis-cloud-databases-result'),
)
const LazyRedisCloudSubscriptionsPage = lazy(
  () => import('uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions'),
)
const LazyRedisClusterDatabasesPage = lazy(
  () => import('uiSrc/pages/redis-cluster'),
)
const LazyAnalyticsPage = lazy(() => import('uiSrc/pages/analytics'))
const LazyRedisCloudPage = lazy(
  () => import('uiSrc/pages/autodiscover-cloud/redis-cloud'),
)
const LazyAzurePage = lazy(() => import('uiSrc/pages/autodiscover-azure/azure'))
const LazyAzureSubscriptionsPage = lazy(
  () => import('uiSrc/pages/autodiscover-azure/azure-subscriptions'),
)
const LazyAzureDatabasesPage = lazy(
  () => import('uiSrc/pages/autodiscover-azure/azure-databases'),
)
const LazyRdiPage = lazy(() => import('uiSrc/pages/rdi/home'))
const LazyRdiInstancePage = lazy(() => import('uiSrc/pages/rdi/instance'))
const LazyRdiStatisticsPage = lazy(() => import('uiSrc/pages/rdi/statistics'))
const LazyPipelineManagementPage = lazy(
  () => import('uiSrc/pages/rdi/pipeline-management'),
)

const INSTANCE_ROUTES: IRoute[] = [
  {
    pageName: PageNames.browser,
    path: Pages.browser(':instanceId'),
    component: LAZY_LOAD ? LazyBrowserPage : BrowserPage,
  },
  // Deprecated vector search route - manual access to old implementation
  {
    pageName: PageNames.vectorSearchDeprecated,
    path: Pages.vectorSearchDeprecated(':instanceId'),
    component: LAZY_LOAD
      ? LazyVectorSearchPageRouterDeprecated
      : VectorSearchPageRouterDeprecated,
    routes: VECTOR_SEARCH_DEPRECATED_ROUTES,
  },
  // New vector search route - behind feature flag
  {
    pageName: PageNames.vectorSearch,
    path: Pages.vectorSearch(':instanceId'),
    component: LAZY_LOAD ? LazyVectorSearchPageRouter : VectorSearchPageRouter,
    routes: VECTOR_SEARCH_ROUTES,
    featureFlag: FeatureFlags.vectorSearch,
  },
  {
    pageName: PageNames.workbench,
    path: Pages.workbench(':instanceId'),
    component: LAZY_LOAD ? LazyWorkbenchPage : WorkbenchPage,
  },
  {
    pageName: PageNames.pubSub,
    path: Pages.pubSub(':instanceId'),
    component: LAZY_LOAD ? LazyPubSubPage : PubSubPage,
    featureFlag: FeatureFlags.envDependent,
  },
  ...getRouteIncludedByEnv([
    {
      path: Pages.analytics(':instanceId'),
      component: LAZY_LOAD ? LazyAnalyticsPage : AnalyticsPage,
      routes: ANALYTICS_ROUTES,
    },
  ]),
]

const RDI_INSTANCE_ROUTES: IRoute[] = getRouteIncludedByEnv([
  {
    path: Pages.rdiStatistics(':rdiInstanceId'),
    component: LAZY_LOAD ? LazyRdiStatisticsPage : RdiStatisticsPage,
  },
  {
    path: Pages.rdiPipelineManagement(':rdiInstanceId'),
    component: LAZY_LOAD ? LazyPipelineManagementPage : PipelineManagementPage,
    routes: RDI_PIPELINE_MANAGEMENT_ROUTES,
  },
])

const ROUTES: IRoute[] = [
  ...getRouteIncludedByEnv([
    {
      path: Pages.home,
      exact: true,
      component: LAZY_LOAD ? LazyHomePage : HomePage,
      isAvailableWithoutAgreements: true,
      featureFlag: FeatureFlags.envDependent,
    },
    ...COMMON_ROUTES,
    {
      path: Pages.redisEnterpriseAutodiscovery,
      component: LAZY_LOAD
        ? LazyRedisClusterDatabasesPage
        : RedisClusterDatabasesPage,
    },
    {
      path: Pages.redisCloud,
      component: LAZY_LOAD ? LazyRedisCloudPage : RedisCloudPage,
      routes: [
        {
          path: Pages.redisCloudSubscriptions,
          component: LAZY_LOAD
            ? LazyRedisCloudSubscriptionsPage
            : RedisCloudSubscriptionsPage,
        },
        {
          path: Pages.redisCloudDatabases,
          component: LAZY_LOAD
            ? LazyRedisCloudDatabasesPage
            : RedisCloudDatabasesPage,
        },
        {
          path: Pages.redisCloudDatabasesResult,
          component: LAZY_LOAD
            ? LazyRedisCloudDatabasesResultPage
            : RedisCloudDatabasesResultPage,
        },
      ],
    },
    {
      path: Pages.azure,
      component: LAZY_LOAD ? LazyAzurePage : AzurePage,
      routes: [
        {
          path: Pages.azureSubscriptions,
          component: LAZY_LOAD
            ? LazyAzureSubscriptionsPage
            : AzureSubscriptionsPage,
        },
        {
          path: Pages.azureDatabases,
          component: LAZY_LOAD ? LazyAzureDatabasesPage : AzureDatabasesPage,
        },
      ],
    },
    {
      path: Pages.rdi,
      component: LAZY_LOAD ? LazyRdiPage : RdiPage,
      exact: true,
      featureFlag: FeatureFlags.rdi,
    },
    {
      path: Pages.rdiPipeline(':rdiInstanceId'),
      component: LAZY_LOAD ? LazyRdiInstancePage : RdiInstancePage,
      routes: RDI_INSTANCE_ROUTES,
      featureFlag: FeatureFlags.rdi,
    },
  ]),
  {
    path: '/:instanceId',
    component: LAZY_LOAD ? LazyInstancePage : InstancePage,
    routes: INSTANCE_ROUTES,
  },
]

export default ROUTES
