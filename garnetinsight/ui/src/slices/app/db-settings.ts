import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { getDbSettings } from 'uiSrc/services/databaseSettingsService'
import { DatabaseSettings, DatabaseSettingsData } from '../interfaces'
import { AppDispatch, RootState } from '../store'

export const initialState: DatabaseSettings = {
  loading: false,
  error: '',
  data: {},
}

// A slice for recipes
const appDbSettingsSlice = createSlice({
  name: 'appDbSettings',
  initialState,
  reducers: {
    getDBSettings: (state) => {
      state.loading = true
    },
    getDBSettingsSuccess: (
      state,
      {
        payload: { data, id },
      }: {
        payload: {
          id: string
          data: DatabaseSettingsData
        }
      },
    ) => {
      state.loading = false
      state.data = { ...state.data, [id]: data }
    },
    getDBSettingsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const { getDBSettings, getDBSettingsSuccess, getDBSettingsFailure } =
  appDbSettingsSlice.actions

// A selector
export const appDBSettingsSelector = (state: RootState) => state.app.dbSettings

// The reducer
export default appDbSettingsSlice.reducer

// Asynchronous thunk action
export function fetchDBSettings(
  id: string,
  onSuccessAction?: (payload: {
    id: string
    data: DatabaseSettingsData
  }) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getDBSettings())
    if (!id) {
      dispatch(getDBSettingsFailure('DB not connected'))
      onFailAction?.()
      return
    }
    try {
      const { data, status } = await getDbSettings(id)
      if (isStatusSuccessful(status)) {
        dispatch(getDBSettingsSuccess({ id, data }))
        onSuccessAction?.({
          id,
          data,
        })
      } else {
        dispatch(getDBSettingsFailure(data))
        onFailAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(getDBSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
