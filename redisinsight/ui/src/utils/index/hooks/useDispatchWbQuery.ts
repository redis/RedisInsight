import { useDispatch } from 'react-redux'
import { sendWbQueryAction } from 'uiSrc/slices/workbench/wb-results'

interface UseDispatchWbQueryOptions {
  afterAll?: () => void
  afterEach?: () => void
  onFail?: () => void
}

export const useDispatchWbQuery = (options?: UseDispatchWbQueryOptions) => {
  const dispatch = useDispatch()

  return (data: string | null | undefined) => {
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
  }
}
