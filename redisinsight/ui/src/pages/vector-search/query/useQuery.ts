import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { chunk, reverse } from 'lodash'
import {
  Nullable,
  scrollIntoView,
  getCommandsForExecution,
  getExecuteParams,
  getUrl,
  isGroupResults,
  isSilentMode,
  isStatusSuccessful,
} from 'uiSrc/utils'
import { CodeButtonParams, EMPTY_COMMAND, ApiEndpoints } from 'uiSrc/constants'
import {
  RunQueryMode,
  ResultsMode,
  CommandExecutionUI,
  CommandExecution,
  CommandExecutionType,
} from 'uiSrc/slices/interfaces'
import { apiService } from 'uiSrc/services'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import {
  addCommands,
  clearCommands,
  findCommand,
  getLocalWbHistory,
  removeCommand,
} from 'uiSrc/services/workbenchStorage'

const sortCommandsByDate = (
  commands: CommandExecutionUI[],
): CommandExecutionUI[] =>
  commands.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })

const useQuery = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const scrollDivRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [items, setItems] = useState<CommandExecutionUI[]>([])
  const [clearing, setClearing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const resultsMode = ResultsMode.Default
  const activeRunQueryMode = RunQueryMode.ASCII

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const commandsHistory = await getLocalWbHistory(instanceId)
        if (Array.isArray(commandsHistory)) {
          const sortedHistory = commandsHistory.map((item) => ({
            ...item,
            command: item.command || EMPTY_COMMAND,
            emptyCommand: !item.command,
          }))
          setItems(sortCommandsByDate(sortedHistory))
        }
        setIsLoaded(true)
      } catch (error) {
        setIsLoaded(true)
      }
    }

    loadHistory()
  }, [instanceId])

  const prepareNewItems = (
    commands: string[],
    commandId: string,
  ): CommandExecutionUI[] =>
    commands.map((command, i) => ({
      command,
      id: commandId + i,
      loading: true,
      isOpen: true,
      error: '',
    }))

  const insertNewItems = (
    newItems: CommandExecutionUI[],
    isGroup: boolean,
    commandId: string,
  ) => {
    setItems((prevItems) => {
      let updatedItems = isGroup
        ? [
            {
              command: `${newItems.length} - Command(s)`,
              id: commandId,
              loading: true,
              isOpen: true,
              error: '',
            },
            ...prevItems,
          ]
        : [...newItems, ...prevItems]

      if (updatedItems.length > WORKBENCH_HISTORY_MAX_LENGTH) {
        updatedItems = updatedItems.slice(0, WORKBENCH_HISTORY_MAX_LENGTH)
      }

      return updatedItems
    })
  }

  const handleApiSuccess = async (
    data: CommandExecution[],
    commandId: string,
    restCommands: string[][],
    executeParams: CodeButtonParams,
    _isGroup: boolean,
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

    await addCommands(reverse(data))

    if (restCommands.length > 0) {
      const nextCommands = restCommands[0]
      if (nextCommands?.length) {
        setTimeout(() => {
          handleSubmit(nextCommands.join('\n'), undefined, executeParams)
        }, 100)
      }
    }

    if (isNewCommand) {
      scrollResults('start')
    }

    if (restCommands.length === 0) {
      setProcessing(false)
    }
  }

  const handleApiError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Failed to execute command'

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.loading) {
          return {
            ...item,
            loading: false,
            error: message,
            result: [
              {
                response: message,
                status: CommandExecutionStatus.Fail,
              },
            ],
            isOpen: true,
          }
        }
        return item
      }),
    )
    setProcessing(false)
  }

  const handleSubmit = useCallback(
    async (
      commandInit: string = query,
      commandId?: Nullable<string>,
      executeParams: CodeButtonParams = {},
    ) => {
      if (!commandInit?.length) return

      setProcessing(true)

      const currentExecuteParams = {
        activeRunQueryMode,
        resultsMode,
        batchSize: PIPELINE_COUNT_DEFAULT,
      }

      try {
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

        const [commands, ...restCommands] = chunk(
          commandsForExecuting,
          chunkSize,
        )

        if (!commands?.length) {
          setProcessing(false)
          return
        }

        const newCommandId = commandId || `${Date.now()}`
        const newItems = prepareNewItems(commands, newCommandId)
        insertNewItems(newItems, isGroupResults(resultsMode), newCommandId)

        const { data, status } = await apiService.post<CommandExecution[]>(
          getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          {
            commands,
            mode: activeRunQueryMode,
            resultsMode,
            type: CommandExecutionType.Search,
          },
        )

        if (isStatusSuccessful(status)) {
          await handleApiSuccess(
            data,
            newCommandId,
            restCommands,
            executeParams,
            isGroupResults(resultsMode),
            !commandId,
          )
        } else {
          throw new Error(`API call failed with status: ${status}`)
        }
      } catch (error) {
        handleApiError(error)
      }
    },
    [query, activeRunQueryMode, resultsMode, instanceId],
  )

  const scrollResults = (inline: ScrollLogicalPosition = 'start') => {
    requestAnimationFrame(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior: 'smooth',
        block: 'nearest',
        inline,
      })
    })
  }

  const handleQueryDelete = useCallback(
    async (commandId: string) => {
      try {
        await removeCommand(instanceId, commandId)

        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== commandId),
        )
        // eslint-disable-next-line no-empty
      } catch (error) {}
    },
    [instanceId],
  )

  const handleAllQueriesDelete = useCallback(async () => {
    try {
      setClearing(true)

      await clearCommands(instanceId)

      setItems([])
      setClearing(false)
    } catch (error) {
      setClearing(false)
    }
  }, [instanceId])

  const handleQueryReRun = useCallback(
    (
      query: string,
      commandId?: Nullable<string>,
      executeParams?: CodeButtonParams,
    ) => {
      handleSubmit(query, commandId, executeParams)
    },
    [handleSubmit],
  )

  const handleQueryOpen = useCallback(async (commandId: string) => {
    try {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === commandId ? { ...item, loading: true } : item,
        ),
      )

      const command = await findCommand(commandId)

      if (command) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === commandId
              ? {
                  ...item,
                  ...command,
                  loading: false,
                  isOpen: !item.isOpen,
                  error: '',
                }
              : item,
          ),
        )
      } else {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === commandId ? { ...item, loading: false } : item,
          ),
        )
      }
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
  const handleChangeGroupMode = useCallback(() => {}, [resultsMode])

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
    onSubmit: handleSubmit,
    onQueryOpen: handleQueryOpen,
    onQueryDelete: handleQueryDelete,
    onAllQueriesDelete: handleAllQueriesDelete,
    onQueryChangeMode: handleChangeQueryRunMode,
    onChangeGroupMode: handleChangeGroupMode,
    onQueryReRun: handleQueryReRun,
    onQueryProfile: handleQueryProfile,
  }
}

export { useQuery }
