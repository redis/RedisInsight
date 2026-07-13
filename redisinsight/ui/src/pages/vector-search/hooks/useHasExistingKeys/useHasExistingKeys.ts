import { useCallback, useEffect, useState } from 'react'
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
  cursor: number
}

export interface UseHasExistingKeysResult {
  hasKeys: boolean
  loading: boolean
  error: boolean
}

export const useHasExistingKeys = (
  enabled: boolean = true,
): UseHasExistingKeysResult => {
  const [hasKeys, setHasKeys] = useState(false)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(false)

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

        // The endpoint returns one entry per cluster node — check them all.
        // A scan stopped at the threshold (cursor !== 0) is inconclusive,
        // not an empty database, so it counts as having keys.
        const foundAny = results.some(({ data, status }) => {
          if (!isStatusSuccessful(status)) return false
          const nodes = Array.isArray(data)
            ? data
            : [data as unknown as ScanResponse]
          return nodes.some(
            (node) => !!node?.keys?.length || node?.cursor !== 0,
          )
        })

        setHasKeys(foundAny)
        setError(results.some(({ status }) => !isStatusSuccessful(status)))
      } catch (err) {
        if (signal?.aborted) return
        console.error('Failed to check for existing keys', err)
        setHasKeys(false)
        setError(true)
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [instanceId, encoding],
  )

  useEffect(() => {
    if (!enabled) return undefined

    // Abort in-flight requests on unmount to prevent state updates after cleanup
    const controller = new AbortController()
    checkForKeys(controller.signal)

    return () => {
      controller.abort()
    }
  }, [enabled, checkForKeys])

  return { hasKeys, loading, error }
}
