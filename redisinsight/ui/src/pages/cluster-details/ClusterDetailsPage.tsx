import { orderBy } from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ClusterNodeDetails } from 'src/modules/cluster-monitor/models'

import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  clusterDetailsSelector,
  fetchClusterDetailsAction,
} from 'uiSrc/slices/analytics/clusterDetails'
import {
  analyticsSettingsSelector,
  setAnalyticsViewTab,
} from 'uiSrc/slices/analytics/settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import {
  formatLongName,
  getDbIndex,
  getLetterByIndex,
  Nullable,
  setTitle,
} from 'uiSrc/utils'
import { ColorScheme, getRGBColorByScheme, RGBColor } from 'uiSrc/utils/colors'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { AnalysisPageContainer } from 'uiSrc/pages/database-analysis/components/analysis-page-container'
import {
  ClusterDetailsHeader,
  ClusterDetailsGraphics,
  ClusterNodesTable,
} from './components'
import { Wrapper } from './ClusterDetailsPage.styles'

export interface ModifiedClusterNodes extends ClusterNodeDetails {
  letter: string
  index: number
  color: RGBColor
}

const POLLING_INTERVAL = 5_000

const ClusterDetailsPage = () => {
  let interval: NodeJS.Timeout
  const { instanceId } = useParams<{ instanceId: string }>()
  const {
    db,
    name: connectedInstanceName,
    connectionType,
  } = useSelector(connectedInstanceSelector)
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { loading, data } = useSelector(clusterDetailsSelector)

  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const [nodes, setNodes] = useState<Nullable<ModifiedClusterNodes[]>>(null)

  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Overview`)

  const colorScheme: ColorScheme = {
    cHueStart: 180,
    cHueRange: 140,
    cSaturation: 55,
    cLightness: theme === Theme.Dark ? 45 : 55,
  }

  useEffect(() => {
    if (connectionType !== ConnectionType.Cluster) return

    dispatch(
      fetchClusterDetailsAction(
        instanceId,
        () => {},
        () => clearInterval(interval),
      ),
    )

    if (viewTab !== AnalyticsViewTab.ClusterDetails) {
      dispatch(setAnalyticsViewTab(AnalyticsViewTab.ClusterDetails))
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      interval = setInterval(() => {
        if (document.hidden) return

        dispatch(
          fetchClusterDetailsAction(
            instanceId,
            () => {},
            () => clearInterval(interval),
          ),
        )
      }, POLLING_INTERVAL)
    }
    return () => clearInterval(interval)
  }, [instanceId, loading])

  useEffect(() => {
    if (data) {
      const nodes = orderBy(data.nodes, ['asc', 'host'])
      const shift = colorScheme.cHueRange / nodes.length
      const modifiedNodes = nodes.map((d, index) => ({
        ...d,
        letter: getLetterByIndex(index),
        index,
        color: getRGBColorByScheme(index, shift, colorScheme),
      }))
      setNodes(modifiedNodes)
    }
  }, [data])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.CLUSTER_DETAILS_PAGE,
      eventData: {
        databaseId: instanceId,
      },
    })
    setIsPageViewSent(true)
  }

  return (
    <AnalysisPageContainer data-testid="cluster-details-page">
      <ClusterDetailsHeader />
      <Wrapper>
        <ClusterDetailsGraphics nodes={nodes} loading={loading} />
        <ClusterNodesTable nodes={nodes} loading={loading} />
      </Wrapper>
    </AnalysisPageContainer>
  )
}

export default ClusterDetailsPage
