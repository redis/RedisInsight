import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import {
  deleteRedisearchIndexAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'
import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'
import { ShowIcon, DeleteIcon } from 'uiSrc/components/base/icons'
import { collectManageIndexesDeleteTelemetry } from 'uiSrc/pages/vector-search-deprecated/telemetry'

import { IndexList } from '../../../../components/index-list'
import { IndexListAction } from '../../../../components/index-list/IndexList.types'
import { IndexInfoSidePanel } from '../../../../components/index-info-side-panel'
import { DeleteIndexConfirmation } from '../delete-index-confirmation/DeleteIndexConfirmation'
import { useIndexListData } from '../../../../hooks/useIndexListData'
import { encodeIndexNameForUrl } from '../../../../utils'

import * as S from './ListContent.styles'

export const ListContent = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  const { data: rawIndexes } = useSelector(redisearchListSelector)
  const indexes = useMemo(
    () => rawIndexes.map((index) => bufferToString(index)),
    [rawIndexes],
  )

  const { data, loading } = useIndexListData(indexes)

  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<string | null>(
    null,
  )
  const [viewingIndexName, setViewingIndexName] = useState<string | null>(null)

  const handleQueryClick = useCallback(
    (indexName: string) => {
      history.push(
        Pages.vectorSearchQuery(instanceId, encodeIndexNameForUrl(indexName)),
      )
    },
    [history, instanceId],
  )

  const handleDelete = useCallback((indexName: string) => {
    setPendingDeleteIndex(indexName)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteIndex === null) {
      return
    }

    dispatch(
      deleteRedisearchIndexAction(
        { index: stringToBuffer(pendingDeleteIndex) },
        () => {
          collectManageIndexesDeleteTelemetry({
            instanceId,
          })
        },
      ),
    )
    setPendingDeleteIndex(null)
  }, [dispatch, instanceId, pendingDeleteIndex])

  const handleViewIndex = useCallback((indexName: string) => {
    setViewingIndexName(indexName)
  }, [])

  const handleCloseViewPanel = useCallback(() => {
    setViewingIndexName(null)
  }, [])

  const actions: IndexListAction[] = useMemo(
    () => [
      { name: 'View index', icon: ShowIcon, callback: handleViewIndex },
      {
        name: 'Delete',
        icon: DeleteIcon,
        variant: 'destructive',
        callback: handleDelete,
      },
    ],
    [handleViewIndex, handleDelete],
  )

  return (
    <S.ContentArea>
      <ResizableContainer direction="horizontal">
        <ResizablePanel
          id="index-list-panel"
          order={1}
          minSize={30}
          defaultSize={viewingIndexName !== null ? 70 : 100}
        >
          <S.TableWrapper>
            <IndexList
              data={data}
              loading={loading}
              onQueryClick={handleQueryClick}
              actions={actions}
              dataTestId="vector-search--list--table"
            />
          </S.TableWrapper>
        </ResizablePanel>

        {viewingIndexName !== null && (
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
                onClose={handleCloseViewPanel}
              />
            </ResizablePanel>
          </>
        )}
      </ResizableContainer>

      <DeleteIndexConfirmation
        isOpen={pendingDeleteIndex !== null}
        onConfirm={handleConfirmDelete}
        onClose={() => setPendingDeleteIndex(null)}
      />
    </S.ContentArea>
  )
}
