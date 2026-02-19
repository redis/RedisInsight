import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { chunk } from 'lodash'
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
  CommandExecutionType,
} from 'uiSrc/slices/interfaces'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { CommandsHistoryService } from 'uiSrc/services/commands-history/commandsHistoryService'
import {
  createErrorResult,
  createGroupItem,
  generateCommandId,
  limitHistoryLength,
  prepareNewItems,
  scrollToElement,
  sortCommandsByDate,
} from './useQuery.utils'

export const useQuery = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const scrollDivRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [items, setItems] = useState<CommandExecutionUI[]>([])
  const [clearing, setClearing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const commandsHistoryService = useRef(
    new CommandsHistoryService(CommandExecutionType.Search),
  ).current

  const [activeRunQueryMode] = useState(RunQueryMode.ASCII)
  const [resultsMode] = useState(ResultsMode.Default)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData =
          await commandsHistoryService.getCommandsHistory(instanceId)
        setItems(historyData)
      } catch {
        // Silently handle error — history may be unavailable
      } finally {
        setIsLoaded(true)
      }
    }

    loadHistory()
  }, [instanceId])

  const handleApiSuccess = useCallback(
    (data: CommandExecutionUI[], commandId: string, isNewCommand: boolean) => {
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

      const data = await commandsHistoryService.addCommandsToHistory(
        instanceId,
        commands,
        {
          activeRunQueryMode,
          resultsMode,
        },
      )

      handleApiSuccess(data, newCommandId, !commandId)

      if (restCommands.length > 0) {
        const remainingCommands = restCommands
          .map((cmds) => cmds.join('\n'))
          .join('\n')
        if (remainingCommands) {
          await executeCommandBatch(remainingCommands, undefined, executeParams)
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
        await commandsHistoryService.deleteCommandFromHistory(
          instanceId,
          commandId,
        )
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== commandId),
        )
      } catch {
        // Silently handle error
      }
    },
    [instanceId],
  )

  const handleAllQueriesDelete = useCallback(async () => {
    try {
      setClearing(true)
      await commandsHistoryService.clearCommandsHistory(instanceId)
      setItems([])
    } catch {
      // Silently handle error
    } finally {
      setClearing(false)
    }
  }, [instanceId])

  const handleToggleOpen = useCallback(
    async (id: string, isOpen: boolean) => {
      if (isOpen) {
        const item = items.find((i) => i.id === id)
        if (item && !item.result) {
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, loading: true } : i)),
          )

          try {
            const command = await commandsHistoryService.getCommandHistory(
              instanceId,
              id,
            )

            setItems((prev) =>
              prev.map((i) => {
                if (i.id !== id) return i
                if (command) {
                  return {
                    ...i,
                    ...command,
                    isOpen: true,
                    loading: false,
                    error: '',
                  }
                }
                return { ...i, loading: false }
              }),
            )
            return
          } catch {
            setItems((prev) =>
              prev.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      loading: false,
                      error: 'Failed to load command details',
                    }
                  : i,
              ),
            )
            return
          }
        }
      }

      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isOpen } : i)))
    },
    [items, instanceId],
  )

  return {
    query,
    setQuery,
    items,
    clearing,
    processing,
    isResultsLoaded: isLoaded,
    activeMode: activeRunQueryMode,
    resultsMode,
    scrollDivRef,
    onSubmit,
    onToggleOpen: handleToggleOpen,
    onQueryDelete: handleQueryDelete,
    onAllQueriesDelete: handleAllQueriesDelete,
    onQueryReRun: onSubmit,
    onQueryProfile: onSubmit,
  }
}
