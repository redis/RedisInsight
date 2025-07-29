import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { sendWbQueryAction } from 'uiSrc/slices/workbench/wb-results'

export interface UseDispatchWbQueryOptions {
  afterAll?: () => void
  afterEach?: () => void
  onFail?: () => void
}

export const useDispatchWbQuery = () => {
  const dispatch = useDispatch()

  return useCallback(
    (data: string | null | undefined, options?: UseDispatchWbQueryOptions) => {
      if (!data) return

      dispatch(
        sendWbQueryAction(
          data,
          undefined,
          undefined,
          {
            afterAll: options?.afterAll,
            afterEach: options?.afterEach,
          },
          options?.onFail,
        ),
      )
    },
    [dispatch],
  )
}
