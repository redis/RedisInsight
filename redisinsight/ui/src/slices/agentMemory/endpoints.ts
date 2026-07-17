import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { map } from 'lodash'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  getAgentMemoryUrl,
  getApiErrorMessage,
  isStatusSuccessful,
} from 'uiSrc/utils'

import { AppDispatch, RootState } from '../store'
import {
  addErrorNotification,
  addMessageNotification,
} from '../app/notifications'
import {
  AgentMemoryBackendType,
  AgentMemoryCapabilities,
  AgentMemoryEndpoint,
  StateAgentMemoryEndpoints,
} from '../interfaces/agentMemory'

export const initialState: StateAgentMemoryEndpoints = {
  loading: false,
  error: '',
  data: [],
  loadingChanging: false,
  connectedEndpoint: {
    id: '',
    name: '',
    url: '',
    backendType: AgentMemoryBackendType.Oss,
    loading: false,
    error: '',
    capabilities: null,
  },
}

const endpointsSlice = createSlice({
  name: 'agentMemoryEndpoints',
  initialState,
  reducers: {
    loadEndpoints: (state) => {
      state.loading = true
      state.error = ''
    },
    loadEndpointsSuccess: (
      state,
      { payload }: { payload: AgentMemoryEndpoint[] },
    ) => {
      state.data = payload
      state.loading = false
    },
    loadEndpointsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // add/edit endpoint
    endpointChanging: (state) => {
      state.loadingChanging = true
    },
    endpointChangingSuccess: (state) => {
      state.loadingChanging = false
    },
    endpointChangingFailure: (state) => {
      state.loadingChanging = false
    },

    // delete endpoints
    deleteEndpoints: (state) => {
      state.loading = true
      state.error = ''
    },
    deleteEndpointsSuccess: (state) => {
      state.loading = false
    },
    deleteEndpointsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // connect to an endpoint (fetch + capabilities)
    setConnectedEndpoint: (state) => {
      state.connectedEndpoint = {
        ...initialState.connectedEndpoint,
        loading: true,
      }
    },
    setConnectedEndpointSuccess: (
      state,
      {
        payload,
      }: {
        payload: {
          endpoint: AgentMemoryEndpoint
          capabilities: AgentMemoryCapabilities
        }
      },
    ) => {
      state.connectedEndpoint = {
        ...state.connectedEndpoint,
        ...payload.endpoint,
        capabilities: payload.capabilities,
        loading: false,
        error: '',
      }
    },
    setConnectedEndpointFailure: (state, { payload }) => {
      state.connectedEndpoint.error = payload
      state.connectedEndpoint.loading = false
    },
    resetConnectedEndpoint: (state) => {
      state.connectedEndpoint = initialState.connectedEndpoint
    },
  },
})

export const {
  loadEndpoints,
  loadEndpointsSuccess,
  loadEndpointsFailure,
  endpointChanging,
  endpointChangingSuccess,
  endpointChangingFailure,
  deleteEndpoints,
  deleteEndpointsSuccess,
  deleteEndpointsFailure,
  setConnectedEndpoint,
  setConnectedEndpointSuccess,
  setConnectedEndpointFailure,
  resetConnectedEndpoint,
} = endpointsSlice.actions

// selectors
export const agentMemoryEndpointsSelector = (state: RootState) =>
  state.agentMemory.endpoints
export const connectedAgentMemoryEndpointSelector = (state: RootState) =>
  state.agentMemory.endpoints.connectedEndpoint

export default endpointsSlice.reducer

export function fetchEndpointsAction(
  onSuccess?: (data: AgentMemoryEndpoint[]) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadEndpoints())

    try {
      const { data, status } = await apiService.get<AgentMemoryEndpoint[]>(
        ApiEndpoints.AGENT_MEMORY_ENDPOINTS,
      )

      if (isStatusSuccessful(status)) {
        onSuccess?.(data)
        dispatch(loadEndpointsSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadEndpointsFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

export function createEndpointAction(
  payload: Partial<AgentMemoryEndpoint>,
  onSuccess?: (data: AgentMemoryEndpoint) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(endpointChanging())

    try {
      const { status, data } = await apiService.post<AgentMemoryEndpoint>(
        ApiEndpoints.AGENT_MEMORY_ENDPOINTS,
        payload,
      )

      if (isStatusSuccessful(status)) {
        dispatch(endpointChangingSuccess())
        dispatch(fetchEndpointsAction())
        dispatch(
          addMessageNotification(
            successMessages.ADDED_NEW_AGENT_MEMORY_ENDPOINT(payload.name ?? ''),
          ),
        )
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(endpointChangingFailure())
      dispatch(addErrorNotification(error))
    }
  }
}

export function editEndpointAction(
  id: string,
  payload: Partial<AgentMemoryEndpoint>,
  onSuccess?: (data: AgentMemoryEndpoint) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(endpointChanging())

    try {
      const { status, data } = await apiService.patch<AgentMemoryEndpoint>(
        `${ApiEndpoints.AGENT_MEMORY_ENDPOINTS}/${id}`,
        payload,
      )

      if (isStatusSuccessful(status)) {
        dispatch(endpointChangingSuccess())
        dispatch(fetchEndpointsAction())
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(endpointChangingFailure())
      dispatch(addErrorNotification(error))
    }
  }
}

export function deleteEndpointsAction(
  endpoints: AgentMemoryEndpoint[],
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(deleteEndpoints())

    try {
      const ids = map(endpoints, 'id')

      const { status } = await apiService.delete(
        ApiEndpoints.AGENT_MEMORY_ENDPOINTS,
        { data: { ids } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteEndpointsSuccess())
        dispatch(fetchEndpointsAction())
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(deleteEndpointsFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

export function connectEndpointAction(
  id: string,
  onSuccess?: () => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setConnectedEndpoint())

    try {
      const [{ data: endpoint }, { data: capabilities }] = await Promise.all([
        apiService.get<AgentMemoryEndpoint>(
          `${ApiEndpoints.AGENT_MEMORY_ENDPOINTS}/${id}`,
        ),
        apiService.get<AgentMemoryCapabilities>(
          getAgentMemoryUrl(id, ApiEndpoints.AGENT_MEMORY_CONNECT),
        ),
      ])

      dispatch(setConnectedEndpointSuccess({ endpoint, capabilities }))
      onSuccess?.()
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setConnectedEndpointFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFail?.()
    }
  }
}
