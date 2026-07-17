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
import {
  AgentMemorySessionEvent,
  WorkingMemory,
} from '../../interfaces/agentMemory'
import {
  clearWorkingMemorySuccess,
  getWorkingMemory,
  getWorkingMemoryFailure,
  getWorkingMemorySuccess,
  setSessionId,
} from '../workspace'
import { delay, isStaleResponse } from './helpers'
import { fetchSessionsAction } from './scope'
import { fetchLongTermMemoryAction } from './long-term-memory'

/**
 * Fetch working memory for the selected session. Errors are stored in
 * state (shown as an inline status) rather than raised as notifications.
 */
export function fetchWorkingMemoryAction(endpointId: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { userId, namespace, sessionId } =
      stateInit().agentMemory.workspace.filters
    if (!sessionId) return

    // A response for a session the user has already switched away from
    // would repopulate the panel setSessionId just cleared.
    const isStale = () =>
      isStaleResponse(stateInit(), endpointId) ||
      stateInit().agentMemory.workspace.filters.sessionId !== sessionId

    dispatch(getWorkingMemory())

    try {
      const { data, status } = await apiService.get<WorkingMemory>(
        getAgentMemoryUrl(
          endpointId,
          ApiEndpoints.AGENT_MEMORY_WORKING_MEMORY,
          encodeURIComponent(sessionId),
        ),
        { params: { userId, namespace } },
      )

      if (isStale()) return

      if (isStatusSuccessful(status)) {
        dispatch(getWorkingMemorySuccess(data))
      }
    } catch (_err) {
      if (isStale()) return
      dispatch(getWorkingMemoryFailure(getApiErrorMessage(_err as AxiosError)))
    }
  }
}

export function clearWorkingMemoryAction(
  endpointId: string,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { userId, namespace, sessionId } =
      stateInit().agentMemory.workspace.filters
    if (!sessionId) return

    try {
      const { status } = await apiService.delete(
        getAgentMemoryUrl(
          endpointId,
          ApiEndpoints.AGENT_MEMORY_WORKING_MEMORY,
          encodeURIComponent(sessionId),
        ),
        { params: { userId, namespace } },
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        dispatch(clearWorkingMemorySuccess())
        onSuccess?.()
        await dispatch(fetchWorkingMemoryAction(endpointId))
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
    }
  }
}

const EXTRACTION_FOLLOW_UP_DELAYS_MS = [3_000, 8_000, 15_000]

const followUpAfterExtraction = async (
  endpointId: string,
  dispatch: AppDispatch,
  stateInit: () => RootState,
) => {
  for (const wait of EXTRACTION_FOLLOW_UP_DELAYS_MS) {
    await delay(wait)
    if (isStaleResponse(stateInit(), endpointId)) return
    dispatch(fetchWorkingMemoryAction(endpointId))
    dispatch(fetchLongTermMemoryAction(endpointId, true))
  }
}

/**
 * Append one message to a session's working memory. A new session id is
 * adopted as the connected session so the working-memory pane shows what
 * was just written.
 */
export function addSessionEventAction(
  endpointId: string,
  event: AgentMemorySessionEvent,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { userId, namespace, sessionId } =
      stateInit().agentMemory.workspace.filters

    try {
      const { status } = await apiService.post(
        getAgentMemoryUrl(
          endpointId,
          ApiEndpoints.AGENT_MEMORY_WORKING_MEMORY,
          encodeURIComponent(event.sessionId),
          'messages',
        ),
        { role: event.role, content: event.content },
        { params: { userId, namespace } },
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        onSuccess?.()
        if (sessionId !== event.sessionId) {
          dispatch(setSessionId(event.sessionId))
          await dispatch(fetchSessionsAction(endpointId))
        }
        await dispatch(fetchWorkingMemoryAction(endpointId))
        // Long-term extraction runs async server-side - a few detached
        // refetches surface the extracted flag and new records without
        // holding the submit promise open.
        followUpAfterExtraction(endpointId, dispatch, stateInit)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
    }
  }
}
