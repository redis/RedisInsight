import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
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
  instanceId: string,
  enabled: boolean = true,
): UseHasExistingKeysResult => {
  const [hasKeys, setHasKeys] = useState(false)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(false)

  const { encoding } = useAppSelector(appInfoSelector)

  const checkForKeys = useCallback(
    async (signal?: AbortSignal) => {
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

  // One scan per (database, encoding) — the guard re-arms when either changes
  const scannedForRef = useRef<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled) return

    if (!instanceId) {
      // Nothing to scan against — fall back to browse mode like any
      // other inconclusive check
      setLoading(false)
      setError(true)
      return
    }

    const scanKey = `${instanceId}:${encoding}`
    if (scannedForRef.current === scanKey) return

    scannedForRef.current = scanKey
    controllerRef.current?.abort()
    controllerRef.current = new AbortController()
    checkForKeys(controllerRef.current.signal)
  }, [enabled, instanceId, encoding, checkForKeys])

  useEffect(
    // Abort the in-flight request on unmount to prevent late state updates
    () => () => {
      controllerRef.current?.abort()
    },
    [],
  )

  return { hasKeys, loading, error }
}
