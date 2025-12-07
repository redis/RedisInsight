import { createSlice } from '@reduxjs/toolkit'
import { isString, uniqBy } from 'lodash'
import { apiService, resourcesService } from 'uiSrc/services'
import { ApiEndpoints, ICommand, ICommands } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  isStatusSuccessful,
  checkDeprecatedCommandGroup,
} from 'uiSrc/utils'
import { getConfig } from 'uiSrc/config'
import { GetServerInfoResponse } from 'apiSrc/modules/server/dto/server.dto'

import { AppDispatch, RootState } from '../store'
import { StateAppRedisCommands } from '../interfaces'

export const commands = [
  'main',
  'redisearch',
  'redisjson',
  'redistimeseries',
  'redisgraph',
  'redisgears',
  'redisbloom',
]

export const initialState: StateAppRedisCommands = {
  loading: false,
  error: '',
  spec: {},
  commandsArray: [],
  commandGroups: [],
}

// A slice for recipes
const appRedisCommandsSlice = createSlice({
  name: 'appRedisCommands',
  initialState,
  reducers: {
    getRedisCommands: (state) => {
      state.loading = true
    },
    getRedisCommandsSuccess: (state, { payload }: { payload: ICommands }) => {
      state.loading = false
      state.spec = payload
      state.commandsArray = Object.keys(state.spec).sort()
      state.commandGroups = uniqBy(Object.values(payload), 'group')
        .map((item: ICommand) => item.group)
        .filter((group: string) => isString(group))
        .filter((group: string) => !checkDeprecatedCommandGroup(group))
    },
    getRedisCommandsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  getRedisCommands,
  getRedisCommandsSuccess,
  getRedisCommandsFailure,
} = appRedisCommandsSlice.actions

// A selector
export const appRedisCommandsSelector = (state: RootState) =>
  state.app.redisCommands

// The reducer
export default appRedisCommandsSlice.reducer

// Asynchronous thunk action
export function fetchRedisCommandsInfo(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getRedisCommands())

    try {
      const riConfig = getConfig()

      if (riConfig.app.useLocalResources) {
        const results = await Promise.all(
          commands.map((command) =>
            resourcesService.get<ICommand>(`/static/commands/${command}.json`),
          ),
        )
        if (results.every(({ status }) => isStatusSuccessful(status))) {
          const data: ICommands = results.reduce(
            (obj, result) => ({
              ...obj,
              ...result.data,
            }),
            {},
          )

          dispatch(getRedisCommandsSuccess(data))
          onSuccessAction?.()
        }
      } else {
        const { data, status } = await apiService.get<GetServerInfoResponse>(
          ApiEndpoints.REDIS_COMMANDS,
        )
        if (isStatusSuccessful(status)) {
          dispatch(getRedisCommandsSuccess(data))
          onSuccessAction?.()
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getRedisCommandsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
