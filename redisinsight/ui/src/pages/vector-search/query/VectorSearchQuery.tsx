import React, { Ref, useRef } from 'react'
import {
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import QueryWrapper from 'uiSrc/pages/workbench/components/query'
import WBResultsWrapper from 'uiSrc/pages/workbench/components/wb-results'
import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import {
  StyledNoResultsWrapper,
  StyledResizableContainer,
} from './VectorSearchQuery.styles'
import { HeaderActions } from './HeaderActions'
import { CreateIndexWrapper } from '../create-index/styles'

export const VectorSearchQuery = () => {
  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)

  return (
    <CreateIndexWrapper direction="column" justify="between">
      <HeaderActions />

      <StyledResizableContainer direction="vertical">
        <ResizablePanel id="top-panel" minSize={30} defaultSize={20}>
          <QueryWrapper
            query=""
            activeMode={RunQueryMode.ASCII}
            resultsMode={ResultsMode.Default}
            setQuery={() => {}}
            setQueryEl={() => {}}
            onSubmit={() => {}}
            onQueryChangeMode={() => {}}
            onChangeGroupMode={() => {}}
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
          <WBResultsWrapper
            items={[]}
            clearing={false}
            processing={false}
            isResultsLoaded={true}
            activeMode={RunQueryMode.ASCII}
            activeResultsMode={ResultsMode.Default}
            scrollDivRef={scrollDivRef}
            onQueryReRun={() => {
              console.log('onQueryReRun')
            }}
            onQueryProfile={() => {
              console.log('onQueryProfile')
            }}
            onQueryOpen={() => {
              console.log('onQueryOpen')
            }}
            onQueryDelete={() => {
              console.log('onQueryDelete')
            }}
            onAllQueriesDelete={() => {
              console.log('onAllQueriesDelete')
            }}
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
