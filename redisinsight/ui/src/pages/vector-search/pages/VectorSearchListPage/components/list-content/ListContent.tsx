import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import {
  deleteRedisearchIndexAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'
import { collectManageIndexesDeleteTelemetry } from 'uiSrc/pages/vector-search-deprecated/telemetry'

import { IndexList } from '../../../../components/index-list'
import { IndexListAction } from '../../../../components/index-list/IndexList.types'
import { DeleteIndexConfirmation } from '../delete-index-confirmation/DeleteIndexConfirmation'
import { useIndexListData } from '../../../../hooks/useIndexListData'

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

  const handleQueryClick = useCallback(
    (indexName: string) => {
      history.push(Pages.vectorSearchQuery(instanceId, indexName))
    },
    [history, instanceId],
  )

  const handleDelete = useCallback((indexName: string) => {
    setPendingDeleteIndex(indexName)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDeleteIndex) return

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

  const actions: IndexListAction[] = useMemo(
    () => [{ name: 'Delete', callback: handleDelete }],
    [handleDelete],
  )

  return (
    <>
      <IndexList
        data={data}
        loading={loading}
        onQueryClick={handleQueryClick}
        actions={actions}
        dataTestId="vector-search--list--table"
      />
      <DeleteIndexConfirmation
        isOpen={!!pendingDeleteIndex}
        onConfirm={handleConfirmDelete}
        onClose={() => setPendingDeleteIndex(null)}
      />
    </>
  )
}
