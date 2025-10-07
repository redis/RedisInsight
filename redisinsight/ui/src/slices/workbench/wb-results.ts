import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { chunk, reverse } from 'lodash'
import { apiService, localStorageService } from 'uiSrc/services'
import {
  ApiEndpoints,
  BrowserStorageItem,
  CodeButtonParams,
  EMPTY_COMMAND,
} from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { CliOutputFormatterType } from 'uiSrc/constants/cliOutput'
import {
  RunQueryMode,
  ResultsMode,
  CommandExecutionType,
} from 'uiSrc/slices/interfaces/workbench'
import {
  getApiErrorMessage,
  getCommandsForExecution,
  getExecuteParams,
  getMultiCommands,
  getUrl,
  isGroupResults,
  isSilentMode,
  isStatusSuccessful,
  Nullable,
} from 'uiSrc/utils'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'
import {
  ClusterNodeRole,
  CommandExecutionStatus,
} from 'uiSrc/slices/interfaces/cli'
import { setDbIndexState } from 'uiSrc/slices/app/context'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  addCommands,
  clearCommands,
  findCommand,
  getLocalWbHistory,
  removeCommand,
} from 'uiSrc/services/workbenchStorage'
import { CreateCommandExecutionsDto } from 'apiSrc/modules/workbench/dto/create-command-executions.dto'

import { AppDispatch, RootState } from '../store'
import {
  CommandExecution,
  ConnectionType,
  StateWorkbenchResults,
} from '../interfaces'

export const initialState: StateWorkbenchResults = {
  isLoaded: false,
  loading: false,
  processing: false,
  clearing: false,
  error: '',
  items: [],
  resultsMode:
    localStorageService?.get(BrowserStorageItem.wbGroupMode) ??
    ResultsMode.Default,
  activeRunQueryMode:
    localStorageService?.get(BrowserStorageItem.RunQueryMode) ??
    RunQueryMode.ASCII,
}

