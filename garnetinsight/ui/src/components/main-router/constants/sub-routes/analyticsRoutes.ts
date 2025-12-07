import { IRoute, PageNames, Pages } from 'uiSrc/constants'
import ClusterDetailsPage from 'uiSrc/pages/cluster-details'
import SlowLogPage from 'uiSrc/pages/slow-log'
import DatabaseAnalysisPage from 'uiSrc/pages/database-analysis'

export const ANALYTICS_ROUTES: IRoute[] = [
  {
    pageName: PageNames.slowLog,
    path: Pages.slowLog(':instanceId'),
    component: SlowLogPage,
  },
  {
    pageName: PageNames.databaseAnalysis,
    path: Pages.databaseAnalysis(':instanceId'),
    component: DatabaseAnalysisPage,
  },
  {
    pageName: PageNames.clusterDetails,
    path: Pages.clusterDetails(':instanceId'),
    component: ClusterDetailsPage,
  },
]
