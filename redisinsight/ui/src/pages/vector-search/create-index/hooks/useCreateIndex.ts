import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { reverse } from 'lodash'
import { useLoadData } from 'uiSrc/services/hooks'
import { addCommands } from 'uiSrc/services/workbenchStorage'
import { generateFtCreateCommand } from 'uiSrc/utils/index/generateFtCreateCommand'
import { CreateSearchIndexParameters, SampleDataContent } from '../types'
import executeQuery from 'uiSrc/services/executeQuery'
import { RootState } from 'uiSrc/slices/store'

interface UseCreateIndexResult {
  run: (
    params: CreateSearchIndexParameters,
    onSuccess?: () => void,
    onError?: () => void,
  ) => Promise<void>
  loading: boolean
  error: Error | null
  success: boolean
}

const collectionNameByPresetDataChoiceMap = {
  [SampleDataContent.E_COMMERCE_DISCOVERY]: 'bikes',
  [SampleDataContent.CONTENT_RECOMMENDATIONS]: 'movies',
}

export const useCreateIndex = (): UseCreateIndexResult => {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const envDependentFlag = useSelector(
    (state: RootState) =>
      state?.app?.features?.featureFlags?.features?.envDependent?.flag,
  )

  const { load } = useLoadData()

  const run = useCallback(
    async (
      { instanceId, indexName, dataContent }: CreateSearchIndexParameters,
      onSuccess?: () => void,
      onError?: () => void,
    ) => {
      setSuccess(false)
      setError(null)
      setLoading(true)

      try {
        const collectionName = collectionNameByPresetDataChoiceMap[dataContent]

        if (!instanceId) {
          throw new Error('Instance ID is required')
        }

        // Step 1: Load the vector collection data
        await load(instanceId, collectionName)

        // Step 2: Create the search index
        const cmd = generateFtCreateCommand({
          indexName,
          dataContent,
        })
        const data = await executeQuery(instanceId, cmd)

        // Step 3: Persist results locally so Vector Search history (CommandsView) shows it
        if (envDependentFlag === false && Array.isArray(data) && data.length) {
          await addCommands(reverse(data))
        }

        setSuccess(true)
        onSuccess?.()
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)))
        onError?.()
      } finally {
        setLoading(false)
      }
    },
    [load, executeQuery],
  )

  return {
    run,
    loading,
    error,
    success,
  }
}
