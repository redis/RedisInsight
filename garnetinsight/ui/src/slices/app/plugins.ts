import { flatMap, isEmpty, reject } from 'lodash'
import { createSlice } from '@reduxjs/toolkit'

import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  multilineCommandToOneLine,
} from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  CommandExecutionType,
  IPlugin,
  PluginsResponse,
  StateAppPlugins,
} from 'uiSrc/slices/interfaces'
import { SendCommandResponse } from 'apiSrc/modules/cli/dto/cli.dto'
import { PluginState } from 'apiSrc/modules/workbench/models/plugin-state'

import { AppDispatch, RootState } from '../store'

export const initialState: StateAppPlugins = {
  loading: false,
  error: '',
  staticPath: '',
  plugins: [],
  visualizations: [],
}

// A slice for recipes
const appPluginsSlice = createSlice({
  name: 'appPlugins',
  initialState,
  reducers: {
    setAppPluginsInitialState: () => initialState,
    getAllPlugins: (state) => {
      state.loading = true
      state.error = ''
    },
    getAllPluginsSuccess: (
      state,
      { payload }: { payload: PluginsResponse },
    ) => {
      state.loading = false
      state.staticPath = payload?.static
      state.plugins = reject(payload?.plugins, isEmpty)
      state.visualizations = flatMap(
        reject(payload?.plugins, isEmpty),
        (plugin: IPlugin) =>
          plugin.visualizations.map((view) => ({
            ...view,
            plugin: {
              name: plugin.name,
              baseUrl: plugin.baseUrl,
              internal: plugin.internal,
              stylesSrc: plugin.styles,
              scriptSrc: plugin.main,
            },
            uniqId: `${plugin.name}__${view.id}`,
          })),
      )
    },
    getAllPluginsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  setAppPluginsInitialState,
  getAllPlugins,
  getAllPluginsSuccess,
  getAllPluginsFailure,
} = appPluginsSlice.actions

// Selectors
export const appPluginsSelector = (state: RootState) => state.app.plugins

// The reducer
export default appPluginsSlice.reducer

// Asynchronous thunk action
export function loadPluginsAction() {
  return async (dispatch: AppDispatch) => {
    dispatch(getAllPlugins())

    try {
      const { data, status } = await apiService.get(`${ApiEndpoints.PLUGINS}`)

      if (isStatusSuccessful(status)) {
        dispatch(getAllPluginsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getAllPluginsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function sendPluginCommandAction({
  command = '',
  executionType = CommandExecutionType.Workbench,
  onSuccessAction,
  onFailAction,
}: {
  command: string
  executionType?: CommandExecutionType
  onSuccessAction?: (responseData: any) => void
  onFailAction?: (error: any) => void
}) {
  return async (_dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      const { data, status } = await apiService.post<SendCommandResponse>(
        getUrl(id, ApiEndpoints.PLUGINS, ApiEndpoints.COMMAND_EXECUTIONS),
        {
          command: multilineCommandToOneLine(command),
          type: executionType,
        },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.(data)
      }
    } catch (error) {
      onFailAction?.(error)
    }
  }
}

export function getPluginStateAction({
  visualizationId = '',
  commandId = '',
  onSuccessAction,
  onFailAction,
}: {
  visualizationId: string
  commandId: string
  onSuccessAction?: (responseData: any) => void
  onFailAction?: (error: any) => void
}) {
  return async (_dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      const { data, status } = await apiService.get<PluginState>(
        getUrl(
          id,
          ApiEndpoints.PLUGINS,
          visualizationId,
          ApiEndpoints.COMMAND_EXECUTIONS,
          commandId,
          ApiEndpoints.STATE,
        ),
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.(data)
      }
    } catch (error) {
      onFailAction?.(error)
    }
  }
}

export function setPluginStateAction({
  visualizationId = '',
  commandId = '',
  pluginState,
  onSuccessAction,
  onFailAction,
}: {
  visualizationId: string
  commandId: string
  pluginState: any
  onSuccessAction?: (responseData: any) => void
  onFailAction?: (error: any) => void
}) {
  return async (_dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      const { data, status } = await apiService.post(
        getUrl(
          id,
          ApiEndpoints.PLUGINS,
          visualizationId,
          ApiEndpoints.COMMAND_EXECUTIONS,
          commandId,
          ApiEndpoints.STATE,
        ),
        {
          state: pluginState,
        },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.(data)
      }
    } catch (error) {
      onFailAction?.(error)
    }
  }
}
