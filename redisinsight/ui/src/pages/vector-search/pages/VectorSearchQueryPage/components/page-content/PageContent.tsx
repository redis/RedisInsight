import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import { QueryResultsProvider } from 'uiSrc/components/query/context/query-results.context'
import { QueryResults } from 'uiSrc/components/query/query-results'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { useSearchResultsTelemetry } from '../../../../hooks'
import { useQuery } from '../../hooks/useQuery'
import { QueryEditorWrapper } from '../../../../components/query-editor'
import { NoSearchResults } from '../../../../components/no-search-results'
import { IndexInfoSidePanel } from '../index-info-side-panel'

import { PageContentProps } from './PageContent.types'
import * as S from './PageContent.styles'

export const PageContent = ({
  isIndexPanelOpen,
  onCloseIndexPanel,
}: PageContentProps) => {
  const { instanceId } = useParams<{ instanceId: string }>()

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
    onQueryDelete,
    onAllQueriesDelete,
    onQueryReRun,
    onQueryProfile,
  } = useQuery()

  const searchTelemetry = useSearchResultsTelemetry()

  const handleSubmit = useCallback(
    (value?: string) => {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
        eventData: {
          databaseId: instanceId,
          commands: [value || query],
        },
      })
      onSubmit(value)
    },
    [instanceId, query, onSubmit],
  )

  const handleAllQueriesDelete = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
      eventData: {
        databaseId: instanceId,
      },
    })
    onAllQueriesDelete()
  }, [instanceId, onAllQueriesDelete])

  return (
    <S.ContentArea>
      <ResizableContainer direction="horizontal">
        <ResizablePanel
          id="editor-results-panel"
          order={1}
          minSize={30}
          defaultSize={isIndexPanelOpen ? 70 : 100}
        >
          <S.EditorResultsArea>
            <ResizableContainer direction="vertical">
              <ResizablePanel
                id="query-editor-panel"
                minSize={10}
                defaultSize={50}
              >
                <QueryEditorWrapper
                  query={query}
                  setQuery={setQuery}
                  onSubmit={handleSubmit}
                />
              </ResizablePanel>

              <ResizablePanelHandle
                direction="horizontal"
                data-test-subj="resize-btn-scripting-area-and-results"
              />

              <ResizablePanel
                id="query-results-panel"
                minSize={10}
                maxSize={90}
                defaultSize={50}
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
                    onQueryDelete={onQueryDelete}
                    onAllQueriesDelete={handleAllQueriesDelete}
                    noResultsPlaceholder={
                      <S.NoResultsWrapper align="center" justify="center">
                        <NoSearchResults />
                      </S.NoResultsWrapper>
                    }
                  />
                </QueryResultsProvider>
              </ResizablePanel>
            </ResizableContainer>
          </S.EditorResultsArea>
        </ResizablePanel>

        {isIndexPanelOpen && (
          <>
            <ResizablePanelHandle
              direction="vertical"
              data-test-subj="resize-btn-index-panel"
            />

            <ResizablePanel
              id="index-info-panel"
              order={2}
              minSize={15}
              defaultSize={30}
            >
              <IndexInfoSidePanel onClose={onCloseIndexPanel} />
            </ResizablePanel>
          </>
        )}
      </ResizableContainer>
    </S.ContentArea>
  )
}