// A slice for recipes
const workbenchResultsSlice = createSlice({
  name: 'workbenchResults',
  initialState,
  reducers: {
    setWBResultsInitialState: () => initialState,

    // Fetch Workbench history
    loadWBHistory: (state) => {
      state.loading = true
    },

    loadWBHistorySuccess: (
      state,
      { payload }: { payload: CommandExecution[] },
    ) => {
      state.items = payload.map((item) => ({
        ...item,
        command: item.command || EMPTY_COMMAND,
        emptyCommand: !item.command,
      }))
      state.loading = false
      state.isLoaded = true
    },

    loadWBHistoryFailure: (state, { payload }) => {
      state.error = payload
      state.loading = false
      state.isLoaded = true
    },

    // Process Workbench command to API
    processWBCommand: (state, { payload = '' }: { payload: string }) => {
      if (!payload) return

      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, loading: true }
        }
        return item
      })
    },

    processWBCommandsFailure: (
      state,
      { payload }: { payload: { commandsId: string[]; error: string } },
    ) => {
      state.items = [...state.items].map((item) => {
        let newItem = item
        payload.commandsId.forEach(() => {
          if (payload.commandsId.indexOf(item?.id as string) !== -1) {
            newItem = {
              ...item,
              result: [
                {
                  response: payload.error,
                  status: CommandExecutionStatus.Fail,
                },
              ],
              loading: false,
              isOpen: true,
              error: '',
            }
          }
        })
        return newItem
      })
      state.loading = false
      state.processing = false
    },

    processWBCommandFailure: (
      state,
      { payload }: { payload: { id: string; error: string } },
    ) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload.id) {
          return { ...item, loading: false, error: payload?.error }
        }
        return item
      })
      state.loading = false
      state.processing = false
    },

    sendWBCommand: (
      state,
      {
        payload: { commands, commandId },
      }: { payload: { commands: string[]; commandId: string } },
    ) => {
      let newItems = [
        ...commands.map((command, i) => ({
          command,
          id: commandId + i,
          loading: true,
          isOpen: true,
          error: '',
        })),
        ...state.items,
      ]

      if (newItems?.length > WORKBENCH_HISTORY_MAX_LENGTH) {
        newItems = newItems.slice(0, WORKBENCH_HISTORY_MAX_LENGTH)
      }

      state.items = newItems
      state.loading = true
      state.processing = true
    },

    sendWBCommandSuccess: (
      state,
      {
        payload: { data, commandId, processing },
      }: {
        payload: {
          data: CommandExecution[]
          commandId: string
          processing?: boolean
        }
      },
    ) => {
      state.items = [...state.items].map((item) => {
        let newItem = item
        data.forEach((command, i) => {
          if (item.id === commandId + i) {
            // don't open a card if silent mode and no errors
            newItem = {
              ...command,
              loading: false,
              error: '',
              isOpen: !isSilentMode(command.resultsMode),
            }
          }
        })
        return newItem
      })

      state.loading = false
      state.processing = (state.processing && processing) || false
    },

    fetchWBCommandSuccess: (
      state,
      { payload }: { payload: CommandExecution },
    ) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            ...payload,
            loading: false,
            isOpen: true,
            error: '',
          }
        }
        return item
      })
    },

    deleteWBCommandSuccess: (state, { payload }: { payload: string }) => {
      state.items = [...state.items.filter((item) => item.id !== payload)]
    },

    // toggle open card
    toggleOpenWBResult: (state, { payload }: { payload: string }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, isOpen: !item.isOpen }
        }
        return item
      })
    },

    resetWBHistoryItems: (state) => {
      state.items = []
      state.isLoaded = false
    },

    stopProcessing: (state) => {
      state.processing = false
    },

    clearWbResults: (state) => {
      state.clearing = true
    },

    clearWbResultsSuccess: (state) => {
      state.clearing = false
      state.items = []
    },

    clearWbResultsFailed: (state) => {
      state.clearing = false
    },

    changeResultsMode: (state, { payload }) => {
      state.resultsMode = payload
      localStorageService.set(BrowserStorageItem.wbGroupMode, payload)
    },

    changeActiveRunQueryMode: (state, { payload }) => {
      state.activeRunQueryMode = payload
      localStorageService.set(BrowserStorageItem.RunQueryMode, payload)
    },
  },
})

// Actions generated from the slice
export const {
  setWBResultsInitialState,
  loadWBHistory,
  loadWBHistorySuccess,
  loadWBHistoryFailure,
  processWBCommand,
  fetchWBCommandSuccess,
  processWBCommandFailure,
  processWBCommandsFailure,
  sendWBCommand,
  sendWBCommandSuccess,
  toggleOpenWBResult,
  deleteWBCommandSuccess,
  resetWBHistoryItems,
  stopProcessing,
  clearWbResults,
  clearWbResultsSuccess,
  clearWbResultsFailed,
  changeResultsMode,
  changeActiveRunQueryMode,
} = workbenchResultsSlice.actions

// A selector
export const workbenchResultsSelector = (state: RootState) =>
  state.workbench.results

// The reducer
export default workbenchResultsSlice.reducer

