import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  keyIndexesSelector,
  fetchKeyIndexesAction,
} from 'uiSrc/slices/browser/redisearch'
import { AppDispatch } from 'uiSrc/slices/store'

import {
  UseIsKeyIndexedResult,
  UseIsKeyIndexedStatus,
} from './useIsKeyIndexed.types'

/**
 * Hook to determine if a given key is covered by one or more search indexes.
 * Thin wrapper around Redux state -- dispatches a thunk on mount and reads from the store.
 *
 * @param keyName - The key name to check
 * @returns { isIndexed, indexes, status, refresh }
 */
export const useIsKeyIndexed = (keyName: string): UseIsKeyIndexedResult => {
  const dispatch = useDispatch<AppDispatch>()
  const keyIndexes = useSelector(keyIndexesSelector)
  const entry = keyName ? keyIndexes[keyName] : undefined

  useEffect(() => {
    if (keyName) {
      dispatch(fetchKeyIndexesAction(keyName))
    }
  }, [keyName, dispatch])

  const refresh = useCallback(async () => {
    if (keyName) {
      await dispatch(fetchKeyIndexesAction(keyName, true))
    }
  }, [keyName, dispatch])

  if (!keyName || !entry) {
    return {
      isIndexed: false,
      indexes: [],
      status: UseIsKeyIndexedStatus.Idle,
      refresh,
    }
  }

  let status: UseIsKeyIndexedStatus
  if (entry.loading) {
    status = UseIsKeyIndexedStatus.Loading
  } else if (entry.error) {
    status = UseIsKeyIndexedStatus.Error
  } else {
    status = UseIsKeyIndexedStatus.Ready
  }

  return {
    isIndexed: entry.data.length > 0,
    indexes: entry.data,
    status,
    refresh,
  }
}
