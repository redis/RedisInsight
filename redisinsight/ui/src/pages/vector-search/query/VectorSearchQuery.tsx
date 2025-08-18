import React, { useState } from 'react'

import QueryWrapper from 'uiSrc/pages/workbench/components/query'
import { HIDE_FIELDS } from 'uiSrc/components/query/query-card/QueryCardHeader/QueryCardHeader'
import { StyledNoResultsWrapper } from './VectorSearchQuery.styles'
import { useQuery } from './useQuery'
import { HeaderActions } from './HeaderActions'
import CommandsViewWrapper from '../components/commands-view'
import { VectorSearchScreenWrapper } from '../styles'
import { SavedQueriesScreen } from '../saved-queries/SavedQueriesScreen'
import { SavedIndex } from '../saved-queries/types'
import { PresetDataType } from '../create-index/types'
import {
  collectChangedSavedQueryIndexTelemetry,
  collectInsertSavedQueryTelemetry,
  collectTelemetryQueryClear,
  collectTelemetryQueryClearAll,
  collectTelemetryQueryRun,
} from '../telemetry'
import {
  ViewMode,
  ViewModeContextProvider,
} from 'uiSrc/components/query/context/view-mode.context'
import {
  RiResizableContainer,
  RiResizablePanelHandle,
  RiResizablePanel,
} from 'uiBase/layout'

const mockSavedIndexes: SavedIndex[] = [
  {
    value: PresetDataType.BIKES,
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

export type VectorSearchQueryProps = {
  instanceId: string
  openSavedQueriesPanel?: boolean
}

export const VectorSearchQuery = ({
  instanceId,
  openSavedQueriesPanel = false,
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
    onQueryOpen,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryChangeMode,
    onChangeGroupMode,
    onQueryReRun,
    onQueryProfile,
  } = useQuery()

  const [isSavedQueriesOpen, setIsSavedQueriesOpen] = useState<boolean>(
    openSavedQueriesPanel,
  )
  const [isManageIndexesDrawerOpen, setIsManageIndexesDrawerOpen] =
    useState<boolean>(false)
  const [queryIndex, setQueryIndex] = useState(mockSavedIndexes[0].value)
  const selectedIndex = mockSavedIndexes.find(
    (index) => index.value === queryIndex,
  )

  const onQuerySubmit = () => {
    onSubmit()
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

  const handleIndexChange = (value: string) => {
    setQueryIndex(value)

    collectChangedSavedQueryIndexTelemetry({
      instanceId,
    })
  }

  const handleQueryInsert = (query: string) => {
    setQuery(query)

    collectInsertSavedQueryTelemetry({
      instanceId,
    })
  }

  return (
    <ViewModeContextProvider viewMode={ViewMode.VectorSearch}>
      <VectorSearchScreenWrapper direction="column" justify="between">
        <HeaderActions
          isManageIndexesDrawerOpen={isManageIndexesDrawerOpen}
          setIsManageIndexesDrawerOpen={setIsManageIndexesDrawerOpen}
          isSavedQueriesOpen={isSavedQueriesOpen}
          setIsSavedQueriesOpen={setIsSavedQueriesOpen}
        />

        <RiResizableContainer direction="horizontal">
          <RiResizablePanel
            id="left-panel"
            minSize={20}
            order={1}
            defaultSize={isSavedQueriesOpen ? 70 : 100}
          >
            <RiResizableContainer direction="vertical">
              <RiResizablePanel id="top-panel" minSize={10} defaultSize={30}>
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
              </RiResizablePanel>

              <RiResizablePanelHandle
                direction="horizontal"
                data-test-subj="resize-btn-scripting-area-and-results"
              />

              <RiResizablePanel
                id="bottom-panel"
                minSize={10}
                maxSize={80}
                defaultSize={70}
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
                      The calm before the output
                    </StyledNoResultsWrapper>
                  }
                />
              </RiResizablePanel>
            </RiResizableContainer>
          </RiResizablePanel>

          {isSavedQueriesOpen && (
            <>
              <RiResizablePanelHandle
                direction="vertical"
                data-test-subj="resize-btn-scripting-area-and-results"
              />

              <RiResizablePanel
                id="right-panel"
                order={2}
                minSize={20}
                defaultSize={30}
              >
                <SavedQueriesScreen
                  onIndexChange={handleIndexChange}
                  onQueryInsert={handleQueryInsert}
                  savedIndexes={mockSavedIndexes}
                  selectedIndex={selectedIndex}
                />
              </RiResizablePanel>
            </>
          )}
        </RiResizableContainer>
      </VectorSearchScreenWrapper>
    </ViewModeContextProvider>
  )
}
