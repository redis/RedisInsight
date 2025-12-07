import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { StateClusterDetails } from 'uiSrc/slices/interfaces/analytics'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'

import { ClusterDetails } from 'apiSrc/modules/cluster-monitor/models/cluster-details'
import { AppDispatch, RootState } from '../store'

export const initialState: StateClusterDetails = {
  loading: false,
  error: '',
  data: null,
}

const clusterDetailsSlice = createSlice({
  name: 'clusterDetails',
  initialState,
  reducers: {
    setClusterDetailsInitialState: () => initialState,
    getClusterDetails: (state) => {
      state.loading = true
    },
    getClusterDetailsSuccess: (
      state,
      { payload }: PayloadAction<ClusterDetails>,
    ) => {
      state.loading = false
      state.data = payload
    },
    getClusterDetailsError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

export const clusterDetailsSelector = (state: RootState) =>
  state.analytics.clusterDetails

export const {
  setClusterDetailsInitialState,
  getClusterDetails,
  getClusterDetailsSuccess,
  getClusterDetailsError,
} = clusterDetailsSlice.actions

// The reducer
export default clusterDetailsSlice.reducer

// Asynchronous thunk action
export function fetchClusterDetailsAction(
  instanceId: string,
  onSuccessAction?: (data: ClusterDetails) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getClusterDetails())

      const { data, status } = await apiService.get<ClusterDetails>(
        getUrl(instanceId, ApiEndpoints.CLUSTER_DETAILS),
      )

      if (isStatusSuccessful(status)) {
        dispatch(getClusterDetailsSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getClusterDetailsError(errorMessage))
      onFailAction?.()
    }
  }
}
