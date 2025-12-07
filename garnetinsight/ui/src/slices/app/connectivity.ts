import { createSlice } from '@reduxjs/toolkit'
import { getDatabaseConfigInfoAction } from 'uiSrc/slices/instances/instances'

import { AppDispatch, RootState } from '../store'
import { StateAppConnectivity } from '../interfaces'

export const initialState: StateAppConnectivity = {
  loading: false,
  error: undefined,
}

const appConnectivitySlice = createSlice({
  name: 'appConnectivity',
  initialState,
  reducers: {
    setConnectivityLoading: (state, { payload }) => {
      state.loading = payload
    },
    setConnectivityError: (state, { payload }) => {
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const { setConnectivityLoading, setConnectivityError } =
  appConnectivitySlice.actions

// A selector
export const appConnectivity = (state: RootState) => state.app.connectivity
export const appConnectivityError = (state: RootState) =>
  state.app.connectivity.error

// The reducer
export default appConnectivitySlice.reducer

// Asynchronous thunk action
export const retryConnection =
  (
    connectionInstanceId: string,
    onSuccessAction?: () => void,
    onFailAction?: () => void,
  ) =>
  (dispatch: AppDispatch) => {
    dispatch(setConnectivityLoading(true))

    return dispatch(
      getDatabaseConfigInfoAction(
        connectionInstanceId,
        () => {
          dispatch(setConnectivityError(null))
          dispatch(setConnectivityLoading(false))
          onSuccessAction?.()
        },
        () => {
          dispatch(setConnectivityLoading(false))
          onFailAction?.()
        },
      ),
    )
  }
