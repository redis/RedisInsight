import { useCallback, useState } from 'react'
import { useLoadData } from 'uiSrc/services/hooks/useLoadData'
import { getStaticAssetPath } from 'uiSrc/utils/pathUtil'
import { useDispatchWbQuery } from 'uiSrc/services/hooks/useDispatchWbQuery'
import { generateFtCreateCommand } from 'uiSrc/utils/index/generateFtCreateCommand'
import { CreateSearchIndexParameters, PresetDataType } from '../types'

interface UseCreateIndexResult {
  run: (params: CreateSearchIndexParameters) => Promise<void>
  loading: boolean
  error: Error | null
  success: boolean
}

const staticFilePathByPresetDataChoiceMap = {
  [PresetDataType.BIKES]: getStaticAssetPath('preset-data/bikes.txt'),
}

export const useCreateIndex = (): UseCreateIndexResult => {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  // TODO: handle data file errors as well

  const dispatchBulkInsert = useDispatchWbQuery()
  const dispatchCreateIndex = useDispatchWbQuery()

  const { load } = useLoadData()

  const run = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_params: CreateSearchIndexParameters) => {
      setSuccess(false)
      setError(null)
      setLoading(true)

      try {
        const filePath =
          staticFilePathByPresetDataChoiceMap[PresetDataType.BIKES]
        const fileData = await load(filePath)

        await new Promise<void>((resolve, reject) => {
          dispatchBulkInsert(fileData, {
            afterAll: resolve,
            onFail: reject,
          })
        })

        await new Promise<void>((resolve, reject) => {
          dispatchCreateIndex(generateFtCreateCommand(), {
            afterAll: () => {
              setSuccess(true)
              resolve()
            },
            onFail: reject,
          })
        })
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)))
      } finally {
        setLoading(false)
      }
    },
    [load, dispatchBulkInsert, dispatchCreateIndex],
  )

  return {
    run,
    loading,
    error,
    success,
  }
}
