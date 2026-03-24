import React, { useCallback, useEffect, useState } from 'react'
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
import {
  getWbTsResultPreferences,
  setWbTsResultPreferences,
  REDISTIMESERIES_CHART_ID,
} from 'uiSrc/pages/workbench/utils/tsResultPreferences'

import QueryCardHeader from './QueryCardHeader'
import QueryCardCliResultWrapper from './QueryCardCliResultWrapper'
import QueryCardCliPlugin from './QueryCardCliPlugin'
import QueryCardCommonResult, {
  CommonErrorResponse,
} from './QueryCardCommonResult'

import styles from './styles.module.scss'
import { useQueryResultsContext } from '../context/query-results.context'

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
  onToggleOpen?: (id: string, isOpen: boolean) => void
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryProfile: (type: ProfileQueryType) => void
}

const getDefaultPlugin = (views: IPluginVisualization[], query: string) =>
  getVisualizationsByCommand(query, views).find((view) => view.default)
    ?.uniqId || DEFAULT_TEXT_VIEW_TYPE.id

const hasTimeSeriesVisualization = (
  views: IPluginVisualization[],
  query: string,
): boolean =>
  getVisualizationsByCommand(query, views).some(
    (v) => v.uniqId === REDISTIMESERIES_CHART_ID,
  )

const resolveInitialView = (
  views: IPluginVisualization[],
  query: string,
  instanceId: string,
): { viewType: WBQueryType; selectedValue: string } | null => {
  if (!hasTimeSeriesVisualization(views, query)) {
    return null
  }

  const prefs = getWbTsResultPreferences(instanceId)
  if (!prefs) {
    return null
  }

  if (prefs.selectedView === 'text') {
    return {
      viewType: WBQueryType.Text,
      selectedValue: DEFAULT_TEXT_VIEW_TYPE.id,
    }
  }

  return {
    viewType: WBQueryType.Plugin,
    selectedValue: REDISTIMESERIES_CHART_ID,
  }
}

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
    onToggleOpen,
    onQueryDelete,
    onQueryProfile,
    onQueryReRun,
    loading,
    clearing,
    emptyCommand,
    isNotStored,
    executionTime,
    db,
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [queryType, setQueryType] = useState<WBQueryType>(
    getWBQueryType(command, visualizations),
  )
  const [viewTypeSelected, setViewTypeSelected] = useState<WBQueryType>(() => {
    const iv = resolveInitialView(visualizations, command, instanceId)
    return iv?.viewType ?? getWBQueryType(command, visualizations)
  })
  const [message, setMessage] = useState<string>('')
  const [selectedViewValue, setSelectedViewValue] = useState<string>(() => {
    const iv = resolveInitialView(visualizations, command, instanceId)
    return (
      iv?.selectedValue ??
      getDefaultPlugin(visualizations, command || '') ??
      getWBQueryType(command, visualizations)
    )
  })

  const { telemetry } = useQueryResultsContext()

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
      telemetry.onFullScreenToggled?.({
        databaseId: instanceId,
        state: isFull ? 'Close' : 'Open',
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

      const persisted = resolveInitialView(visualizations, command, instanceId)
      if (persisted) {
        setViewTypeSelected(persisted.viewType)
        setSelectedViewValue(persisted.selectedValue)
      } else {
        setViewTypeSelected(type)
        setSelectedViewValue(
          getDefaultPlugin(visualizations, command) || queryType,
        )
      }
    }
  }, [visualizations])

  const toggleOpen = () => {
    if (isFullScreen || isSilentModeWithoutError(resultsMode, summary?.fail))
      return

    onToggleOpen?.(id, !isOpen)
  }

  const changeViewTypeSelected = useCallback(
    (type: WBQueryType, value: string) => {
      setViewTypeSelected(type)
      setSelectedViewValue(value)

      if (hasTimeSeriesVisualization(visualizations, command)) {
        const selectedView =
          value === REDISTIMESERIES_CHART_ID
            ? ('plugin:redistimeseries-chart' as const)
            : ('text' as const)
        setWbTsResultPreferences(instanceId, { selectedView })
      }
    },
    [visualizations, command, instanceId],
  )

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

  return (
    <div
      className={cx(styles.containerWrapper, {
        fullscreen: isFullScreen,
        [styles.isOpen]: isOpen,
      })}
      id={id}
    >
      <div
        className={cx(styles.container)}
        data-testid={`query-card-container-${id}`}
        data-full-screen={isFullScreen}
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
          toggleOpen={toggleOpen}
          toggleFullScreen={toggleFullScreen}
          setSelectedValue={changeViewTypeSelected}
          onQueryDelete={onQueryDelete}
          onQueryReRun={onQueryReRun}
          onQueryProfile={onQueryProfile}
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
                              <div className={styles.loading}>
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
