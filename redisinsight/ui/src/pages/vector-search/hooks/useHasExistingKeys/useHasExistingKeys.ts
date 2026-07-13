import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appInfoSelector } from 'uiSrc/slices/app/info'

interface ScanResponse {
  keys: unknown[]
  total: number
}

export interface UseHasExistingKeysResult {
  hasKeys: boolean
  loading: boolean
}

export const useHasExistingKeys = (): UseHasExistingKeysResult => {
  const [hasKeys, setHasKeys] = useState(false)
  const [loading, setLoading] = useState(true)

  const { pathname } = useLocation()
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)
  const { encoding } = useAppSelector(appInfoSelector)

  const checkForKeys = useCallback(
    async (signal?: AbortSignal) => {
      if (!instanceId) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const types = [KeyTypes.Hash, KeyTypes.ReJSON]

        // The backend scans COUNT=min(2000, count) keys per SCAN iteration
        // and stops once `count` keys are found, the keyspace is exhausted,
        // or its default scanThreshold worth of keys has been scanned.
        const results = await Promise.all(
          types.map((type) =>
            apiService.post<ScanResponse[]>(
              getUrl(instanceId, ApiEndpoints.KEYS),
              {
                cursor: '0',
                count: SCAN_COUNT_DEFAULT,
                type,
                match: '*',
                keysInfo: false,
              },
              { params: { encoding }, signal },
            ),
          ),
        )

        if (signal?.aborted) return

        const foundAny = results.some(({ data, status }) => {
          if (!isStatusSuccessful(status)) return false
          const keys = Array.isArray(data)
            ? data[0]?.keys
            : (data as unknown as ScanResponse)?.keys
          return keys && keys.length > 0
        })

        setHasKeys(foundAny)
      } catch (error) {
        if (signal?.aborted) return
        console.error('Failed to check for existing keys', error)
        setHasKeys(false)
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [instanceId, encoding],
  )

  useEffect(() => {
    // Abort in-flight requests on unmount to prevent state updates after cleanup
    const controller = new AbortController()
    checkForKeys(controller.signal)

    return () => {
      controller.abort()
    }
  }, [checkForKeys, pathname])

  return { hasKeys, loading }
}
