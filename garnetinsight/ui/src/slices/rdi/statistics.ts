import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import {
  IRdiStatistics,
  IStateRdiStatistics,
} from 'uiSrc/slices/interfaces/rdi'
import { getApiErrorMessage, getRdiUrl, isStatusSuccessful } from 'uiSrc/utils'
import { AppDispatch, RootState } from '../store'

export const initialState: IStateRdiStatistics = {
  loading: true,
  error: '',
  results: null,
}

const rdiStatisticsSlice = createSlice({
  name: 'rdiStatistics',
  initialState,
  reducers: {
    getStatistics: (state) => {
      state.loading = true
    },
    getStatisticsSuccess: (
      state,
      { payload }: PayloadAction<IRdiStatistics>,
    ) => {
      state.loading = false
      state.error = ''
      state.results = {
        data: { ...state?.results?.data, ...payload.data },
        status: payload.status,
      }
    },
    getStatisticsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

export const rdiStatisticsSelector = (state: RootState) => state.rdi.statistics

export const { getStatistics, getStatisticsSuccess, getStatisticsFailure } =
  rdiStatisticsSlice.actions

// The reducer
export default rdiStatisticsSlice.reducer

// Asynchronous thunk action
export function fetchRdiStatistics(
  rdiInstanceId: string,
  section?: string,
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getStatistics())
      const { data, status } = await apiService.get<IRdiStatistics>(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_STATISTICS),
        section ? { params: { sections: section } } : undefined,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getStatisticsSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getStatisticsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
