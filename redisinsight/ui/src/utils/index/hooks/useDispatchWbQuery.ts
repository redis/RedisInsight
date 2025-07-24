import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { sendWbQueryAction } from 'uiSrc/slices/workbench/wb-results'

interface UseDispatchWbQueryOptions {
  afterAll?: () => void
  afterEach?: () => void
  onFail: () => void
}

export const useDispatchWbQuery = (
  data: string | null | undefined,
  options?: UseDispatchWbQueryOptions,
) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!data) return

    // TODO: Maybe this should use different submit method.
    // THe reasons is the implemen
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
  }, [data, dispatch, options?.afterAll, options?.afterEach, options?.onFail])
}
