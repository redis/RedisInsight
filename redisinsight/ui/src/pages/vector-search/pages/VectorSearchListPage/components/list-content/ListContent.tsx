import React from 'react'

import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'

import { IndexList } from 'uiSrc/pages/vector-search/components/index-list'
import { IndexInfoSidePanel } from 'uiSrc/pages/vector-search/components/index-info-side-panel'
import { useListContent } from 'uiSrc/pages/vector-search/hooks/useListContent'

import * as S from './ListContent.styles'
import { DeleteIndexConfirmation } from '../delete-index-confirmation/DeleteIndexConfirmation'

export const ListContent = () => {
  const {
    data,
    loading,
    actions,
    onQueryClick,
    viewingIndexName,
    onCloseViewPanel,
    pendingDeleteIndex,
    onConfirmDelete,
    onCloseDelete,
  } = useListContent()

  return (
    <S.ContentArea>
      <ResizableContainer direction="horizontal">
        <ResizablePanel
          id="index-list-panel"
          order={1}
          minSize={30}
          defaultSize={viewingIndexName ? 70 : 100}
        >
          <S.TableWrapper>
            <IndexList
              data={data}
              loading={loading}
              onQueryClick={onQueryClick}
              actions={actions}
              dataTestId="vector-search--list--table"
            />
          </S.TableWrapper>
        </ResizablePanel>

        {viewingIndexName && (
          <>
            <ResizablePanelHandle
              direction="vertical"
              data-test-subj="resize-btn-view-index-panel"
            />

            <ResizablePanel
              id="view-index-panel"
              order={2}
              minSize={15}
              defaultSize={30}
            >
              <IndexInfoSidePanel
                indexName={viewingIndexName}
                onClose={onCloseViewPanel}
              />
            </ResizablePanel>
          </>
        )}
      </ResizableContainer>

      <DeleteIndexConfirmation
        isOpen={!!pendingDeleteIndex}
        onConfirm={onConfirmDelete}
        onClose={onCloseDelete}
      />
    </S.ContentArea>
  )
}
