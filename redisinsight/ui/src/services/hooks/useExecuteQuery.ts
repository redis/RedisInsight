import { useCallback } from 'react'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces'
import { executeApiCall } from 'uiSrc/pages/vector-search/query/utils'

export interface UseExecuteQueryOptions {
  afterAll?: () => void
  onFail?: (error?: unknown) => void
}

export const useExecuteQuery = () => {
  return useCallback(
    async (
      instanceId: string,
      data: string | null | undefined,
      _options?: UseExecuteQueryOptions,
    ) => {
      const options = _options || {}
      if (!data) return []

      try {
        const result = await executeApiCall(
          instanceId,
          [data],
          RunQueryMode.ASCII,
          ResultsMode.Default,
        )
        options.afterAll?.()
        return result
      } catch (e) {
        options.onFail?.(e)
        throw e
      }
    },
    [],
  )
}
