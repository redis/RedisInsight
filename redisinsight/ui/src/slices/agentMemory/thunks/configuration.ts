import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getAgentMemoryUrl, isStatusSuccessful } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../../store'
import { AgentMemoryConfiguration } from '../../interfaces/agentMemory'
import {
  getConfiguration,
  getConfigurationFailure,
  getConfigurationSuccess,
} from '../workspace'
import { isStaleResponse } from './helpers'

export function fetchConfigurationAction(endpointId: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(getConfiguration())

    try {
      const { data, status } = await apiService.get<AgentMemoryConfiguration>(
        getAgentMemoryUrl(endpointId, ApiEndpoints.AGENT_MEMORY_CONFIG),
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        dispatch(getConfigurationSuccess(data))
      }
    } catch (_err) {
      if (isStaleResponse(stateInit(), endpointId)) return
      dispatch(getConfigurationFailure())
    }
  }
}
