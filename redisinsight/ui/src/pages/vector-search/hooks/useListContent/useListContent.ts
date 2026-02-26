import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import {
  deleteRedisearchIndexAction,
  redisearchListSelector,
  setSelectedIndex,
  resetRedisearchKeysData,
} from 'uiSrc/slices/browser/redisearch'
import { changeSearchMode } from 'uiSrc/slices/browser/keys'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import {
  ShowIcon,
  DeleteIcon,
  VectorSearchKeyIcon,
} from 'uiSrc/components/base/icons'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { collectManageIndexesDeleteTelemetry } from 'uiSrc/pages/vector-search-deprecated/telemetry'
import { QueryLibraryService } from 'uiSrc/services/query-library/QueryLibraryService'
import { queryLibraryNotifications } from 'uiSrc/pages/vector-search/constants'
import { localStorageService } from 'uiSrc/services'

import { IndexListAction } from '../../components/index-list/IndexList.types'
import { useIndexListData } from '../useIndexListData'

export const useListContent = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  const { data: rawIndexes } = useSelector(redisearchListSelector)
  const { id: databaseId } = useSelector(connectedInstanceSelector)
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
      history.push(Pages.vectorSearchQuery(instanceId, indexName))
    },
    [history, instanceId],
  )

  const handleViewIndex = useCallback((indexName: string) => {
    setViewingIndexName(indexName)
  }, [])

  const handleCloseViewPanel = useCallback(() => {
    setViewingIndexName(null)
  }, [])

  const handleBrowseDataset = useCallback(
    (indexName: string) => {
      dispatch(changeSearchMode(SearchMode.Redisearch))
      localStorageService.set(
        BrowserStorageItem.browserSearchMode,
        SearchMode.Redisearch,
      )
      dispatch(setSelectedIndex(stringToBuffer(indexName)))
      dispatch(resetRedisearchKeysData())
      dispatch(resetBrowserTree())
      history.push(Pages.browser(instanceId))
    },
    [dispatch, history, instanceId],
  )

  const cleanupQueryLibrary = useCallback(
    async (indexName: string) => {
      try {
        if (databaseId) {
          const queryLibraryService = new QueryLibraryService()
          await queryLibraryService.deleteByIndex(databaseId, indexName)
        }
      } catch {
        dispatch(
          addMessageNotification(queryLibraryNotifications.cleanupFailed()),
        )
      }
    },
    [databaseId, dispatch],
  )

  const handleDelete = useCallback((indexName: string) => {
    setPendingDeleteIndex(indexName)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDeleteIndex) return

    const indexName = pendingDeleteIndex

    dispatch(
      deleteRedisearchIndexAction(
        { index: stringToBuffer(indexName) },
        async () => {
          collectManageIndexesDeleteTelemetry({ instanceId })
          await cleanupQueryLibrary(indexName)
        },
      ),
    )
    setPendingDeleteIndex(null)
  }, [dispatch, cleanupQueryLibrary, instanceId, pendingDeleteIndex])

  const handleCloseDelete = useCallback(() => {
    setPendingDeleteIndex(null)
  }, [])

  const actions: IndexListAction[] = useMemo(
    () => [
      { name: 'View index', icon: ShowIcon, callback: handleViewIndex },
      {
        name: 'Browse dataset',
        icon: VectorSearchKeyIcon,
        callback: handleBrowseDataset,
      },
      {
        name: 'Delete',
        icon: DeleteIcon,
        variant: 'destructive',
        callback: handleDelete,
      },
    ],
    [handleViewIndex, handleBrowseDataset, handleDelete],
  )

  return {
    data,
    loading,
    actions,
    onQueryClick: handleQueryClick,
    viewingIndexName,
    onCloseViewPanel: handleCloseViewPanel,
    pendingDeleteIndex,
    onConfirmDelete: handleConfirmDelete,
    onCloseDelete: handleCloseDelete,
  }
}

export type UseListContentReturn = ReturnType<typeof useListContent>
