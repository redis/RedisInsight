import { useCallback, useState } from 'react'
import { useLoadData, useDispatchWbQuery } from 'uiSrc/services/hooks'
import { generateFtCreateCommand } from 'uiSrc/utils/index/generateFtCreateCommand'
import { CreateSearchIndexParameters, PresetDataType } from '../types'

interface UseCreateIndexResult {
  run: (params: CreateSearchIndexParameters) => Promise<void>
  loading: boolean
  error: Error | null
  success: boolean
}

const collectionNameByPresetDataChoiceMap = {
  [PresetDataType.BIKES]: 'bikes',
}

export const useCreateIndex = (): UseCreateIndexResult => {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { load } = useLoadData()
  const dispatchCreateIndex = useDispatchWbQuery()

  const run = useCallback(
    async ({ instanceId }: CreateSearchIndexParameters) => {
      setSuccess(false)
      setError(null)
      setLoading(true)

      try {
        const collectionName =
          collectionNameByPresetDataChoiceMap[PresetDataType.BIKES]

        if (!instanceId) {
          throw new Error('Instance ID is required')
        }

        // Step 1: Load the vector collection data
        await load(instanceId, collectionName)

        // Step 2: Create the search index
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
    [load, dispatchCreateIndex],
  )

  return {
    run,
    loading,
    error,
    success,
  }
}
