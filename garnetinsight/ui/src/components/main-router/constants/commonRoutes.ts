import { lazy } from 'react'
import { IRoute, Pages } from 'uiSrc/constants'
import SettingsPage from 'uiSrc/pages/settings'
import {
  SentinelDatabasesPage,
  SentinelDatabasesResultPage,
  SentinelPage,
} from 'uiSrc/pages/autodiscover-sentinel'

import { LAZY_LOAD } from '../config'

const LazySettingsPage = lazy(() => import('uiSrc/pages/settings'))
const LazySentinelDatabasesPage = lazy(
  () => import('uiSrc/pages/autodiscover-sentinel/sentinel-databases'),
)
const LazySentinelDatabasesResultPage = lazy(
  () => import('uiSrc/pages/autodiscover-sentinel/sentinel-databases-result'),
)
const LazySentinelPage = lazy(
  () => import('uiSrc/pages/autodiscover-sentinel/sentinel'),
)

const ROUTES: IRoute[] = [
  {
    path: Pages.settings,
    component: LAZY_LOAD ? LazySettingsPage : SettingsPage,
  },
  {
    path: Pages.sentinel,
    component: LAZY_LOAD ? LazySentinelPage : SentinelPage,
    routes: [
      {
        path: Pages.sentinelDatabases,
        component: LAZY_LOAD
          ? LazySentinelDatabasesPage
          : SentinelDatabasesPage,
      },
      {
        path: Pages.sentinelDatabasesResult,
        component: LAZY_LOAD
          ? LazySentinelDatabasesResultPage
          : SentinelDatabasesResultPage,
      },
    ],
  },
]

export default ROUTES
