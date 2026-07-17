import { AxiosError } from 'axios'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getAgentMemoryUrl,
  getApiErrorMessage,
  isStatusSuccessful,
} from 'uiSrc/utils'

import { AppDispatch, RootState } from '../../store'
import { addErrorNotification } from '../../app/notifications'
import { LongTermMemoryRecord } from '../../interfaces/agentMemory'
import {
  getLongTermMemory,
  getLongTermMemoryFailure,
  getLongTermMemorySuccess,
} from '../workspace'
import { isStaleResponse } from './helpers'

// Monotonic request id - a response only lands if no newer long-term
// request started while it was in flight.
let longTermRequestSeq = 0

/**
 * Fetch long-term memory with the active filters. Failures land in state
 * instead of notifications.
 */
export function fetchLongTermMemoryAction(
  endpointId: string,
  scopeToSession = false,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { filters, longTermMemory } = stateInit().agentMemory.workspace
    // The Overview pane follows the picked session; the explorer's own
    // sessions multi-select governs otherwise.
    const sessionIds =
      scopeToSession && filters.sessionId
        ? [filters.sessionId]
        : longTermMemory.sessionIds
    longTermRequestSeq += 1
    const requestSeq = longTermRequestSeq

    dispatch(getLongTermMemory())

    try {
      // The explorer's user/namespace multi-selects override the shared
      // Overview scope; with nothing picked the shared scope applies.
      const body: Record<string, unknown> = {
        text: longTermMemory.search,
        userId: longTermMemory.userIds.length
          ? undefined
          : (filters.userId ?? undefined),
        userIds: longTermMemory.userIds.length
          ? longTermMemory.userIds
          : undefined,
        namespace: longTermMemory.namespaces.length
          ? undefined
          : (filters.namespace ?? undefined),
        namespaces: longTermMemory.namespaces.length
          ? longTermMemory.namespaces
          : undefined,
        topics: longTermMemory.topics.length
          ? longTermMemory.topics
          : undefined,
        entities: longTermMemory.entities.length
          ? longTermMemory.entities
          : undefined,
        sessionIds: sessionIds.length ? sessionIds : undefined,
        memoryTypes: longTermMemory.memoryTypes.length
          ? longTermMemory.memoryTypes
          : undefined,
        optimizeQuery: longTermMemory.optimizeQuery || undefined,
      }

      const { data, status } = await apiService.post<{
        memories: LongTermMemoryRecord[]
        total: number
      }>(
        getAgentMemoryUrl(endpointId, ApiEndpoints.AGENT_MEMORY_LTM_SEARCH),
        body,
      )
      if (requestSeq !== longTermRequestSeq) return

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        dispatch(getLongTermMemorySuccess(data.memories ?? []))
      }
    } catch (_err) {
      if (requestSeq !== longTermRequestSeq) return
      if (isStaleResponse(stateInit(), endpointId)) return
      dispatch(getLongTermMemoryFailure(getApiErrorMessage(_err as AxiosError)))
    }
  }
}

export function deleteLongTermMemoryAction(
  endpointId: string,
  memoryId: string,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const { status } = await apiService.delete(
        getAgentMemoryUrl(endpointId, ApiEndpoints.AGENT_MEMORY_LTM),
        { data: { ids: [memoryId] } },
      )

      if (isStatusSuccessful(status)) {
        onSuccess?.()
        await dispatch(fetchLongTermMemoryAction(endpointId))
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
    }
  }
}
