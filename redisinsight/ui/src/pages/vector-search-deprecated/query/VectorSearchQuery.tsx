import React, { useState } from 'react'

import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import QueryWrapper from 'uiSrc/pages/workbench/components/query'
import { QueryResultsProvider } from 'uiSrc/components/query/context/query-results.context'
import { QueryResults } from 'uiSrc/components/query/query-results'
import { StyledNoResultsWrapper } from './VectorSearchQuery.styles'
import { useQuery } from './useQuery'
import { HeaderActions } from './HeaderActions'
import { VectorSearchScreenWrapper } from '../styles'
import { SavedQueriesScreen } from '../saved-queries/SavedQueriesScreen'
import { ManageIndexesScreen } from '../manage-indexes/ManageIndexesScreen'
import {
  collectInsertSavedQueryTelemetry,
  collectTelemetryQueryClear,
  collectTelemetryQueryClearAll,
  collectTelemetryQueryRun,
} from '../telemetry'
import NoDataMessage from '../components/no-data-message/NoDataMessage'
import { NoDataMessageKeys } from '../components/no-data-message/data'
import { useSearchResultsTelemetry } from 'uiSrc/pages/vector-search/hooks'

enum RightPanelType {
  SAVED_QUERIES = 'saved-queries',
  MANAGE_INDEXES = 'manage-indexes',
}

export type VectorSearchQueryProps = {
  instanceId: string
  defaultSavedQueriesIndex?: string
}

export const VectorSearchQuery = ({
  instanceId,
  defaultSavedQueriesIndex,
}: VectorSearchQueryProps) => {
  const {
    query,
    setQuery,
    items,
    clearing,
    processing,
    isResultsLoaded,
    activeMode,
    resultsMode,
    scrollDivRef,
    onSubmit,
    onToggleOpen,
    onQueryOpen,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryChangeMode,
    onChangeGroupMode,
    onQueryReRun,
    onQueryProfile,
  } = useQuery()

  const [rightPanel, setRightPanel] = useState<RightPanelType | null>(
    defaultSavedQueriesIndex ? RightPanelType.SAVED_QUERIES : null,
  )
  const isSavedQueriesOpen = rightPanel === RightPanelType.SAVED_QUERIES

  const onQuerySubmit = (value?: string) => {
    onSubmit(value)
    collectTelemetryQueryRun({
      instanceId,
      query,
    })
  }

  const handleClearResults = () => {
    onAllQueriesDelete()
    collectTelemetryQueryClearAll({
      instanceId,
    })
  }

  const onQueryClear = () => {
    collectTelemetryQueryClear({ instanceId })
  }

  const searchTelemetry = useSearchResultsTelemetry()

  const handleQueryInsert = (query: string) => {
    setQuery(query)

    collectInsertSavedQueryTelemetry({
      instanceId,
    })
  }

  const closeRightPanel = () => {
    setRightPanel(null)
  }

  const toggleManageIndexesScreen = () => {
    setRightPanel(
      rightPanel === RightPanelType.MANAGE_INDEXES
        ? null
        : RightPanelType.MANAGE_INDEXES,
    )
  }

  const toggleSavedQueriesScreen = () => {
    setRightPanel(
      rightPanel === RightPanelType.SAVED_QUERIES
        ? null
        : RightPanelType.SAVED_QUERIES,
    )
  }

  return (
    <VectorSearchScreenWrapper
      direction="column"
      justify="between"
      data-testid="vector-search-query"
    >
      <HeaderActions
        toggleManageIndexesScreen={toggleManageIndexesScreen}
        toggleSavedQueriesScreen={toggleSavedQueriesScreen}
      />

      <ResizableContainer direction="horizontal">
        <ResizablePanel
          id="left-panel"
          minSize={20}
          order={1}
          defaultSize={isSavedQueriesOpen ? 70 : 100}
        >
          <ResizableContainer direction="vertical">
            <ResizablePanel
              id="top-panel"
              minSize={10}
              defaultSize={30}
              data-testid="vector-search-query-editor"
            >
              <QueryWrapper
                query={query}
                activeMode={activeMode}
                resultsMode={resultsMode}
                setQuery={setQuery}
                setQueryEl={() => {}}
                onSubmit={onQuerySubmit}
                onQueryChangeMode={onQueryChangeMode}
                onChangeGroupMode={onChangeGroupMode}
                onClear={onQueryClear}
                queryProps={{ useLiteActions: true }}
              />
            </ResizablePanel>

            <ResizablePanelHandle
              direction="horizontal"
              data-test-subj="resize-btn-scripting-area-and-results"
            />

            <ResizablePanel
              id="bottom-panel"
              minSize={10}
              maxSize={80}
              defaultSize={70}
            >
              <QueryResultsProvider telemetry={searchTelemetry}>
                <QueryResults
                  items={items}
                  clearing={clearing}
                  processing={processing}
                  isResultsLoaded={isResultsLoaded}
                  activeMode={activeMode}
                  activeResultsMode={resultsMode}
                  scrollDivRef={scrollDivRef}
                  onToggleOpen={onToggleOpen}
                  onQueryReRun={onQueryReRun}
                  onQueryProfile={onQueryProfile}
                  onQueryOpen={onQueryOpen}
                  onQueryDelete={onQueryDelete}
                  onAllQueriesDelete={handleClearResults}
                  noResultsPlaceholder={
                    <StyledNoResultsWrapper>
                      <NoDataMessage
                        variant={NoDataMessageKeys.NoQueryResults}
                      />
                    </StyledNoResultsWrapper>
                  }
                />
              </QueryResultsProvider>
            </ResizablePanel>
          </ResizableContainer>
        </ResizablePanel>

        {rightPanel && (
          <>
            <ResizablePanelHandle
              direction="vertical"
              data-test-subj="resize-btn-scripting-area-and-results"
            />

            <ResizablePanel
              id="right-panel"
              order={2}
              minSize={20}
              defaultSize={30}
            >
              {rightPanel === RightPanelType.MANAGE_INDEXES && (
                <ManageIndexesScreen onClose={closeRightPanel} />
              )}

              {rightPanel === RightPanelType.SAVED_QUERIES && (
                <SavedQueriesScreen
                  instanceId={instanceId}
                  defaultSavedQueriesIndex={defaultSavedQueriesIndex}
                  onQueryInsert={handleQueryInsert}
                  onClose={closeRightPanel}
                />
              )}
            </ResizablePanel>
          </>
        )}
      </ResizableContainer>
    </VectorSearchScreenWrapper>
  )
}
