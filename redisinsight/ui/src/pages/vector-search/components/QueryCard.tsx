import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { isNull } from 'lodash'
import { KeyboardKeys as keys } from 'uiSrc/constants/keys'

import { LoadingContent } from 'uiSrc/components/base/layout'
import {
  DEFAULT_TEXT_VIEW_TYPE,
  ProfileQueryType,
  WBQueryType,
} from 'uiSrc/pages/workbench/constants'
import {
  ResultsMode,
  ResultsSummary,
  RunQueryMode,
} from 'uiSrc/slices/interfaces/workbench'
import {
  getVisualizationsByCommand,
  getWBQueryType,
  isGroupResults,
  isSilentModeWithoutError,
  Maybe,
} from 'uiSrc/utils'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import {
  CommandExecutionResult,
  IPluginVisualization,
} from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import QueryCardHeader, {
  QueryCardHeaderTelemetryEventData,
} from 'uiSrc/components/query/query-card/QueryCardHeader/QueryCardHeader'
import QueryCardCommonResult, {
  CommonErrorResponse,
} from 'uiSrc/components/query/query-card/QueryCardCommonResult'
import QueryCardCliResultWrapper from 'uiSrc/components/query/query-card/QueryCardCliResultWrapper'
import QueryCardCliPlugin from 'uiSrc/components/query/query-card/QueryCardCliPlugin'
import queryStyles from 'uiSrc/components/query/query-card/styles.module.scss'

export interface Props {
  id: string
  command: string
  isOpen: boolean
  result: Maybe<CommandExecutionResult[]>
  activeMode: RunQueryMode
  mode?: RunQueryMode
  activeResultsMode?: ResultsMode
  resultsMode?: ResultsMode
  emptyCommand?: boolean
  summary?: ResultsSummary
  createdAt?: Date
  loading?: boolean
  clearing?: boolean
  isNotStored?: boolean
  executionTime?: number
  db?: number
  hideFields?: string[]
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryOpen: () => void
  onQueryProfile: (type: ProfileQueryType) => void
}

const getDefaultPlugin = (views: IPluginVisualization[], query: string) =>
  getVisualizationsByCommand(query, views).find((view) => view.default)
    ?.uniqId || DEFAULT_TEXT_VIEW_TYPE.id

export const getSummaryText = (
  summary?: ResultsSummary,
  mode?: ResultsMode,
) => {
  if (summary) {
    const { total, success, fail } = summary
    const summaryText = `${total} Command(s) - ${success} success`
    if (!isSilentModeWithoutError(mode, summary?.fail)) {
      return `${summaryText}, ${fail} error(s)`
    }
    return summaryText
  }
  return summary
}

