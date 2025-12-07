import { createSlice } from '@reduxjs/toolkit'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getApiErrorsFromBulkOperation,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import {
  ICredentialsRedisCluster,
  InitialStateCluster,
  InstanceRedisCluster,
} from '../interfaces'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const initialState: InitialStateCluster = {
  loading: false,
  error: '',
  data: null,
  dataAdded: [],
  credentials: null,
}

// A slice for recipes
const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    // load  redis cluster instances
    loadInstancesRedisCluster: (state) => {
      state.loading = true
      state.error = ''
    },
    loadInstancesRedisClusterSuccess: (state, { payload }) => {
      state.data = payload?.data
      state.loading = false
      state.credentials = payload?.credentials
    },
    loadInstancesRedisClusterFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // add  redis cluster instances
    createInstancesRedisCluster: (state) => {
      state.loading = true
      state.error = ''
    },
    createInstancesRedisClusterSuccess: (state, { payload }) => {
      state.loading = false

      state.dataAdded = payload?.map((instance: InstanceRedisCluster) => ({
        ...(instance.databaseDetails || {}),
        uidAdded: instance.uid,
        statusAdded: instance.status,
        messageAdded: instance.message,
      }))
    },
    createInstancesRedisClusterFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // reset data for cluster slice
    resetDataRedisCluster: () => initialState,

    // reset instances for cluster slice
    resetInstancesRedisCluster: (state) => ({
      ...initialState,
      credentials: state.credentials,
    }),
  },
})

// Actions generated from the slice
export const {
  loadInstancesRedisCluster,
  loadInstancesRedisClusterSuccess,
  loadInstancesRedisClusterFailure,
  createInstancesRedisCluster,
  createInstancesRedisClusterSuccess,
  createInstancesRedisClusterFailure,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} = clusterSlice.actions

// A selector
export const clusterSelector = (state: RootState) => state.connections.cluster

// The reducer
export default clusterSlice.reducer

// Asynchronous thunk action
export function fetchInstancesRedisCluster(
  payload: ICredentialsRedisCluster,
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstancesRedisCluster())

    try {
      const { data, status } = await apiService.post(
        `${ApiEndpoints.REDIS_CLUSTER_GET_DATABASES}`,
        { ...payload },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadInstancesRedisClusterSuccess({ data, credentials: payload }),
        )
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadInstancesRedisClusterFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function addInstancesRedisCluster(payload: {
  uids: Maybe<number>[]
  credentials: Nullable<ICredentialsRedisCluster>
}) {
  return async (dispatch: AppDispatch) => {
    dispatch(createInstancesRedisCluster())

    try {
      const { data, status } = await apiService.post(
        `${ApiEndpoints.REDIS_CLUSTER_DATABASES}`,
        { uids: payload.uids, ...payload.credentials },
      )

      if (isStatusSuccessful(status)) {
        const encryptionErrors = getApiErrorsFromBulkOperation(
          data,
          ...ApiEncryptionErrors,
        )
        if (encryptionErrors.length) {
          dispatch(addErrorNotification(encryptionErrors[0]))
        }
        dispatch(createInstancesRedisClusterSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(createInstancesRedisClusterFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}
