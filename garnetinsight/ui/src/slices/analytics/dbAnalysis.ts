import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { Vote } from 'uiSrc/constants/recommendations'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import {
  StateDatabaseAnalysis,
  DatabaseAnalysisViewTab,
} from 'uiSrc/slices/interfaces/analytics'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import {
  DatabaseAnalysis,
  ShortDatabaseAnalysis,
} from 'apiSrc/modules/database-analysis/models'

import { AppDispatch, RootState } from '../store'

export const initialState: StateDatabaseAnalysis = {
  loading: false,
  error: '',
  data: null,
  selectedViewTab: DatabaseAnalysisViewTab.DataSummary,
  history: {
    loading: false,
    error: '',
    data: [],
    showNoExpiryGroup: false,
    selectedAnalysis: null,
  },
}

const databaseAnalysisSlice = createSlice({
  name: 'databaseAnalysis',
  initialState,
  reducers: {
    setDatabaseAnalysisInitialState: () => initialState,
    getDBAnalysis: (state) => {
      state.loading = true
    },
    getDBAnalysisSuccess: (
      state,
      { payload }: PayloadAction<DatabaseAnalysis>,
    ) => {
      state.loading = false
      state.data = payload
    },
    getDBAnalysisError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setRecommendationVote: () => {
      // we don't have any loading here
    },
    setRecommendationVoteSuccess: (
      state,
      { payload }: PayloadAction<DatabaseAnalysis>,
    ) => {
      state.data = payload
    },
    setRecommendationVoteError: (state, { payload }) => {
      state.error = payload
    },
    loadDBAnalysisReports: (state) => {
      state.history.loading = true
    },
    loadDBAnalysisReportsSuccess: (
      state,
      { payload }: PayloadAction<ShortDatabaseAnalysis[]>,
    ) => {
      state.history.loading = false
      state.history.data = payload
    },
    loadDBAnalysisReportsError: (state, { payload }) => {
      state.history.loading = false
      state.history.error = payload
    },
    setSelectedAnalysisId: (state, { payload }: PayloadAction<string>) => {
      state.history.selectedAnalysis = payload
    },
    setShowNoExpiryGroup: (state, { payload }: PayloadAction<boolean>) => {
      state.history.showNoExpiryGroup = payload
    },
    setDatabaseAnalysisViewTab: (
      state,
      { payload }: PayloadAction<DatabaseAnalysisViewTab>,
    ) => {
      state.selectedViewTab = payload
    },
  },
})

export const dbAnalysisSelector = (state: RootState) =>
  state.analytics.databaseAnalysis
export const dbAnalysisReportsSelector = (state: RootState) =>
  state.analytics.databaseAnalysis.history
export const dbAnalysisViewTabSelector = (state: RootState) =>
  state.analytics.databaseAnalysis.selectedViewTab

export const {
  setDatabaseAnalysisInitialState,
  getDBAnalysis,
  getDBAnalysisSuccess,
  getDBAnalysisError,
  loadDBAnalysisReports,
  loadDBAnalysisReportsSuccess,
  loadDBAnalysisReportsError,
  setSelectedAnalysisId,
  setShowNoExpiryGroup,
  setDatabaseAnalysisViewTab,
  setRecommendationVote,
  setRecommendationVoteSuccess,
  setRecommendationVoteError,
} = databaseAnalysisSlice.actions

// The reducer
export default databaseAnalysisSlice.reducer

// Asynchronous thunk action
export function fetchDBAnalysisAction(
  instanceId: string,
  id: string,
  onSuccessAction?: (data: DatabaseAnalysis) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getDBAnalysis())

      const { data, status } = await apiService.get<DatabaseAnalysis>(
        getUrl(instanceId, ApiEndpoints.DATABASE_ANALYSIS, id),
      )

      if (isStatusSuccessful(status)) {
        dispatch(getDBAnalysisSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getDBAnalysisError(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function putRecommendationVote(
  name: string,
  vote: Vote,
  onSuccessAction?: (recommendation: { name: string; vote: Vote }) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      dispatch(setRecommendationVote())
      const state = stateInit()
      const instanceId = state.connections.instances.connectedInstance?.id

      const { data, status } = await apiService.patch(
        getUrl(
          instanceId,
          ApiEndpoints.DATABASE_ANALYSIS,
          state.analytics.databaseAnalysis.history.selectedAnalysis ?? '',
        ),
        { name, vote },
      )

      if (isStatusSuccessful(status)) {
        dispatch(setRecommendationVoteSuccess(data))

        onSuccessAction?.({ name, vote })
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(setRecommendationVoteError(errorMessage))
      onFailAction?.()
    }
  }
}

export function fetchDBAnalysisReportsHistory(
  instanceId: string,
  onSuccessAction?: (data: ShortDatabaseAnalysis[]) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(loadDBAnalysisReports())

      const { data, status } = await apiService.get<ShortDatabaseAnalysis[]>(
        getUrl(instanceId, ApiEndpoints.DATABASE_ANALYSIS),
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadDBAnalysisReportsSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadDBAnalysisReportsError(errorMessage))
      onFailAction?.()
    }
  }
}

export function createNewAnalysis(
  instanceId: string,
  delimiters: string[],
  onSuccessAction?: (data: DatabaseAnalysis) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getDBAnalysis())

      const { data, status } = await apiService.post<DatabaseAnalysis>(
        getUrl(instanceId, ApiEndpoints.DATABASE_ANALYSIS),
        {
          delimiter: delimiters?.[0],
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(getDBAnalysisSuccess(data))
        dispatch<any>(fetchDBAnalysisReportsHistory(instanceId))
        dispatch(setSelectedAnalysisId(data.id))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getDBAnalysisError(errorMessage))
      onFailAction?.()
    }
  }
}
