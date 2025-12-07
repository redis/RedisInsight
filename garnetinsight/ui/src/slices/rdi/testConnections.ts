import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import {
  getApiErrorMessage,
  getAxiosError,
  getRdiUrl,
  isStatusSuccessful,
  Maybe,
  Nullable,
  transformConnectionResults,
} from 'uiSrc/utils'
import {
  EnhancedAxiosError,
  IStateRdiTestConnections,
  TestConnectionsResponse,
  TransformResult,
} from 'uiSrc/slices/interfaces'
import { ApiEndpoints } from 'uiSrc/constants'
import { AppDispatch, RootState } from '../store'

export const initialState: IStateRdiTestConnections = {
  loading: false,
  error: '',
  results: null,
}

const rdiTestConnectionsSlice = createSlice({
  name: 'testConnections',
  initialState,
  reducers: {
    setInitialDryRunJob: () => initialState,
    testConnections: (state) => {
      state.loading = true
      state.results = null
    },
    testConnectionsSuccess: (
      state,
      { payload }: PayloadAction<TransformResult>,
    ) => {
      state.loading = false
      state.results = payload
      state.error = ''
    },
    testConnectionsFailure: (
      state,
      { payload }: PayloadAction<Maybe<string>>,
    ) => {
      state.loading = false
      state.results = null

      if (payload) {
        state.error = payload
      }
    },
  },
})

export const rdiTestConnectionsSelector = (state: RootState) =>
  state.rdi.testConnections

export const {
  testConnections,
  testConnectionsSuccess,
  testConnectionsFailure,
} = rdiTestConnectionsSlice.actions

// The reducer
export default rdiTestConnectionsSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let testConnectionsController: Nullable<AbortController> = null

// Asynchronous thunk action
export function testConnectionsAction(
  rdiInstanceId: string,
  config: unknown,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(testConnections())

    try {
      testConnectionsController?.abort()
      testConnectionsController = new AbortController()

      const { status, data } = await apiService.post<TestConnectionsResponse>(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_TEST_CONNECTIONS),
        config,
        {
          signal: testConnectionsController.signal,
        },
      )

      testConnectionsController = null

      if (isStatusSuccessful(status)) {
        dispatch(testConnectionsSuccess(transformConnectionResults(data)))
        onSuccessAction?.()
      }
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        const parsedError = getAxiosError(error as EnhancedAxiosError)
        const errorMessage = getApiErrorMessage(error)

        dispatch(addErrorNotification(parsedError))
        dispatch(testConnectionsFailure(errorMessage))
        onFailAction?.()
      } else {
        dispatch(testConnectionsFailure())
      }
    }
  }
}
