import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getAgentMemoryUrl, isStatusSuccessful, Nullable } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../../store'
import {
  loadFilters,
  loadFiltersFailure,
  loadFiltersSuccess,
  loadSessionsSuccess,
  setSessionId,
  setUserId,
} from '../workspace'
import { isStaleResponse } from './helpers'
import { fetchWorkingMemoryAction } from './working-memory'
import { fetchOverviewLongTermMemoryAction } from './long-term-memory'

/**
 * Discover users (and the namespaces present in long-term memory),
 * auto-pick the most recently active user (discovery preserves scan order
 * - the first entry is the most recent), then load that user's sessions
 * and auto-pick the most recent session.
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
      const { userId } = stateInit().agentMemory.workspace.filters
      const { data, status } = await apiService.get<string[]>(
        getAgentMemoryUrl(endpointId, ApiEndpoints.AGENT_MEMORY_SESSIONS),
        { params: { userId } },
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
 * Apply a user pick. Session listing depends on the user, so sessions are
 * re-listed (auto-picking the first returned - server order is
 * unspecified) before the panes refetch - fetching earlier would pair the
 * new scope with the previous scope's session.
 */
export function changeScopeAction(
  endpointId: string,
  scope: { userId?: Nullable<string> },
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    if (scope.userId !== undefined) dispatch(setUserId(scope.userId))

    await dispatch(fetchSessionsAction(endpointId, true))
    if (isStaleResponse(stateInit(), endpointId)) return

    dispatch(fetchWorkingMemoryAction(endpointId))
    dispatch(fetchOverviewLongTermMemoryAction(endpointId))
  }
}
