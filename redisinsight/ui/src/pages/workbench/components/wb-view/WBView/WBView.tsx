import React, { Ref, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import { Nullable } from 'uiSrc/utils'
import {
  setWorkbenchVerticalPanelSizes,
  appContextWorkbench,
} from 'uiSrc/slices/app/context'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { CodeButtonParams } from 'uiSrc/constants'

import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import { QueryResultsProvider } from 'uiSrc/components/query/context/query-results.context'
import { QueryResults } from 'uiSrc/components/query/query-results'
import { toggleOpenWBResult } from 'uiSrc/slices/workbench/wb-results'
import QueryWrapper from '../../query'
import { useWorkbenchResultsTelemetry } from '../../../hooks/useWorkbenchResultsTelemetry'
import WbNoResultsMessage from '../../wb-no-results-message'

import styles from './styles.module.scss'

const verticalPanelIds = {
  firstPanelId: 'scriptingArea',
  secondPanelId: 'resultsArea',
}

export interface Props {
  script: string
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  isResultsLoaded: boolean
  setScript: (script: string) => void
  setScriptEl: Function
  scrollDivRef: Ref<HTMLDivElement>
  activeMode: RunQueryMode
  resultsMode: ResultsMode
  onSubmit: (
    query?: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams,
  ) => void
  onQueryOpen: (commandId?: string) => void
  onQueryDelete: (commandId: string) => void
  onAllQueriesDelete: () => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
}

const WBView = (props: Props) => {
  const {
    script = '',
    items,
    clearing,
    processing,
    setScript,
    setScriptEl,
    activeMode,
    resultsMode,
    isResultsLoaded,
    onSubmit,
    onQueryOpen,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryChangeMode,
    onChangeGroupMode,
    scrollDivRef,
  } = props

  const { panelSizes } = useSelector(appContextWorkbench)
  const telemetry = useWorkbenchResultsTelemetry()

  const verticalPanelSizesRef = useRef(panelSizes)

  const dispatch = useDispatch()

  useEffect(
    () => () => {
      dispatch(setWorkbenchVerticalPanelSizes(verticalPanelSizesRef.current))
    },
    [],
  )

  const onVerticalPanelWidthChange = useCallback((newSizes: any) => {
    verticalPanelSizesRef.current = newSizes
  }, [])

  const handleToggleOpen = useCallback(
    (id: string, isOpen: boolean) => {
      dispatch(toggleOpenWBResult(id))

      const item = items.find((i) => i.id === id)
      if (isOpen && !item?.result) {
        onQueryOpen(id)
      }
    },
    [dispatch, items, onQueryOpen],
  )

  const handleSubmit = (value?: string) => {
    onSubmit(value)
  }

  const handleReRun = (
    query?: string,
    commandId?: Nullable<string>,
    executeParams: CodeButtonParams = {},
  ) => {
    onSubmit(query, commandId, executeParams)
  }

  const handleProfile = (
    query?: string,
    commandId?: Nullable<string>,
    executeParams: CodeButtonParams = {},
  ) => {
    onSubmit(query, commandId, executeParams)
  }

  return (
    <div className={cx('workbenchPage', styles.container)}>
      <div className={styles.main}>
        <div className={styles.content}>
          <ResizableContainer
            onLayout={onVerticalPanelWidthChange}
            direction="vertical"
          >
            <ResizablePanel
              id={verticalPanelIds.firstPanelId}
              minSize={30}
              className={styles.queryPanel}
              defaultSize={panelSizes && panelSizes[0] ? panelSizes[0] : 20}
            >
              <QueryWrapper
                query={script}
                activeMode={activeMode}
                resultsMode={resultsMode}
                setQuery={setScript}
                setQueryEl={setScriptEl}
                onSubmit={handleSubmit}
                onQueryChangeMode={onQueryChangeMode}
                onChangeGroupMode={onChangeGroupMode}
              />
            </ResizablePanel>

            <ResizablePanelHandle
              direction="horizontal"
              data-test-subj="resize-btn-scripting-area-and-results"
            />

            <ResizablePanel
              id={verticalPanelIds.secondPanelId}
              minSize={10}
              maxSize={70}
              defaultSize={panelSizes && panelSizes[1] ? panelSizes[1] : 80}
              className={cx(styles.queryResults, styles.queryResultsPanel)}
            >
              <QueryResultsProvider telemetry={telemetry}>
                <QueryResults
                  items={items}
                  clearing={clearing}
                  processing={processing}
                  isResultsLoaded={isResultsLoaded}
                  activeMode={activeMode}
                  activeResultsMode={resultsMode}
                  scrollDivRef={scrollDivRef}
                  onToggleOpen={handleToggleOpen}
                  onQueryReRun={handleReRun}
                  onQueryProfile={handleProfile}
                  onQueryDelete={onQueryDelete}
                  onAllQueriesDelete={onAllQueriesDelete}
                  noResultsPlaceholder={<WbNoResultsMessage />}
                />
              </QueryResultsProvider>
            </ResizablePanel>
          </ResizableContainer>
        </div>
      </div>
    </div>
  )
}

export default WBView
