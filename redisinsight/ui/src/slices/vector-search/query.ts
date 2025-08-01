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
  StateVectorSearchQuery,
  CommandExecution,
} from 'uiSrc/slices/interfaces'
import {
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
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'

import { AppDispatch, RootState } from '../store'

export const initialState: StateVectorSearchQuery = {
  isLoaded: true,
  loading: false,
  processing: false,
  clearing: false,
  error: '',
  items: [],
  resultsMode:
    localStorageService?.get(BrowserStorageItem.vectorSearchGroupMode) ??
    ResultsMode.Default,
  activeRunQueryMode:
    localStorageService?.get(BrowserStorageItem.vectorSearchRunQueryMode) ??
    RunQueryMode.ASCII,
}

const vectorSearchQuerySlice = createSlice({
  name: 'vectorSearchQuery',
  initialState,
  reducers: {
    setVectorSearchQueryInitialState: () => initialState,

    loadVectorSearchHistory: (state) => {
      state.loading = true
    },

    loadVectorSearchHistorySuccess: (
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

    loadVectorSearchHistoryFailure: (state, { payload }) => {
      state.error = payload
      state.loading = false
      state.isLoaded = true
    },

    processVectorSearchCommand: (
      state,
      { payload = '' }: { payload: string },
    ) => {
      if (!payload) return

      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, loading: true }
        }
        return item
      })
    },

    processVectorSearchCommandsFailure: (
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

    processVectorSearchCommandFailure: (
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

    sendVectorSearchCommand: (
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

    sendVectorSearchCommandSuccess: (
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

    fetchVectorSearchCommandSuccess: (
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

    deleteVectorSearchCommandSuccess: (
      state,
      { payload }: { payload: string },
    ) => {
      state.items = [...state.items.filter((item) => item.id !== payload)]
    },

    // toggle open card
    toggleOpenVectorSearchResult: (state, { payload }: { payload: string }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, isOpen: !item.isOpen }
        }
        return item
      })
    },

    resetVectorSearchHistoryItems: (state) => {
      state.items = []
      state.isLoaded = false
    },

    stopVectorSearchProcessing: (state) => {
      state.processing = false
    },

    clearVectorSearchResults: (state) => {
      state.clearing = true
    },

    clearVectorSearchResultsSuccess: (state) => {
      state.items = []
      state.clearing = false
    },

    clearVectorSearchResultsFailed: (state) => {
      state.clearing = false
    },

    changeVectorSearchResultsMode: (state, { payload }) => {
      state.resultsMode = payload
      localStorageService.set(BrowserStorageItem.vectorSearchGroupMode, payload)
    },

    changeVectorSearchActiveRunQueryMode: (state, { payload }) => {
      state.activeRunQueryMode = payload
      localStorageService.set(
        BrowserStorageItem.vectorSearchRunQueryMode,
        payload,
      )
    },
  },
})

export const {
  setVectorSearchQueryInitialState,
  loadVectorSearchHistory,
  loadVectorSearchHistorySuccess,
  loadVectorSearchHistoryFailure,
  processVectorSearchCommand,
  fetchVectorSearchCommandSuccess,
  processVectorSearchCommandFailure,
  processVectorSearchCommandsFailure,
  sendVectorSearchCommand,
  sendVectorSearchCommandSuccess,
  toggleOpenVectorSearchResult,
  deleteVectorSearchCommandSuccess,
  resetVectorSearchHistoryItems,
  stopVectorSearchProcessing,
  clearVectorSearchResults,
  clearVectorSearchResultsSuccess,
  clearVectorSearchResultsFailed,
  changeVectorSearchResultsMode,
  changeVectorSearchActiveRunQueryMode,
} = vectorSearchQuerySlice.actions

export const vectorSearchQuerySelector = (state: RootState) =>
  state.vectorSearch.query

export default vectorSearchQuerySlice.reducer

export function sendVectorSearchCommandAction(
  commands: string[],
  multiCommands: string[] = [],
  mode: RunQueryMode,
  resultsMode: ResultsMode,
  onSuccessAction?: (multiCommands?: string[]) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance
      const commandId = `${Date.now()}`

      dispatch(
        sendVectorSearchCommand({
          commands: isGroupResults(resultsMode)
            ? [`${commands.length} - Commands`]
            : commands,
          commandId,
        }),
      )

      const { data, status } = await apiService.post<CommandExecution[]>(
        getUrl(id, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        {
          commands,
          mode,
          resultsMode,
          type: CommandExecutionType.Search, // TODO: Do we need another type?
          outputFormat: CliOutputFormatterType.Raw,
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          sendVectorSearchCommandSuccess({
            commandId,
            data: reverse(data),
            processing: !!multiCommands?.length,
          }),
        )
        onSuccessAction?.(multiCommands)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error as any))
      onFailAction?.()
    }
  }
}

export function sendVectorSearchQueryAction(
  commandInit: string,
  commandId?: Nullable<string>,
  executeParams: CodeButtonParams = {},
  options: {
    afterEach?: () => void
    afterAll?: () => void
  } = {},
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { afterEach, afterAll } = options
    const state = stateInit()
    const { activeRunQueryMode, resultsMode } = state.vectorSearch.query
    const currentExecuteParams = {
      activeRunQueryMode,
      resultsMode,
      batchSize: PIPELINE_COUNT_DEFAULT,
    }
    const { batchSize } = getExecuteParams(executeParams, currentExecuteParams)

    const onSuccessAction = (multiCommands?: string[]) => {
      afterEach?.()
      if (!multiCommands?.length) {
        afterAll?.()
        return
      }

      const nextCommands = multiCommands.slice(0, batchSize)
      const restCommands = multiCommands.slice(batchSize)

      dispatch(
        sendVectorSearchCommandAction(
          nextCommands,
          restCommands,
          activeRunQueryMode,
          resultsMode,
          onSuccessAction,
          onFail,
        ),
      )
    }

    const sendCommand = (commands: string[], multiCommands: string[] = []) => {
      dispatch(
        sendVectorSearchCommandAction(
          commands,
          multiCommands,
          activeRunQueryMode,
          resultsMode,
          onSuccessAction,
          onFail,
        ),
      )
    }

    const prepareQueryToSend = (
      commandInit: string,
      commandId?: Nullable<string>,
      executeParams: CodeButtonParams = {},
    ) => {
      if (!commandInit?.length) {
        if (commandInit?.length) {
          afterAll?.()
        }
        return
      }

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

      sendCommand(commands, multiCommands)
    }

    prepareQueryToSend(commandInit, commandId, executeParams)
  }
}

export function deleteVectorSearchCommandAction(commandId: string) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(deleteVectorSearchCommandSuccess(commandId))
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error as any))
    }
  }
}

export function clearVectorSearchResultsAction() {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(clearVectorSearchResults())
      dispatch(clearVectorSearchResultsSuccess())
    } catch (_err) {
      dispatch(clearVectorSearchResultsFailed())
      const error = _err as AxiosError
      dispatch(addErrorNotification(error as any))
    }
  }
}
