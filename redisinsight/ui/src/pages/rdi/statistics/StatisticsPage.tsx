import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { Text } from 'uiSrc/components/base/text'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { getPipelineStatusAction } from 'uiSrc/slices/rdi/pipeline'
import {
  fetchRdiStatistics,
  rdiStatisticsSelector,
} from 'uiSrc/slices/rdi/statistics'
import {
  TelemetryEvent,
  TelemetryPageView,
  sendEventTelemetry,
  sendPageViewTelemetry,
} from 'uiSrc/telemetry'
import { formatLongName, Nullable, setTitle } from 'uiSrc/utils'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { PageNames } from 'uiSrc/constants'
import { Loader } from 'uiSrc/components/base/display'
import {
  type IRdiStatistics,
  type IStatisticsSection,
  RdiPipelineStatus,
  RdiStatisticsViewType,
} from 'uiSrc/slices/interfaces'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { AutoRefresh } from 'uiSrc/components'
import Empty from './empty'
import StatisticsTable from './components/statistics-table'
import StatisticsBlocks from './components/statistics-blocks'
import StatisticsInfo from './components/statistics-info'
import * as S from './StatisticsPage.styles'

const shouldShowStatistics = (data: Nullable<IRdiStatistics>) =>
  data?.status === RdiPipelineStatus.Success && !!data?.data

const renderStatisticsSection = (section: IStatisticsSection) => {
  switch (section.view) {
    case RdiStatisticsViewType.Info:
      return <StatisticsInfo key={section.name} data={section} />
    case RdiStatisticsViewType.Table:
      return <StatisticsTable key={section.name} data={section} />
    case RdiStatisticsViewType.Blocks:
      return <StatisticsBlocks key={section.name} data={section} />
    default:
      return null
  }
}

const StatisticsPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const [lastRefreshTime, setLastRefreshTime] = React.useState(Date.now())

  const dispatch = useDispatch()

  const { loading: isStatisticsLoading, results: statisticsResults } =
    useSelector(rdiStatisticsSelector)
  const { name: connectedRdiInstanceName } = useSelector(
    connectedInstanceSelector,
  )
  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(`${rdiInstanceName} - Pipeline Status`)

  const onRefresh = (section: string) => {
    dispatch(fetchRdiStatistics(rdiInstanceId, section))
  }

  const onRefreshClicked = (section: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId,
        section,
      },
    })
  }

  const onChangeAutoRefresh = (
    section: string,
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED
        : TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId,
        section,
        enableAutoRefresh,
        refreshRate,
      },
    })
  }

  const hideSpinner = () => {
    setPageLoading(false)
  }

  useEffect(() => {
    dispatch(getPipelineStatusAction(rdiInstanceId))
    dispatch(
      fetchRdiStatistics(rdiInstanceId, undefined, hideSpinner, hideSpinner),
    )

    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_STATUS,
      eventData: {
        rdiInstanceId,
      },
    })
  }, [])

  useEffect(
    () => () => {
      // unmount
      dispatch(setLastPageContext(PageNames.rdiStatistics))
    },
    [],
  )

  if (!statisticsResults) {
    return null
  }

  // todo add interface
  if (statisticsResults.status === 'failed') {
    return (
      <Text style={{ margin: '20px auto' }}>
        Unexpected error in your RDI endpoint, please refresh the page
      </Text>
    )
  }

  const sections = statisticsResults.data?.sections || []

  return (
    <S.Container>
      <S.ContentWrapper gap="xxl">
        {pageLoading && (
          <S.LoadingState centered>
            <Loader size="xl" />
          </S.LoadingState>
        )}
        {!shouldShowStatistics(statisticsResults) ? (
          // TODO add loader
          <Empty rdiInstanceId={rdiInstanceId} />
        ) : (
          !pageLoading && (
            <>
              <Row justify="end">
                <FlexItem>
                  <AutoRefresh
                    postfix="processing-performance-info"
                    displayText
                    loading={isStatisticsLoading}
                    lastRefreshTime={lastRefreshTime}
                    enableAutoRefreshDefault
                    testid="processing-performance-info"
                    onRefresh={() => {
                      setLastRefreshTime(Date.now())
                      onRefresh('processing_performance')
                    }}
                    onRefreshClicked={() =>
                      onRefreshClicked('processing_performance')
                    }
                    onEnableAutoRefresh={(
                      enableAutoRefresh: boolean,
                      refreshRate: string,
                    ) =>
                      onChangeAutoRefresh(
                        'processing_performance',
                        enableAutoRefresh,
                        refreshRate,
                      )
                    }
                  />
                </FlexItem>
              </Row>
              {sections.map((section) => renderStatisticsSection(section))}
            </>
          )
        )}
      </S.ContentWrapper>
    </S.Container>
  )
}

export default StatisticsPage
