import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import {
  getApiErrorMessage,
  getAxiosError,
  isStatusSuccessful,
} from 'uiSrc/utils'
import {
  EnhancedAxiosError,
  IDryRunJobResults,
  IStateRdiDryRunJob,
} from 'uiSrc/slices/interfaces'

import { AppDispatch, RootState } from '../store'

export const initialState: IStateRdiDryRunJob = {
  loading: false,
  error: '',
  results: null,
}

const rdiPipelineSlice = createSlice({
  name: 'dryRunJob',
  initialState,
  reducers: {
    setInitialDryRunJob: () => initialState,
    dryRunJob: (state) => {
      state.loading = true
      state.results = null
    },
    dryRunJobSuccess: (
      state,
      { payload }: PayloadAction<IDryRunJobResults>,
    ) => {
      state.loading = false
      state.results = payload
      state.error = ''
    },
    dryRunJobFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.results = null
    },
  },
})

export const rdiDryRunJobSelector = (state: RootState) => state.rdi.dryRun

export const {
  dryRunJob,
  dryRunJobSuccess,
  dryRunJobFailure,
  setInitialDryRunJob,
} = rdiPipelineSlice.actions

// The reducer
export default rdiPipelineSlice.reducer

// Asynchronous thunk action
export function rdiDryRunJob(
  rdiInstanceId: string,
  input_data: object,
  job: unknown,
  onSuccessAction?: (data: IDryRunJobResults) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(dryRunJob())
      const { data, status } = await apiService.post<IDryRunJobResults>(
        `rdi/${rdiInstanceId}/pipeline/dry-run-job`,
        {
          input_data,
          job,
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(dryRunJobSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const parsedError = getAxiosError(error as EnhancedAxiosError)
      const errorMessage = getApiErrorMessage(error)

      dispatch(addErrorNotification(parsedError))
      dispatch(dryRunJobFailure(errorMessage))
      onFailAction?.()
    }
  }
}
