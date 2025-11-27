import { minBy, toNumber } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { AutoSizer } from 'react-virtualized'

import { DEFAULT_SLOWLOG_MAX_LEN, DurationUnits } from 'uiSrc/constants'
import { convertNumberByUnits } from 'uiSrc/pages/slow-log/utils'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import {
  clearSlowLogAction,
  fetchSlowLogsAction,
  getSlowLogConfigAction,
  slowLogConfigSelector,
  slowLogSelector,
} from 'uiSrc/slices/analytics/slowlog'
import {
  sendEventTelemetry,
  sendPageViewTelemetry,
  TelemetryEvent,
  TelemetryPageView,
} from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import {
  analyticsSettingsSelector,
  setAnalyticsViewTab,
} from 'uiSrc/slices/analytics/settings'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'

import { FormatedDate } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text, Title } from 'uiSrc/components/base/text'
import { defaultValueRender } from 'uiSrc/components/base/forms/select/RiSelect'
import { SlowLog } from 'apiSrc/modules/slow-log/models'
import { AnalysisPageContainer } from 'uiSrc/pages/database-analysis/components/analysis-page-container'

import { Actions, EmptySlowLog, SlowLogTable } from './components'

import { StyledSelect } from './SlowLogPage.styles'

const HIDE_TIMESTAMP_FROM_WIDTH = 850
const DEFAULT_COUNT_VALUE = '50'
const MAX_COUNT_VALUE = '-1'
const countOptions = [
  { value: '10', inputDisplay: '10' },
  { value: '25', inputDisplay: '25' },
  { value: '50', inputDisplay: '50' },
  { value: '100', inputDisplay: '100' },
  { value: MAX_COUNT_VALUE, inputDisplay: 'Max available' },
]

const SlowLogPage = () => {
  const {
    connectionType,
    name: connectedInstanceName,
    db,
  } = useSelector(connectedInstanceSelector)
  const { data, loading, config } = useSelector(slowLogSelector)
  const { slowLogDurationUnit: durationUnit } = useSelector(appContextDbConfig)
  const { slowlogLogSlowerThan = 0, slowlogMaxLen } = useSelector(
    slowLogConfigSelector,
  )
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { instanceId } = useParams<{ instanceId: string }>()

  const [count, setCount] = useState<string>(DEFAULT_COUNT_VALUE)
  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const dispatch = useDispatch()

  const lastTimestamp = minBy(data, 'time')?.time
  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Slow Log`)

  useEffect(() => {
    getConfig()
    if (viewTab !== AnalyticsViewTab.SlowLog) {
      dispatch(setAnalyticsViewTab(AnalyticsViewTab.SlowLog))
    }
  }, [])

  useEffect(() => {
    getSlowLogs()
  }, [count])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.SLOWLOG_PAGE,
      eventData: {
        databaseId: instanceId,
      },
    })
    setIsPageViewSent(true)
  }

  const getSlowLogs = (maxLen?: number) => {
    const countToSend =
      count === MAX_COUNT_VALUE
        ? maxLen || slowlogMaxLen || DEFAULT_SLOWLOG_MAX_LEN
        : toNumber(count)

    dispatch(
      fetchSlowLogsAction(instanceId, countToSend, (data: SlowLog[]) => {
        sendEventTelemetry({
          event: TelemetryEvent.SLOWLOG_LOADED,
          eventData: {
            databaseId: instanceId,
            numberOfCommands: data.length,
          },
        })
      }),
    )
  }

  const getConfig = () => {
    dispatch(getSlowLogConfigAction(instanceId))
  }

  const onClearSlowLogs = () => {
    dispatch(
      clearSlowLogAction(instanceId, () => {
        sendEventTelemetry({
          event: TelemetryEvent.SLOWLOG_CLEARED,
          eventData: {
            databaseId: instanceId,
          },
        })
      }),
    )
  }

  const isEmptySlowLog = !data.length

  return (
    <AnalysisPageContainer data-testid="slow-log-page">
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ width }}>
            <Row align="center" justify="between">
              <FlexItem>
                <AnalyticsTabs />
              </FlexItem>

              <FlexItem>
                <Row align="center" gap="xl">
                  {connectionType !== ConnectionType.Cluster && config && (
                    <Text size="s" color="secondary" data-testid="config-info">
                      Execution time:{' '}
                      {numberWithSpaces(
                        convertNumberByUnits(
                          slowlogLogSlowerThan,
                          durationUnit,
                        ),
                      )}
                      &nbsp;
                      {durationUnit === DurationUnits.milliSeconds
                        ? DurationUnits.mSeconds
                        : DurationUnits.microSeconds}
                      , Max length: {numberWithSpaces(slowlogMaxLen)}
                    </Text>
                  )}

                  <Actions
                    width={width}
                    isEmptySlowLog={isEmptySlowLog}
                    durationUnit={durationUnit}
                    onClear={onClearSlowLogs}
                    onRefresh={getSlowLogs}
                  />
                </Row>
              </FlexItem>
            </Row>

            <Row align="center" justify="between">
              <FlexItem>
                <Title size="L" color="primary">
                  Slow Log
                </Title>
              </FlexItem>
              <FlexItem>
                <Row align="center" gap="xs">
                  <FlexItem>
                    <Text size="s" color="primary">
                      {connectionType === ConnectionType.Cluster
                        ? 'Display per node:'
                        : 'Display up to:'}
                    </Text>
                  </FlexItem>
                  <FlexItem>
                    <StyledSelect
                      options={countOptions}
                      valueRender={defaultValueRender}
                      value={count}
                      onChange={(value) => setCount(value)}
                      data-testid="count-select"
                    />
                  </FlexItem>
                  {width > HIDE_TIMESTAMP_FROM_WIDTH && (
                    <FlexItem style={{ marginLeft: 12 }}>
                      <Text
                        size="s"
                        color="secondary"
                        data-testid="entries-from-timestamp"
                      >
                        ({data.length} entries
                        {lastTimestamp && (
                          <>
                            <span>&nbsp;from &nbsp;</span>
                            <FormatedDate date={lastTimestamp * 1000} />
                          </>
                        )}
                        )
                      </Text>
                    </FlexItem>
                  )}
                </Row>
              </FlexItem>
            </Row>
          </div>
        )}
      </AutoSizer>
      {isEmptySlowLog ? (
        <EmptySlowLog
          slowlogLogSlowerThan={slowlogLogSlowerThan}
          durationUnit={durationUnit}
        />
      ) : (
        <SlowLogTable
          items={data}
          loading={loading}
          durationUnit={durationUnit}
        />
      )}
    </AnalysisPageContainer>
  )
}

export default SlowLogPage
