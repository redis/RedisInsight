import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getAgentMemoryUrl, isStatusSuccessful, Nullable } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../../store'
import {
  loadFilters,
  loadFiltersFailure,
  loadFiltersSuccess,
  loadSessionsSuccess,
  setNamespace,
  setSessionId,
  setUserId,
} from '../workspace'
import { isStaleResponse } from './helpers'
import { fetchWorkingMemoryAction } from './working-memory'
import { fetchLongTermMemoryAction } from './long-term-memory'
import { fetchSummariesAction } from './summary-views'

/**
 * Discover users + namespaces, auto-pick the most recently active values
 * (discovery preserves scan order - the first entry is the most recent),
 * then load sessions for that scope and auto-pick the most recent session.
 */
export function discoverFiltersAction(endpointId: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadFilters())

    try {
      const { data, status } = await apiService.get<{
        users: string[]
        namespaces: string[]
      }>(getAgentMemoryUrl(endpointId, ApiEndpoints.AGENT_MEMORY_DISCOVERY))

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        dispatch(loadFiltersSuccess(data))
        dispatch(setUserId(data.users[0] ?? null))
        dispatch(setNamespace(data.namespaces[0] ?? null))
        await dispatch(fetchSessionsAction(endpointId, true))
      }
    } catch (_err) {
      if (isStaleResponse(stateInit(), endpointId)) return
      dispatch(loadFiltersFailure())
    }
  }
}

/** Internal to the thunks - not part of the slice's public surface. */
export function fetchSessionsAction(endpointId: string, autoPick = false) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const { userId, namespace } = stateInit().agentMemory.workspace.filters
      const { data, status } = await apiService.get<string[]>(
        getAgentMemoryUrl(endpointId, ApiEndpoints.AGENT_MEMORY_SESSIONS),
        { params: { userId, namespace } },
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        dispatch(loadSessionsSuccess(data))
        if (autoPick) {
          dispatch(setSessionId(data[0] ?? null))
        }
      }
    } catch (_err) {
      // Keep the current session list on transient failures - replacing it
      // with [] would also wipe the explorer's session filters.
    }
  }
}

/**
 * Apply a user/namespace pick. The pickers are linked: session listing
 * depends on both, so sessions are re-listed (auto-picking the first
 * returned - server order is unspecified) before the panes refetch -
 * fetching earlier would pair the new scope with the previous scope's
 * session.
 */
export function changeScopeAction(
  endpointId: string,
  scope: { userId?: Nullable<string>; namespace?: Nullable<string> },
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    if (scope.userId !== undefined) dispatch(setUserId(scope.userId))
    if (scope.namespace !== undefined) dispatch(setNamespace(scope.namespace))

    await dispatch(fetchSessionsAction(endpointId, true))
    if (isStaleResponse(stateInit(), endpointId)) return

    dispatch(fetchWorkingMemoryAction(endpointId))
    dispatch(fetchLongTermMemoryAction(endpointId, true))
    dispatch(fetchSummariesAction(endpointId))
  }
}
