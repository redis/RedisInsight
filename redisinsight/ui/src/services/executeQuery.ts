import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces'
import { executeApiCall } from 'uiSrc/pages/vector-search-deprecated/query/utils'

export interface ExecuteQueryOptions {
  afterAll?: () => void
  onFail?: (error?: unknown) => void
}

const executeQuery = async (
  instanceId: string,
  data: string | null | undefined,
  options: ExecuteQueryOptions = {},
): Promise<Awaited<ReturnType<typeof executeApiCall>>> => {
  if (!data) return [] as unknown as Awaited<ReturnType<typeof executeApiCall>>

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
}

export default executeQuery