// Asynchronous thunk actions
export function fetchWBHistoryAction(
  instanceId: string,
  executionType = CommandExecutionType.Workbench,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadWBHistory())

    try {
      const state = stateInit()
      const envDependentFlag =
        state.app.features.featureFlags.features.envDependent?.flag
      if (envDependentFlag === false) {
        // Fetch commands from local storage
        const commandsHistory = await getLocalWbHistory(
          instanceId,
          CommandExecutionType.Workbench,
        )
        if (Array.isArray(commandsHistory)) {
          dispatch(loadWBHistorySuccess(reverse(commandsHistory)))
        } else {
          dispatch(loadWBHistorySuccess([]))
        }
        return
      }
      const { data, status } = await apiService.get<CommandExecution[]>(
        getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        { params: { type: executionType } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadWBHistorySuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadWBHistoryFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function sendWBCommandAction({
  commands = [],
  multiCommands = [],
  mode = RunQueryMode.ASCII,
  resultsMode = ResultsMode.Default,
  commandId = `${Date.now()}`,
  executionType = CommandExecutionType.Workbench,
  onSuccessAction,
  onFailAction,
}: {
  commands: string[]
  multiCommands?: string[]
  commandId?: string
  mode: RunQueryMode
  resultsMode?: ResultsMode
  executionType?: CommandExecutionType
  onSuccessAction?: (multiCommands: string[]) => void
  onFailAction?: () => void
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(
        sendWBCommand({
          commands: isGroupResults(resultsMode)
            ? [`${commands.length} - Command(s)`]
            : commands,
          commandId,
        }),
      )

      dispatch(setDbIndexState(true))

      const { data, status } = await apiService.post<CommandExecution[]>(
        getUrl(id, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        {
          commands,
          mode,
          resultsMode,
          type: executionType,
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          sendWBCommandSuccess({
            commandId,
            data: reverse(data),
            processing: !!multiCommands?.length,
          }),
        )
        dispatch(setDbIndexState(!!multiCommands?.length))
        const envDependentFlag =
          state.app.features.featureFlags.features.envDependent?.flag
        if (envDependentFlag === false) {
          await addCommands(reverse(data))
        }
        onSuccessAction?.(multiCommands)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(
        processWBCommandsFailure({
          commandsId: commands.map((_, i) => commandId + i),
          error: errorMessage,
        }),
      )
      dispatch(setDbIndexState(false))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function sendWBCommandClusterAction({
  commands = [],
  multiCommands = [],
  options,
  mode = RunQueryMode.ASCII,
  resultsMode = ResultsMode.Default,
  commandId = `${Date.now()}`,
  executionType = CommandExecutionType.Workbench,
  onSuccessAction,
  onFailAction,
}: {
  commands: string[]
  options: CreateCommandExecutionsDto
  commandId?: string
  multiCommands?: string[]
  mode?: RunQueryMode
  resultsMode?: ResultsMode
  executionType?: CommandExecutionType
  onSuccessAction?: (multiCommands: string[]) => void
  onFailAction?: () => void
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(
        sendWBCommand({
          commands: isGroupResults(resultsMode)
            ? [`${commands.length} - Commands`]
            : commands,
          commandId,
        }),
      )

      const { data, status } = await apiService.post<CommandExecution[]>(
        getUrl(id, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        {
          ...options,
          commands,
          mode,
          resultsMode,
          type: executionType,
          outputFormat: CliOutputFormatterType.Raw,
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          sendWBCommandSuccess({
            commandId,
            data: reverse(data),
            processing: !!multiCommands?.length,
          }),
        )
        const envDependentFlag =
          state.app.features.featureFlags.features.envDependent?.flag
        if (envDependentFlag === false) {
          await addCommands(reverse(data))
        }
        onSuccessAction?.(multiCommands)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(
        processWBCommandsFailure({
          commandsId: commands.map((_, i) => commandId + i),
          error: errorMessage,
        }),
      )
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchWBCommandAction(
  commandId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(processWBCommand(commandId))
      const envDependentFlag =
        state.app.features.featureFlags.features.envDependent?.flag
      if (envDependentFlag === false) {
        const command = await findCommand(commandId)

        dispatch(fetchWBCommandSuccess(command as CommandExecution))

        onSuccessAction?.()
        return
      }
      const { data, status } = await apiService.get<CommandExecution>(
        getUrl(id, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS, commandId),
      )

      if (isStatusSuccessful(status)) {
        dispatch(fetchWBCommandSuccess(data))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function deleteWBCommandAction(
  commandId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(processWBCommand(commandId))
      const envDependentFlag =
        state.app.features.featureFlags.features.envDependent?.flag
      if (envDependentFlag === false) {
        await removeCommand(id, commandId)

        dispatch(deleteWBCommandSuccess(commandId))
        onSuccessAction?.()
        return
      }

      const { status } = await apiService.delete<CommandExecution>(
        getUrl(id, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS, commandId),
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteWBCommandSuccess(commandId))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function clearWbResultsAction(
  executionType = CommandExecutionType.Workbench,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(clearWbResults())
      const envDependentFlag =
        state.app.features.featureFlags.features.envDependent?.flag
      if (envDependentFlag === false) {
        await clearCommands(id, CommandExecutionType.Workbench)
        dispatch(clearWbResultsSuccess())
        onSuccessAction?.()
        return
      }
      const { status } = await apiService.delete(
        getUrl(id, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        {
          data: { type: executionType },
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(clearWbResultsSuccess())

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
      dispatch(clearWbResultsFailed())
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function sendWbQueryAction(
  queryInit: string,
  commandId?: Nullable<string>,
  executeParams: CodeButtonParams = {},
  onSuccessAction?: {
    afterEach?: () => void
    afterAll?: () => void
  },
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()

    const {
      resultsMode: resultsModeInitial,
      activeRunQueryMode: activeRunQueryModeInitial,
    } = state.workbench.results || {}
    const { batchSize: batchSizeInitial = PIPELINE_COUNT_DEFAULT } =
      state.user.settings?.config || {}
    const currentExecuteParams = {
      resultsMode: resultsModeInitial,
      activeRunQueryMode: activeRunQueryModeInitial,
      batchSize: batchSizeInitial,
    }

    const sendCommand = (
      commands: string[],
      multiCommands: string[] = [],
      executeParams: any,
      onSuccess: () => void,
    ) => {
      const { activeRunQueryMode, resultsMode } = executeParams
      const { connectionType, host, port } =
        state.connections.instances?.connectedInstance

      if (connectionType !== ConnectionType.Cluster) {
        dispatch(
          sendWBCommandAction({
            resultsMode,
            commands,
            multiCommands,
            mode: activeRunQueryMode,
            onSuccessAction: onSuccess,
            onFailAction: onFail,
          }),
        )
        return
      }

      const options: CreateCommandExecutionsDto = {
        commands,
        nodeOptions: {
          host,
          port,
          enableRedirection: true,
        },
        role: ClusterNodeRole.All,
      }
      dispatch(
        sendWBCommandClusterAction({
          commands,
          options,
          mode: activeRunQueryMode,
          resultsMode,
          multiCommands,
          onSuccessAction: onSuccess,
          onFailAction: onFail,
        }),
      )
    }

    const prepareQueryToSend = (
      commandInit: string,
      commandId?: Nullable<string>,
      executeParams: CodeButtonParams = {},
    ) => {
      if (!commandInit?.length) {
        if (queryInit?.length) {
          onSuccessAction?.afterAll?.()
        }
        return
      }

      const { batchSize, activeRunQueryMode, resultsMode } = getExecuteParams(
        executeParams,
        currentExecuteParams,
      )
      const commandsForExecuting = getCommandsForExecution(commandInit)
      const chunkSize = isGroupResults(resultsMode)
        ? commandsForExecuting.length
        : batchSize > 1
          ? batchSize
          : 1
      const [commands, ...rest] = chunk(commandsForExecuting, chunkSize)
      const multiCommands = rest.map((command) => getMultiCommands(command))

      if (!commands?.length) {
        prepareQueryToSend(multiCommands.join('\n'), commandId, executeParams)
        return
      }

      sendCommand(
        commands,
        multiCommands,
        { activeRunQueryMode, resultsMode },
        () => {
          prepareQueryToSend(multiCommands.join('\n'), commandId, executeParams)
          onSuccessAction?.afterEach?.()
        },
      )
    }

    prepareQueryToSend(queryInit, commandId, executeParams)
  }
}
