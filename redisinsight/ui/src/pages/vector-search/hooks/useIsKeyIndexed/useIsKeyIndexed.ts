import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeyIndexesResponse } from 'apiSrc/modules/browser/redisearch/dto/key-indexes.dto'

import {
  IndexSummary,
  UseIsKeyIndexedResult,
  UseIsKeyIndexedStatus,
} from './useIsKeyIndexed.types'

const transformResponse = (data: KeyIndexesResponse): IndexSummary[] =>
  (data.indexes || []).map((idx) => ({
    name: idx.name,
    prefixes: idx.prefixes,
    keyType: idx.key_type,
  }))

/**
 * Hook to determine if a given key is covered by one or more search indexes.
 *
 * @param keyName - The key name to check
 * @returns { isIndexed, indexes, status, refresh }
 */
export const useIsKeyIndexed = (keyName: string): UseIsKeyIndexedResult => {
  const [indexes, setIndexes] = useState<IndexSummary[]>([])
  const [status, setStatus] = useState<UseIsKeyIndexedStatus>(
    UseIsKeyIndexedStatus.Idle,
  )

  const connectedInstance = useSelector(connectedInstanceSelector)
  const instanceId = connectedInstance?.id

  const fetchIdRef = useRef(0)
  const cacheRef = useRef<Map<string, IndexSummary[]>>(new Map())

  const fetchKeyIndexes = useCallback(
    async (skipCache = false) => {
      if (!instanceId || !keyName) {
        return
      }

      if (!skipCache) {
        const cached = cacheRef.current.get(keyName)
        if (cached) {
          setIndexes(cached)
          setStatus(UseIsKeyIndexedStatus.Ready)
          return
        }
      }

      const currentFetchId = ++fetchIdRef.current

      setStatus(UseIsKeyIndexedStatus.Loading)

      try {
        const { data, status: httpStatus } =
          await apiService.post<KeyIndexesResponse>(
            getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES),
            { key: keyName },
          )

        if (currentFetchId !== fetchIdRef.current) {
          return
        }

        if (isStatusSuccessful(httpStatus)) {
          const result = transformResponse(data)
          cacheRef.current.set(keyName, result)
          setIndexes(result)
          setStatus(UseIsKeyIndexedStatus.Ready)
        }
      } catch {
        if (currentFetchId !== fetchIdRef.current) {
          return
        }
        setIndexes([])
        setStatus(UseIsKeyIndexedStatus.Error)
      }
    },
    [instanceId, keyName],
  )

  useEffect(() => {
    if (keyName) {
      fetchKeyIndexes()
    } else {
      setIndexes([])
      setStatus(UseIsKeyIndexedStatus.Idle)
    }

    return () => {
      fetchIdRef.current++
    }
  }, [keyName, fetchKeyIndexes])

  const refresh = useCallback(async () => {
    cacheRef.current.delete(keyName)
    await fetchKeyIndexes(true)
  }, [keyName, fetchKeyIndexes])

  return {
    isIndexed: indexes.length > 0,
    indexes,
    status,
    refresh,
  }
}
