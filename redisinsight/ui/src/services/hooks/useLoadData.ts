import { useState, useCallback } from 'react'
import { apiService } from 'uiSrc/services'
import { getUrl } from 'uiSrc/utils'
import { IBulkActionOverview } from 'uiSrc/slices/interfaces'
import { ApiEndpoints } from 'uiSrc/constants'

interface UseLoadDataResult {
  load: (instanceId: string, collection: string) => Promise<IBulkActionOverview>
  loading: boolean
  error: Error | null
}

export const useLoadData = (): UseLoadDataResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(
    async (
      instanceId: string,
      collectionName: string,
    ): Promise<IBulkActionOverview> => {
      setLoading(true)
      setError(null)

      try {
        const { data } = await apiService.post(
          getUrl(
            instanceId,
            ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
          ),
          { collectionName },
        )

        return data
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to import vector collection')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    load: loadData,
    loading,
    error,
  }
}
