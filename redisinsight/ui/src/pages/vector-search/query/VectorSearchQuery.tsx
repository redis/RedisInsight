import React from 'react'
import {
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import QueryWrapper from 'uiSrc/pages/workbench/components/query'
import { HIDE_FIELDS } from 'uiSrc/components/query/query-card/QueryCardHeader/QueryCardHeader'
import {
  StyledNoResultsWrapper,
  StyledResizableContainer,
} from './VectorSearchQuery.styles'
import { HeaderActions } from './HeaderActions'
import { useQuery } from './useQuery'
import { CreateIndexWrapper } from '../create-index/styles'
import CommandsViewWrapper from '../components/wb-results'

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

  return (
    <CreateIndexWrapper direction="column" justify="between">
      <HeaderActions />

      <StyledResizableContainer direction="vertical">
        <ResizablePanel id="top-panel" minSize={20} defaultSize={30}>
          <QueryWrapper
            query={query}
            activeMode={activeMode}
            resultsMode={resultsMode}
            setQuery={setQuery}
            setQueryEl={() => {}}
            onSubmit={onSubmit}
            onQueryChangeMode={onQueryChangeMode}
            onChangeGroupMode={onChangeGroupMode}
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
            onAllQueriesDelete={onAllQueriesDelete}
            noResultsPlaceholder={
              <StyledNoResultsWrapper>
                TODO: Not sure yet what to put here
              </StyledNoResultsWrapper>
            }
          />
        </ResizablePanel>
      </StyledResizableContainer>
    </CreateIndexWrapper>
  )
}
