import React, { useState } from 'react'
import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import QueryWrapper from 'uiSrc/pages/workbench/components/query'
import { HIDE_FIELDS } from 'uiSrc/components/query/query-card/QueryCardHeader/QueryCardHeader'
import { StyledNoResultsWrapper } from './VectorSearchQuery.styles'
import { useQuery } from './useQuery'
import { HeaderActions } from './HeaderActions'
import CommandsViewWrapper from '../components/commands-view'
import { VectorSearchScreenWrapper } from '../styles'
import { SavedQueriesScreen } from '../saved-queries/SavedQueriesScreen'
import { SavedIndex } from '../saved-queries/types'
import { useParams } from 'react-router-dom'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  collectTelemetryQueryClear,
  collectTelemetryQueryClearAll,
  collectTelemetryQueryRun,
} from '../telemetry'

const mockSavedIndexes: SavedIndex[] = [
  {
    value: 'idx:bikes_vss',
    tags: ['tag', 'text', 'vector'],
    queries: [
      {
        label: 'Search for "Nord" bikes ordered by price',
        value: 'FT.SEARCH idx:bikes_vss "@brand:Nord" SORTBY price ASC',
      },
      {
        label: 'Find road alloy bikes under 20kg',
        value: 'FT.SEARCH idx:bikes_vss "@material:{alloy} @weight:[0 20]"',
      },
    ],
  },
]

export const VectorSearchQuery = () => {
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
    onQueryOpen,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryChangeMode,
    onChangeGroupMode,
    onQueryReRun,
    onQueryProfile,
  } = useQuery()
  const { instanceId } = useParams<{ instanceId: string }>()

  const onQuerySubmit = () => {
    onSubmit()
    collectTelemetryQueryRun({
      instanceId,
      query,
    })
  }

  const [isSavedQueriesOpen, setIsSavedQueriesOpen] = useState<boolean>(false)
  const [isManageIndexesDrawerOpen, setIsManageIndexesDrawerOpen] =
    useState<boolean>(false)
  const [queryIndex, setQueryIndex] = useState(mockSavedIndexes[0].value)
  const selectedIndex = mockSavedIndexes.find(
    (index) => index.value === queryIndex,
  )

  const handleClearResults = () => {
    onAllQueriesDelete()
    collectTelemetryQueryClearAll({
      instanceId,
    })
  }

  const onQueryClear = () => {
    collectTelemetryQueryClear({ instanceId })
  }

  return (
    <VectorSearchScreenWrapper direction="column" justify="between">
      <HeaderActions
        isManageIndexesDrawerOpen={isManageIndexesDrawerOpen}
        setIsManageIndexesDrawerOpen={setIsManageIndexesDrawerOpen}
        isSavedQueriesOpen={isSavedQueriesOpen}
        setIsSavedQueriesOpen={setIsSavedQueriesOpen}
      />

      <ResizableContainer direction="horizontal">
        <ResizablePanel id="left-panel" minSize={20} defaultSize={30}>
          <ResizableContainer direction="vertical">
            <ResizablePanel id="top-panel" minSize={20} defaultSize={30}>
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
              maxSize={70}
              defaultSize={80}
            >
              <CommandsViewWrapper
                items={items}
                clearing={clearing}
                processing={processing}
                isResultsLoaded={isResultsLoaded}
                activeMode={activeMode}
                activeResultsMode={resultsMode}
                scrollDivRef={scrollDivRef}
                hideFields={[HIDE_FIELDS.profiler, HIDE_FIELDS.viewType]}
                onQueryReRun={onQueryReRun}
                onQueryProfile={onQueryProfile}
                onQueryOpen={onQueryOpen}
                onQueryDelete={onQueryDelete}
                onAllQueriesDelete={handleClearResults}
                noResultsPlaceholder={
                  <StyledNoResultsWrapper>
                    TODO: Not sure yet what to put here
                  </StyledNoResultsWrapper>
                }
              />
            </ResizablePanel>
          </ResizableContainer>
        </ResizablePanel>

        {isSavedQueriesOpen && (
          <>
            <ResizablePanelHandle
              direction="vertical"
              data-test-subj="resize-btn-scripting-area-and-results"
            />

            <ResizablePanel id="right-panel" minSize={20} defaultSize={30}>
              <SavedQueriesScreen
                onIndexChange={setQueryIndex}
                onQueryInsert={setQuery}
                savedIndexes={mockSavedIndexes}
                selectedIndex={selectedIndex}
              />
            </ResizablePanel>
          </>
        )}
      </ResizableContainer>
    </VectorSearchScreenWrapper>
  )
}
