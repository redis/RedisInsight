import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
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

  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { encoding } = useSelector(appInfoSelector)

  const checkForKeys = useCallback(async () => {
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
              count: 1,
              type,
              match: '*',
              keysInfo: false,
              scanThreshold: 1,
            },
            { params: { encoding } },
          ),
        ),
      )

      const foundAny = results.some(({ data, status }) => {
        if (!isStatusSuccessful(status)) return false
        const keys = Array.isArray(data)
          ? data[0]?.keys
          : (data as unknown as ScanResponse)?.keys
        return keys && keys.length > 0
      })

      setHasKeys(foundAny)
    } catch {
      setHasKeys(false)
    } finally {
      setLoading(false)
    }
  }, [instanceId, encoding])

  useEffect(() => {
    checkForKeys()
  }, [checkForKeys])

  return { hasKeys, loading }
}
