import { useState, useEffect, useCallback } from 'react'
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

  const fetchIndexInfo = useCallback(async () => {
    if (!instanceId || !indexName) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, status } = await apiService.post<IndexInfoDto>(
        getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO),
        { index: indexName },
      )

      if (isStatusSuccessful(status)) {
        setIndexInfo(transformIndexInfo(data))
      }
    } catch (err) {
      setError('Failed to fetch index info')
    } finally {
      setLoading(false)
    }
  }, [instanceId, indexName])

  useEffect(() => {
    if (indexName) {
      fetchIndexInfo()
    }
  }, [indexName, fetchIndexInfo])

  return { indexInfo, loading, error, refetch: fetchIndexInfo }
}
