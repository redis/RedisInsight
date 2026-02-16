import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import {
  deleteRedisearchIndexAction,
  fetchRedisearchListAction,
  redisearchListSelector,
} from 'uiSrc/slices/browser/redisearch'

import { IndexList } from '../../../../components/index-list'
import { IndexListAction } from '../../../../components/index-list/IndexList.types'
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

  const handleQueryClick = useCallback(
    (indexName: string) => {
      history.push(Pages.vectorSearchQuery(instanceId, indexName))
    },
    [history, instanceId],
  )

  // TODO: Placeholder method, will be rewoerked later to add confirmation modal and delete index
  const handleDelete = useCallback(
    (indexName: string) => {
      dispatch(
        deleteRedisearchIndexAction(
          { index: stringToBuffer(indexName) },
          () => {
            dispatch(fetchRedisearchListAction())
          },
        ),
      )
    },
    [dispatch],
  )

  const actions: IndexListAction[] = useMemo(
    () => [{ name: 'Delete', callback: handleDelete }], // TODO: Add more actions later (e.g. Browse dataset and View index)
    [handleDelete],
  )

  return (
    <IndexList
      data={data}
      loading={loading}
      onQueryClick={handleQueryClick}
      actions={actions}
      dataTestId="vector-search--list--table"
    />
  )
}
