import { useCallback, useRef, useState } from 'react'
import { useLoadData } from 'uiSrc/services/hooks'
import { generateFtCreateCommand } from '../../utils/generateFtCreateCommand'
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import CommandsHistoryService from 'uiSrc/services/commands-history/commandsHistoryService'

import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { getCollectionNameBySampleData } from '../../utils/sampleData'

export interface CreateIndexParams {
  instanceId: string
  indexName: string
  dataContent: SampleDataContent
}

export interface UseCreateIndexResult {
  run: (
    params: CreateIndexParams,
    onSuccess?: () => Promise<void>,
    onError?: () => Promise<void>,
  ) => Promise<void>
  loading: boolean
  error: Error | null
  success: boolean
}

export const useCreateIndex = (): UseCreateIndexResult => {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const commandsHistoryService = useRef(
    new CommandsHistoryService(CommandExecutionType.Search),
  ).current

  const { load } = useLoadData()

  const run = useCallback(
    async (
      { instanceId, indexName, dataContent }: CreateIndexParams,
      onSuccess?: () => Promise<void>,
      onError?: () => Promise<void>,
    ) => {
      setSuccess(false)
      setError(null)
      setLoading(true)

      try {
        const collectionName = getCollectionNameBySampleData(dataContent)

        if (!instanceId) {
          throw new Error('Instance ID is required')
        }

        // Step 1: Load the vector collection data
        await load(instanceId, collectionName)

        // Step 2: Create the search index command
        const cmd = generateFtCreateCommand({
          indexName,
          dataContent,
        })

        // Step 3: Persist results so Vector Search history shows it
        await commandsHistoryService.addCommandsToHistory(instanceId, [cmd], {
          activeRunQueryMode: RunQueryMode.Raw,
          resultsMode: ResultsMode.Default,
        })

        setSuccess(true)
        await onSuccess?.()
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)))
        await onError?.()
      } finally {
        setLoading(false)
      }
    },
    [load],
  )

  return {
    run,
    loading,
    error,
    success,
  }
}
