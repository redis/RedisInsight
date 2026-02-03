import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { IndexInfoDto } from 'apiSrc/modules/browser/redisearch/dto/index.info.dto'

import {
  IndexInfo,
  UseIndexInfoOptions,
  UseIndexInfoResult,
} from './useIndexInfo.types'
import { transformIndexInfo } from './useIndexInfo.utils'

/**
 * Hook for fetching index information.
 *
 * @param options.indexName - Name of the index to fetch info for
 * @returns { indexInfo, loading, error, refetch }
 */
export const useIndexInfo = ({
  indexName,
}: UseIndexInfoOptions): UseIndexInfoResult => {
  const [indexInfo, setIndexInfo] = useState<IndexInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only selector needed - get instance ID for API URL
  const connectedInstance = useSelector(connectedInstanceSelector)
  const instanceId = connectedInstance?.id

  // Track the current fetch request to ignore stale responses
  const fetchIdRef = useRef(0)

  const fetchIndexInfo = useCallback(async () => {
    if (!instanceId || !indexName) {
      return
    }

    // Increment fetch ID to invalidate any in-flight requests
    const currentFetchId = ++fetchIdRef.current

    setLoading(true)
    setError(null)

    try {
      const { data, status } = await apiService.post<IndexInfoDto>(
        getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO),
        { index: indexName },
      )

      // Ignore response if a newer fetch has been initiated
      if (currentFetchId !== fetchIdRef.current) {
        return
      }

      if (isStatusSuccessful(status)) {
        setIndexInfo(transformIndexInfo(data))
      }
    } catch (err) {
      // Ignore error if a newer fetch has been initiated
      if (currentFetchId !== fetchIdRef.current) {
        return
      }
      setError('Failed to fetch index info')
    } finally {
      // Only update loading state if this is still the current fetch
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false)
      }
    }
  }, [instanceId, indexName])

  useEffect(() => {
    if (indexName) {
      fetchIndexInfo()
    }

    return () => {
      // Invalidate any in-flight request on cleanup
      fetchIdRef.current++
    }
  }, [indexName, fetchIndexInfo])

  return { indexInfo, loading, error, refetch: fetchIndexInfo }
}
