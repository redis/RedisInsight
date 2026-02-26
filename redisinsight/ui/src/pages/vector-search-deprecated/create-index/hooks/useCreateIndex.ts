/**
 * @deprecated Use `useCreateIndex` from `uiSrc/pages/vector-search/hooks/useCreateIndex` instead.
 */

import { useCallback, useRef, useState } from 'react'
import { useLoadData } from 'uiSrc/services/hooks'
import { generateFtCreateCommand } from 'uiSrc/pages/vector-search/utils/generateFtCreateCommand'
import { CreateSearchIndexParameters, SampleDataContent } from '../types'
import executeQuery from 'uiSrc/services/executeQuery'
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import CommandsHistoryService from 'uiSrc/services/commands-history/commandsHistoryService'

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

  const commandsHistoryService = useRef(
    new CommandsHistoryService(CommandExecutionType.Search),
  ).current

  const { load } = useLoadData()

  const run = useCallback(
    async (
      { instanceId, indexName, dataContent }: CreateSearchIndexParameters,
      onSuccess: () => void,
      onError: () => void,
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

        // Step 3: Persist results so Vector Search history (CommandsView) shows it
        await commandsHistoryService.addCommandsToHistory(instanceId, [cmd], {
          activeRunQueryMode: RunQueryMode.Raw,
          resultsMode: ResultsMode.Default,
        })

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
