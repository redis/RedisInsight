import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { chunk, reverse } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from 'uiSrc/slices/store'
import {
  Nullable,
  getCommandsForExecution,
  getExecuteParams,
  isGroupResults,
  isSilentMode,
} from 'uiSrc/utils'
import { CodeButtonParams } from 'uiSrc/constants'
import {
  RunQueryMode,
  ResultsMode,
  CommandExecutionUI,
  CommandExecution,
  CommandExecutionType,
} from 'uiSrc/slices/interfaces'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  addCommands,
  clearCommands,
  findCommand,
  removeCommand,
} from 'uiSrc/services/workbenchStorage'
import {
  createErrorResult,
  createGroupItem,
  executeApiCall,
  generateCommandId,
  limitHistoryLength,
  loadHistoryData,
  prepareNewItems,
  scrollToElement,
  sortCommandsByDate,
} from './utils'

const useQuery = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const scrollDivRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [items, setItems] = useState<CommandExecutionUI[]>([])
  const [clearing, setClearing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const envDependentFlag = useSelector(
    (state: RootState) =>
      state?.app?.features?.featureFlags?.features?.envDependent?.flag,
  )

  const resultsMode = ResultsMode.Default
  const activeRunQueryMode = RunQueryMode.ASCII

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await loadHistoryData(instanceId)
        setItems(historyData)
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoaded(true)
      }
    }

    loadHistory()
  }, [instanceId])

  const handleApiSuccess = useCallback(
    async (
      data: CommandExecution[],
      commandId: string,
      isNewCommand: boolean,
    ) => {
      setItems((prevItems) => {
        const updatedItems = prevItems.map((item) => {
          const result = data.find((_, i) => item.id === commandId + i)
          if (result) {
            return {
              ...result,
              loading: false,
              error: '',
              isOpen: !isSilentMode(resultsMode),
            }
          }
          return item
        })
        return sortCommandsByDate(updatedItems)
      })

      if (envDependentFlag === false) {
        await addCommands(reverse(data))
      }

      if (isNewCommand) {
        scrollToElement(scrollDivRef.current, 'start')
      }
    },
    [resultsMode],
  )

  const handleApiError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Failed to execute command'

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.loading) {
          return {
            ...item,
            loading: false,
            error: message,
            result: createErrorResult(message),
            isOpen: true,
          }
        }
        return item
      }),
    )
    setProcessing(false)
  }, [])

  const executeCommandBatch = useCallback(
    async (
      commandInit: string,
      commandId: Nullable<string> | undefined,
      executeParams: CodeButtonParams,
    ) => {
      const currentExecuteParams = {
        activeRunQueryMode,
        resultsMode,
        batchSize: PIPELINE_COUNT_DEFAULT,
      }

      const { batchSize } = getExecuteParams(
        executeParams,
        currentExecuteParams,
      )
      const commandsForExecuting = getCommandsForExecution(commandInit)
      const chunkSize = isGroupResults(resultsMode)
        ? commandsForExecuting.length
        : batchSize > 1
          ? batchSize
          : 1

      const [commands, ...restCommands] = chunk(commandsForExecuting, chunkSize)

      if (!commands?.length) {
        setProcessing(false)
        return
      }

      const newCommandId = commandId || generateCommandId()
      const newItems = prepareNewItems(commands, newCommandId)

      setItems((prevItems) => {
        const updatedItems = isGroupResults(resultsMode)
          ? [createGroupItem(newItems.length, newCommandId), ...prevItems]
          : [...newItems, ...prevItems]
        return limitHistoryLength(updatedItems)
      })

      const data = await executeApiCall(
        instanceId,
        commands,
        activeRunQueryMode,
        resultsMode,
      )

      await handleApiSuccess(data, newCommandId, !commandId)

      // Handle remaining command batches
      if (restCommands.length > 0) {
        const nextCommands = restCommands[0]
        if (nextCommands?.length) {
          await executeCommandBatch(
            nextCommands.join('\n'),
            undefined,
            executeParams,
          )
        }
      } else {
        setProcessing(false)
      }
    },
    [activeRunQueryMode, resultsMode, instanceId, handleApiSuccess],
  )

  const onSubmit = useCallback(
    async (
      commandInit: string = query,
      commandId?: Nullable<string>,
      executeParams: CodeButtonParams = {},
    ) => {
      if (!commandInit?.length) return

      setProcessing(true)

      try {
        await executeCommandBatch(commandInit, commandId, executeParams)
      } catch (error) {
        handleApiError(error)
      }
    },
    [query, executeCommandBatch, handleApiError],
  )

  const handleQueryDelete = useCallback(
    async (commandId: string) => {
      try {
        await removeCommand(instanceId, commandId)
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== commandId),
        )
      } catch (error) {
        // Silently handle error
      }
    },
    [instanceId],
  )

  const handleAllQueriesDelete = useCallback(async () => {
    try {
      setClearing(true)
      await clearCommands(instanceId, CommandExecutionType.Search)
      setItems([])
    } catch (error) {
      // Keep clearing state false on error
    } finally {
      setClearing(false)
    }
  }, [instanceId])

  const handleQueryOpen = useCallback(async (commandId: string) => {
    try {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === commandId ? { ...item, loading: true } : item,
        ),
      )

      const command = await findCommand(commandId)
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== commandId) return item

          if (command) {
            return {
              ...item,
              ...command,
              loading: false,
              isOpen: !item.isOpen,
              error: '',
            }
          }

          return { ...item, loading: false }
        }),
      )
    } catch (error) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === commandId
            ? {
                ...item,
                loading: false,
                error: 'Failed to load command details',
              }
            : item,
        ),
      )
    }
  }, [])

  const handleQueryProfile = useCallback(() => {}, [])
  const handleChangeQueryRunMode = useCallback(() => {}, [])
  const handleChangeGroupMode = useCallback(() => {}, [])

  return {
    // State
    query,
    setQuery,
    items,
    clearing,
    processing,
    isResultsLoaded: isLoaded,

    // Configuration
    activeMode: activeRunQueryMode,
    resultsMode,
    scrollDivRef,

    // Actions
    onSubmit,
    onQueryOpen: handleQueryOpen,
    onQueryDelete: handleQueryDelete,
    onAllQueriesDelete: handleAllQueriesDelete,
    onQueryChangeMode: handleChangeQueryRunMode,
    onChangeGroupMode: handleChangeGroupMode,
    onQueryReRun: onSubmit,
    onQueryProfile: handleQueryProfile,
  }
}

export { useQuery }