const QueryCard = (props: Props) => {
  const {
    id,
    command = '',
    result,
    activeMode,
    mode,
    activeResultsMode,
    resultsMode,
    summary,
    isOpen,
    createdAt,
    onQueryOpen,
    onQueryDelete,
    onQueryProfile,
    onQueryReRun,
    loading,
    clearing,
    emptyCommand,
    isNotStored,
    executionTime,
    db,
    hideFields,
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [queryType, setQueryType] = useState<WBQueryType>(
    getWBQueryType(command, visualizations),
  )
  const [viewTypeSelected, setViewTypeSelected] =
    useState<WBQueryType>(queryType)
  const [message, setMessage] = useState<string>('')
  const [selectedViewValue, setSelectedViewValue] = useState<string>(
    getDefaultPlugin(visualizations, command || '') || queryType,
  )

  useEffect(() => {
    window.addEventListener('keydown', handleEscFullScreen)
    return () => {
      window.removeEventListener('keydown', handleEscFullScreen)
    }
  }, [isFullScreen])

  const handleEscFullScreen = (event: KeyboardEvent) => {
    if (event.key === keys.ESCAPE && isFullScreen) {
      toggleFullScreen()
    }
  }

  const toggleFullScreen = () => {
    setIsFullScreen((isFull) => {
      sendEventTelemetry({
        event: TelemetryEvent.WORKBENCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: instanceId,
          state: isFull ? 'Close' : 'Open',
        },
      })

      return !isFull
    })
  }

  useEffect(() => {
    setQueryType(getWBQueryType(command, visualizations))
  }, [command])

  useEffect(() => {
    if (visualizations.length) {
      const type = getWBQueryType(command, visualizations)
      setQueryType(type)
      setViewTypeSelected(type)
      setSelectedViewValue(
        getDefaultPlugin(visualizations, command) || queryType,
      )
    }
  }, [visualizations])

  const toggleOpen = () => {
    if (isFullScreen || isSilentModeWithoutError(resultsMode, summary?.fail))
      return

    onQueryOpen()
  }

  const changeViewTypeSelected = (type: WBQueryType, value: string) => {
    setViewTypeSelected(type)
    setSelectedViewValue(value)
  }

  const commonError = CommonErrorResponse(id, command, result)

  const isSizeLimitExceededResponse = (
    result: Maybe<CommandExecutionResult[]>,
  ) => {
    const resultObj = result?.[0]
    // response.includes - to be backward compatible with responses which don't include sizeLimitExceeded flag
    return (
      resultObj?.sizeLimitExceeded === true ||
      resultObj?.response?.includes?.('Results have been deleted')
    )
  }

  const onQueryCopy = ({
    telemetryEventData,
  }: {
    telemetryEventData?: QueryCardHeaderTelemetryEventData
  }) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_COMMAND_COPIED,
      eventData: telemetryEventData,
    })
  }

  return (
    <div
      className={cx(queryStyles.containerWrapper, {
        fullscreen: isFullScreen,
        [queryStyles.isOpen]: isOpen,
      })}
      id={id}
    >
      <div
        className={cx(queryStyles.container)}
        data-testid={`query-card-container-${id}`}
      >
        <QueryCardHeader
          isOpen={isOpen}
          isFullScreen={isFullScreen}
          query={command}
          loading={loading}
          clearing={clearing}
          createdAt={createdAt}
          message={message}
          queryType={queryType}
          selectedValue={selectedViewValue}
          activeMode={activeMode}
          mode={mode}
          resultsMode={resultsMode}
          activeResultsMode={activeResultsMode}
          emptyCommand={emptyCommand}
          summary={summary}
          summaryText={getSummaryText(summary, resultsMode)}
          executionTime={executionTime}
          db={db}
          hideFields={hideFields}
          toggleOpen={toggleOpen}
          toggleFullScreen={toggleFullScreen}
          setSelectedValue={changeViewTypeSelected}
          onQueryDelete={onQueryDelete}
          onQueryReRun={onQueryReRun}
          onQueryProfile={onQueryProfile}
          onQueryCopy={onQueryCopy}
        />
        {isOpen && (
          <>
            {React.isValidElement(commonError) &&
            (!isGroupResults(resultsMode) || isNull(command)) ? (
              <QueryCardCommonResult loading={loading} result={commonError} />
            ) : (
              <>
                {isSizeLimitExceededResponse(result) ? (
                  <QueryCardCliResultWrapper
                    loading={loading}
                    query={command}
                    resultsMode={resultsMode}
                    result={result}
                    isNotStored={isNotStored}
                    isFullScreen={isFullScreen}
                  />
                ) : (
                  <>
                    {isGroupResults(resultsMode) && (
                      <QueryCardCliResultWrapper
                        loading={loading}
                        query={command}
                        db={db}
                        resultsMode={resultsMode}
                        result={result}
                        isNotStored={isNotStored}
                        isFullScreen={isFullScreen}
                        data-testid="group-mode-card"
                      />
                    )}
                    {(resultsMode === ResultsMode.Default || !resultsMode) && (
                      <>
                        {viewTypeSelected === WBQueryType.Plugin && (
                          <>
                            {!loading && result !== undefined ? (
                              <QueryCardCliPlugin
                                id={selectedViewValue}
                                result={result}
                                query={command}
                                mode={mode}
                                setMessage={setMessage}
                                commandId={id}
                              />
                            ) : (
                              <div className={queryStyles.loading}>
                                <LoadingContent
                                  lines={5}
                                  data-testid="loading-content"
                                />
                              </div>
                            )}
                          </>
                        )}
                        {viewTypeSelected === WBQueryType.Text && (
                          <QueryCardCliResultWrapper
                            loading={loading}
                            query={command}
                            resultsMode={resultsMode}
                            result={result}
                            isNotStored={isNotStored}
                            isFullScreen={isFullScreen}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default React.memo(QueryCard)
