import { AxiosError } from 'axios'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getAgentMemoryUrl, isStatusSuccessful, Nullable } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../../store'
import { addErrorNotification } from '../../app/notifications'
import { SummaryView, SummaryViewPartition } from '../../interfaces/agentMemory'
import {
  getSummaries,
  getSummariesFailure,
  getSummariesSuccess,
  runSummaryViewFinished,
  runSummaryViewStarted,
} from '../workspace'
import { delay, isStaleResponse } from './helpers'

// Monotonic request id - a response only lands if no newer summaries
// request started while it was in flight.
let summariesRequestSeq = 0

const listPartitions = async (
  endpointId: string,
  viewId: string,
  params: Record<string, string | undefined>,
): Promise<SummaryViewPartition[]> => {
  const { data } = await apiService.get<SummaryViewPartition[]>(
    getAgentMemoryUrl(
      endpointId,
      ApiEndpoints.AGENT_MEMORY_SUMMARY_VIEWS,
      encodeURIComponent(viewId),
      'partitions',
    ),
    { params },
  )
  return data ?? []
}

/**
 * Partition filters must match the view's group_by keys exactly (a user
 * filter on a session-grouped view returns nothing), so the user filter
 * is pushed server-side only for user-grouped views; session-grouped
 * partitions are listed unfiltered and scoped client-side to the user's
 * known sessions.
 */
const scopePartitions = (
  view: SummaryView,
  partitions: SummaryViewPartition[],
  userId: Nullable<string>,
  sessions: string[],
): SummaryViewPartition[] => {
  if (!userId || !view.groupBy.includes('session_id')) return partitions
  return partitions.filter((partition) =>
    sessions.includes(partition.group?.session_id ?? ''),
  )
}

/**
 * Fetch every summary view and its partitions. A null view list (backend
 * without summary views) hides the summary pane.
 */
export function fetchSummariesAction(endpointId: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { userId } = stateInit().agentMemory.workspace.filters
    summariesRequestSeq += 1
    const requestSeq = summariesRequestSeq

    dispatch(getSummaries())

    try {
      const { data: views } = await apiService.get<Nullable<SummaryView[]>>(
        getAgentMemoryUrl(endpointId, ApiEndpoints.AGENT_MEMORY_SUMMARY_VIEWS),
      )

      if (isStaleResponse(stateInit(), endpointId)) return
      if (requestSeq !== summariesRequestSeq) return

      if (!views) {
        dispatch(getSummariesSuccess({ views: null, partitions: {} }))
        return
      }

      const partitionLists = await Promise.all(
        views.map((view) =>
          listPartitions(
            endpointId,
            view.id,
            userId && view.groupBy.includes('user_id') ? { userId } : {},
          ),
        ),
      )

      if (isStaleResponse(stateInit(), endpointId)) return
      if (requestSeq !== summariesRequestSeq) return

      const { sessions } = stateInit().agentMemory.workspace.filters
      const partitions = Object.fromEntries(
        views.map((view, i) => [
          view.id,
          scopePartitions(view, partitionLists[i], userId, sessions),
        ]),
      )

      dispatch(getSummariesSuccess({ views, partitions }))
    } catch (_err) {
      if (isStaleResponse(stateInit(), endpointId)) return
      if (requestSeq !== summariesRequestSeq) return
      dispatch(getSummariesFailure())
    }
  }
}

/** Create the default user/session profile views, then refresh the pane. */
export function createDefaultSummaryViewsAction(endpointId: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(getSummaries())

    try {
      const { status } = await apiService.post(
        getAgentMemoryUrl(
          endpointId,
          ApiEndpoints.AGENT_MEMORY_SUMMARY_VIEWS,
          'default',
        ),
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        await dispatch(fetchSummariesAction(endpointId))
      }
    } catch (_err) {
      if (isStaleResponse(stateInit(), endpointId)) return
      const error = _err as AxiosError
      dispatch(getSummariesFailure())
      dispatch(addErrorNotification(error))
    }
  }
}

/**
 * Delete a view's configuration. The server keeps already-computed
 * partition summaries in storage, but they are no longer listable.
 */
export function deleteSummaryViewAction(endpointId: string, viewId: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(getSummaries())

    try {
      const { status } = await apiService.delete(
        getAgentMemoryUrl(
          endpointId,
          ApiEndpoints.AGENT_MEMORY_SUMMARY_VIEWS,
          encodeURIComponent(viewId),
        ),
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        await dispatch(fetchSummariesAction(endpointId))
      }
    } catch (_err) {
      if (isStaleResponse(stateInit(), endpointId)) return
      const error = _err as AxiosError
      dispatch(getSummariesFailure())
      dispatch(addErrorNotification(error))
    }
  }
}

const RUN_VIEW_POLL_ATTEMPTS = 10
const RUN_VIEW_POLL_DELAY_MS = 3_000

/**
 * Recompute ALL partitions of a view. The server runs it as an async
 * background task, so keep refetching (bounded) until its partitions
 * appear; runningViewIds disables the trigger meanwhile.
 */
export function runSummaryViewAction(endpointId: string, viewId: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(runSummaryViewStarted(viewId))

    try {
      const { status } = await apiService.post(
        getAgentMemoryUrl(
          endpointId,
          ApiEndpoints.AGENT_MEMORY_SUMMARY_VIEWS,
          encodeURIComponent(viewId),
          'run',
        ),
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        for (let attempt = 0; attempt < RUN_VIEW_POLL_ATTEMPTS; attempt += 1) {
          await delay(RUN_VIEW_POLL_DELAY_MS)
          if (isStaleResponse(stateInit(), endpointId)) return

          await dispatch(fetchSummariesAction(endpointId))
          const { partitions } = stateInit().agentMemory.workspace.summary
          if ((partitions[viewId] ?? []).length) break
        }
      }
    } catch (_err) {
      if (isStaleResponse(stateInit(), endpointId)) return
      dispatch(addErrorNotification(_err as AxiosError))
    } finally {
      dispatch(runSummaryViewFinished(viewId))
    }
  }
}

/**
 * Recompute one partition (runs the LLM synchronously server-side). The
 * group comes from the partition card, so it always matches the view's
 * group_by keys.
 */
export function runSummaryPartitionAction(
  endpointId: string,
  viewId: string,
  group: Record<string, string>,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(getSummaries())

    try {
      const { status } = await apiService.post<SummaryViewPartition>(
        getAgentMemoryUrl(
          endpointId,
          ApiEndpoints.AGENT_MEMORY_SUMMARY_VIEWS,
          encodeURIComponent(viewId),
          'partitions',
          'run',
        ),
        { group },
      )

      if (isStaleResponse(stateInit(), endpointId)) return

      if (isStatusSuccessful(status)) {
        onSuccess?.()
        await dispatch(fetchSummariesAction(endpointId))
      }
    } catch (_err) {
      if (isStaleResponse(stateInit(), endpointId)) return
      dispatch(getSummariesFailure())
      dispatch(addErrorNotification(_err as AxiosError))
    }
  }
}
