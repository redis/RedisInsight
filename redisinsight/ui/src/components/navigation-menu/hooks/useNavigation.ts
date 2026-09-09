import { useHistory, useLocation } from 'react-router-dom'
import { useTranslation } from 'uiSrc/i18n'
import { last } from 'lodash'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { useEffect, useState } from 'react'
import { Props as HighlightedFeatureProps } from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { ANALYTICS_ROUTES } from 'uiSrc/components/main-router/constants/sub-routes'
import {
  appFeaturePagesHighlightingSelector,
  removeFeatureFromHighlighting,
} from 'uiSrc/slices/app/features'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { connectedInstanceSelector as connectedRdiInstanceSelector } from 'uiSrc/slices/rdi/instances'

import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { Pages, FeatureFlags, PageNames } from 'uiSrc/constants'

import { appContextSelector } from 'uiSrc/slices/app/context'
import { AppWorkspace } from 'uiSrc/slices/interfaces'
import {
  BrowserIcon,
  PipelineManagementIcon,
  PipelineStatisticsIcon,
  PubSubIcon,
  SlowLogIcon,
  WorkbenchIcon,
  SettingsIcon,
} from 'uiSrc/components/base/icons'
import { INavigations } from '../navigation.types'

const pubSubPath = `/${PageNames.pubSub}`

export function useNavigation() {
  const { t } = useTranslation()
  const history = useHistory()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const [activePage, setActivePage] = useState(Pages.home)

  const { workspace } = useAppSelector(appContextSelector)

  const { id: connectedInstanceId = '' } = useAppSelector(
    connectedInstanceSelector,
  )
  const { id: connectedRdiInstanceId = '' } = useAppSelector(
    connectedRdiInstanceSelector,
  )
  const highlightedPages = useAppSelector(appFeaturePagesHighlightingSelector)

  const isRdiWorkspace = workspace === AppWorkspace.RDI

  useEffect(() => {
    setActivePage(`/${last(location.pathname.split('/'))}`)
  }, [location])

  const handleGoPage = (page: string) => history.push(page)

  const isAnalyticsPath = (activePage: string) =>
    !!ANALYTICS_ROUTES.find(
      ({ path }) => `/${last(path.split('/'))}` === activePage,
    )

  const isPipelineManagementPath = () =>
    location.pathname?.startsWith(
      Pages.rdiPipelineManagement(connectedRdiInstanceId),
    )

  const isVectorSearchPath = () =>
    location.pathname.split('/')[2] === PageNames.vectorSearch

  const getAdditionPropsForHighlighting = (
    pageName: string,
  ): Omit<HighlightedFeatureProps, 'children'> => {
    if (BUILD_FEATURES[pageName]?.asPageFeature) {
      return {
        hideFirstChild: true,
        onClick: () => dispatch(removeFeatureFromHighlighting(pageName)),
        ...BUILD_FEATURES[pageName],
      }
    }

    return {}
  }

  const privateRoutes: INavigations[] = [
    {
      tooltipText: t('navigation.page.browser.tooltip'),
      pageName: PageNames.browser,
      isActivePage: activePage === `/${PageNames.browser}`,
      ariaLabel: t('navigation.page.browser.ariaLabel'),
      onClick: () => handleGoPage(Pages.browser(connectedInstanceId)),
      dataTestId: 'browser-page-btn',
      connectedInstanceId,
      iconType: BrowserIcon,
      onboard: ONBOARDING_FEATURES.BROWSER_PAGE,
    },
    {
      tooltipText: t('navigation.page.search.tooltip'),
      pageName: PageNames.vectorSearch,
      ariaLabel: t('navigation.page.search.ariaLabel'),
      onClick: () => handleGoPage(Pages.vectorSearch(connectedInstanceId)),
      dataTestId: 'vector-search-page-btn',
      connectedInstanceId,
      isActivePage: isVectorSearchPath(),
      iconType: SlowLogIcon,
      onboard: ONBOARDING_FEATURES.VECTOR_SEARCH_PAGE,
    },
    {
      tooltipText: t('navigation.page.workbench.tooltip'),
      pageName: PageNames.workbench,
      ariaLabel: t('navigation.page.workbench.ariaLabel'),
      onClick: () => handleGoPage(Pages.workbench(connectedInstanceId)),
      dataTestId: 'workbench-page-btn',
      connectedInstanceId,
      isActivePage: activePage === `/${PageNames.workbench}`,
      iconType: WorkbenchIcon,
      onboard: ONBOARDING_FEATURES.WORKBENCH_PAGE,
    },
    {
      tooltipText: t('navigation.page.analyze.tooltip'),
      pageName: PageNames.analytics,
      ariaLabel: t('navigation.page.analyze.ariaLabel'),
      onClick: () => handleGoPage(Pages.analytics(connectedInstanceId)),
      dataTestId: 'analytics-page-btn',
      connectedInstanceId,
      isActivePage: isAnalyticsPath(activePage),
      iconType: SlowLogIcon,
      featureFlag: FeatureFlags.envDependent,
    },
    {
      tooltipText: t('navigation.page.pubSub.tooltip'),
      pageName: PageNames.pubSub,
      ariaLabel: t('navigation.page.pubSub.ariaLabel'),
      onClick: () => handleGoPage(Pages.pubSub(connectedInstanceId)),
      dataTestId: 'pub-sub-page-btn',
      connectedInstanceId,
      isActivePage: activePage === pubSubPath,
      iconType: PubSubIcon,
      onboard: ONBOARDING_FEATURES.PUB_SUB_PAGE,
      featureFlag: FeatureFlags.envDependent,
    },
  ].filter((tab) => !!tab) as INavigations[]

  const privateRdiRoutes: INavigations[] = [
    {
      tooltipText: t('navigation.page.pipeline.tooltip'),
      pageName: PageNames.rdiPipelineManagement,
      ariaLabel: t('navigation.page.pipeline.ariaLabel'),
      onClick: () =>
        handleGoPage(Pages.rdiPipelineManagement(connectedRdiInstanceId)),
      dataTestId: 'pipeline-management-page-btn',
      isActivePage: isPipelineManagementPath(),
      iconType: PipelineManagementIcon,
    },
    {
      tooltipText: t('navigation.page.statistics.tooltip'),
      pageName: PageNames.rdiStatistics,
      ariaLabel: t('navigation.page.statistics.ariaLabel'),
      onClick: () => handleGoPage(Pages.rdiStatistics(connectedRdiInstanceId)),
      dataTestId: 'pipeline-status-page-btn',
      isActivePage: activePage === `/${PageNames.rdiStatistics}`,
      iconType: PipelineStatisticsIcon,
    },
  ]

  const publicRoutes: INavigations[] = [
    {
      tooltipText: t('navigation.page.settings.tooltip'),
      pageName: PageNames.settings,
      ariaLabel: t('navigation.page.settings.ariaLabel'),
      onClick: () => handleGoPage(Pages.settings),
      dataTestId: 'settings-page-btn',
      isActivePage: activePage === Pages.settings,
      iconType: SettingsIcon,
      featureFlag: FeatureFlags.envDependent,
    },
  ]

  return {
    isRdiWorkspace,
    privateRoutes,
    privateRdiRoutes,
    publicRoutes,
    getAdditionPropsForHighlighting,
    highlightedPages,
    activePage,
    setActivePage,
    handleGoPage,
    connectedInstanceId,
    connectedRdiInstanceId,
  }
}
