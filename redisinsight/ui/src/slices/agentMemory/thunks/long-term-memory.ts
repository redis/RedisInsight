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
 * Core long-term-memory fetch. `useSharedScope` narrows the query to the
 * shared Overview user + session pills; otherwise only the explorer's own
 * filter row applies. Failures land in state instead of notifications.
 */
function fetchLongTermMemory(endpointId: string, useSharedScope: boolean) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { filters, longTermMemory } = stateInit().agentMemory.workspace
    // The Overview pane narrows to the shared user + session pills; the
    // explorer tab is independent and applies only its own filter row.
    const sessionIds =
      useSharedScope && filters.sessionId
        ? [filters.sessionId]
        : longTermMemory.sessionIds
    const sharedUserId = useSharedScope
      ? (filters.userId ?? undefined)
      : undefined
    longTermRequestSeq += 1
    const requestSeq = longTermRequestSeq

    dispatch(getLongTermMemory())

    try {
      const body: Record<string, unknown> = {
        text: longTermMemory.search,
        similarityThreshold: longTermMemory.similarityThreshold ?? undefined,
        userId: longTermMemory.userIds.length ? undefined : sharedUserId,
        userIds: longTermMemory.userIds.length
          ? longTermMemory.userIds
          : undefined,
        namespaces: longTermMemory.namespaces.length
          ? longTermMemory.namespaces
          : undefined,
        topics: longTermMemory.topics.length
          ? longTermMemory.topics
          : undefined,
        sessionIds: sessionIds.length ? sessionIds : undefined,
        memoryTypes: longTermMemory.memoryTypes.length
          ? longTermMemory.memoryTypes
          : undefined,
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

/** Long-term memory explorer tab: independent of the Overview pills. */
export function fetchLongTermMemoryAction(endpointId: string) {
  return fetchLongTermMemory(endpointId, false)
}

/** Overview pane: scoped to the shared user + session pills. */
export function fetchOverviewLongTermMemoryAction(endpointId: string) {
  return fetchLongTermMemory(endpointId, true)
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
