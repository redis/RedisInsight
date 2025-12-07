import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { remove, some } from 'lodash'
import { apiService, resourcesService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import {
  DeleteDatabaseRecommendationResponse,
  ModifyDatabaseRecommendationDto,
} from 'apiSrc/modules/database-recommendation/dto'

import { AppDispatch, RootState } from '../store'
import {
  StateRecommendations,
  IRecommendations,
  IRecommendation,
  IRecommendationsStatic,
} from '../interfaces/recommendations'

export const initialState: StateRecommendations = {
  data: {
    recommendations: [],
    totalUnread: 0,
  },
  content: {},
  loading: false,
  error: '',
  isHighlighted: false,
}

// A slice for recipes
const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    setInitialRecommendationsState: (state) => ({
      ...initialState,
      content: state.content,
    }),
    resetRecommendationsHighlighting: (state) => {
      state.isHighlighted = false
    },
    getRecommendations: (state) => {
      state.loading = true
      state.error = ''
    },
    getRecommendationsSuccess: (
      state,
      { payload }: { payload: IRecommendations },
    ) => {
      state.loading = false
      state.data = payload
      state.error = ''
    },
    getRecommendationsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setIsHighlighted: (state, { payload }) => {
      state.isHighlighted = payload
    },
    setTotalUnread: (state, { payload }) => {
      state.data.totalUnread = payload
      state.isHighlighted = !!payload
    },
    addUnreadRecommendations: (state, { payload }) => {
      payload.recommendations?.forEach((r: IRecommendation) => {
        const isRecommendationExists = some(
          state.data.recommendations,
          (stateR) => r.id === stateR.id,
        )
        if (!isRecommendationExists) {
          state.data.recommendations?.unshift(r)
        }
      })
      state.data.totalUnread = payload.totalUnread
      state.isHighlighted = !!payload.totalUnread
    },
    readRecommendations: (state, { payload }) => {
      state.data = {
        ...state.data,
        totalUnread: payload,
      }
    },
    updateRecommendation: () => {
      // we don't have any loading here
    },
    updateRecommendationSuccess: (
      state,
      { payload }: PayloadAction<IRecommendation>,
    ) => {
      state.data.recommendations = [
        ...state.data.recommendations.map((recommendation) =>
          payload.id === recommendation.id ? payload : recommendation,
        ),
      ]
    },
    updateRecommendationError: (state, { payload }) => {
      state.error = payload
    },
    deleteRecommendations: (
      state,
      { payload }: PayloadAction<Array<{ id: string; isRead: boolean }>>,
    ) => {
      remove(state.data.recommendations, (r) =>
        some(payload, (pR) => pR.id === r.id),
      )
      const countUnread = payload.filter((r) => !r.isRead).length
      state.data.totalUnread -= countUnread
    },

    getContentRecommendations: (state) => {
      state.loading = true
    },
    getContentRecommendationsSuccess: (
      state,
      { payload }: PayloadAction<IRecommendationsStatic>,
    ) => {
      state.loading = false
      state.content = payload
    },
    getContentRecommendationsFailure: (state) => {
      state.loading = false
    },
  },
})

// Actions generated from the slice
export const {
  setInitialRecommendationsState,
  resetRecommendationsHighlighting,
  getRecommendations,
  getRecommendationsSuccess,
  getRecommendationsFailure,
  setIsHighlighted,
  readRecommendations,
  updateRecommendation,
  updateRecommendationSuccess,
  updateRecommendationError,
  setTotalUnread,
  addUnreadRecommendations,
  deleteRecommendations,
  getContentRecommendations,
  getContentRecommendationsSuccess,
  getContentRecommendationsFailure,
} = recommendationsSlice.actions

// A selector
export const recommendationsSelector = (state: RootState) =>
  state.recommendations

// The reducer
export default recommendationsSlice.reducer

// Asynchronous thunk action
export function fetchRecommendationsAction(
  instanceId: string,
  onSuccessAction?: (recommendations: IRecommendation[]) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getRecommendations())

      const { data, status } = await apiService.get<IRecommendations>(
        getUrl(instanceId, ApiEndpoints.RECOMMENDATIONS),
      )

      if (isStatusSuccessful(status)) {
        if (data.totalUnread) {
          dispatch(setIsHighlighted(true))
        }
        dispatch(getRecommendationsSuccess(data))
        onSuccessAction?.(data.recommendations)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getRecommendationsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

export function readRecommendationsAction(instanceId: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, status } = await apiService.patch(
        getUrl(instanceId, ApiEndpoints.RECOMMENDATIONS_READ),
      )

      if (isStatusSuccessful(status)) {
        dispatch(readRecommendations(data.totalUnread))
        dispatch(setIsHighlighted(false))
      }
    } catch (error) {
      // ignore
    }
  }
}

// Asynchronous thunk action
export function updateLiveRecommendation(
  id: string,
  dto: ModifyDatabaseRecommendationDto,
  onSuccessAction?: (recommendation: IRecommendation) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      dispatch(updateRecommendation())
      const state = stateInit()
      const instanceId = state.connections.instances.connectedInstance?.id

      const { data, status } = await apiService.patch<IRecommendation>(
        getUrl(instanceId, ApiEndpoints.RECOMMENDATIONS, id),
        dto,
      )

      if (isStatusSuccessful(status)) {
        dispatch(updateRecommendationSuccess(data))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateRecommendationError(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function deleteLiveRecommendations(
  recommendations: Array<{ id: string; isRead: boolean }>,
  onSuccessAction?: (instanceId: string) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      dispatch(updateRecommendation())
      const state = stateInit()
      const instanceId = state.connections.instances.connectedInstance?.id

      const { status } =
        await apiService.delete<DeleteDatabaseRecommendationResponse>(
          getUrl(instanceId, ApiEndpoints.RECOMMENDATIONS),
          { data: { ids: recommendations.map(({ id }) => id) } },
        )

      if (isStatusSuccessful(status)) {
        dispatch(deleteRecommendations(recommendations))
        onSuccessAction?.(instanceId)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateRecommendationError(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchContentRecommendations() {
  return async (dispatch: AppDispatch) => {
    dispatch(getContentRecommendations())

    try {
      const { data, status } =
        await resourcesService.get<IRecommendationsStatic>(
          ApiEndpoints.CONTENT_RECOMMENDATIONS,
        )
      if (isStatusSuccessful(status)) {
        dispatch(getContentRecommendationsSuccess(data))
      }
    } catch (_err) {
      dispatch(getContentRecommendationsFailure())
    }
  }
}
