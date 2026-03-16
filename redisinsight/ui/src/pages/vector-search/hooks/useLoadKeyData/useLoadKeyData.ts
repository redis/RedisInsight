import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { IndexField } from '../../components/index-details/IndexDetails.types'
import { parseHashFields, parseJsonValue } from './helpers'
import {
  InferredFieldsResult,
  UseLoadKeyDataResult,
} from './useLoadKeyData.types'

export const useLoadKeyData = (): UseLoadKeyDataResult => {
  const [fields, setFields] = useState<IndexField[]>([])
  const [skippedFields, setSkippedFields] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { encoding } = useSelector(appInfoSelector)

  const loadHashData = useCallback(
    async (key: RedisResponseBuffer): Promise<InferredFieldsResult> => {
      const { data, status } = await apiService.post<{
        fields: Array<{
          field: RedisResponseBuffer
          value: RedisResponseBuffer
        }>
      }>(
        getUrl(instanceId ?? '', ApiEndpoints.HASH_GET_FIELDS),
        { keyName: key, cursor: 0, count: SCAN_COUNT_DEFAULT, match: '*' },
        { params: { encoding } },
      )

      if (!isStatusSuccessful(status)) {
        throw new Error('Failed to load hash fields')
      }

      return parseHashFields(data.fields)
    },
    [instanceId, encoding],
  )

  const loadJsonData = useCallback(
    async (key: RedisResponseBuffer): Promise<InferredFieldsResult> => {
      const { data, status } = await apiService.post<{ data: unknown }>(
        getUrl(instanceId ?? '', ApiEndpoints.REJSON_GET),
        { keyName: key, path: '$', forceRetrieve: true, encoding },
      )

      if (!isStatusSuccessful(status)) {
        throw new Error('Failed to load JSON data')
      }

      return parseJsonValue(data?.data)
    },
    [instanceId, encoding],
  )

  const loadKeyData = useCallback(
    async (key: RedisResponseBuffer, keyType: RedisearchIndexKeyType) => {
      setLoading(true)
      setError(null)
      setFields([])
      setSkippedFields([])

      try {
        const result =
          keyType === RedisearchIndexKeyType.HASH
            ? await loadHashData(key)
            : await loadJsonData(key)

        setFields(result.fields)
        setSkippedFields(result.skippedFields)
      } catch (e) {
        setError(getApiErrorMessage(e as AxiosError))
        setFields([])
        setSkippedFields([])
      } finally {
        setLoading(false)
      }
    },
    [loadHashData, loadJsonData],
  )

  return { loadKeyData, fields, skippedFields, loading, error }
}
