import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'

import { updateSelectedKeyRefreshTime } from './keys'
import { AppDispatch, RootState } from '../store'
import { RedisResponseBuffer } from '../interfaces'
import {
  InitialStateVectorSet,
  ModifiedVectorSetResponse,
} from '../interfaces/vectorSet'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from '../app/notifications'

const VECTOR_SET_COUNT_DEFAULT = 10

export const initialState: InitialStateVectorSet = {
  loading: false,
  error: '',
  data: {
    total: 0,
    key: undefined,
    keyName: '',
    nextCursor: undefined,
    elements: [],
  },
}

const vectorSetSlice = createSlice({
  name: 'vectorSet',
  initialState,
  reducers: {
    loadVectorSetElements: (
      state,
      { payload: resetData = true }: PayloadAction<Maybe<boolean>>,
    ) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
    },
    loadVectorSetElementsSuccess: (
      state,
      { payload }: PayloadAction<ModifiedVectorSetResponse>,
    ) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.data.key = payload.keyName as RedisResponseBuffer
      state.loading = false
    },
    loadVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    loadMoreVectorSetElements: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreVectorSetElementsSuccess: (
      state,
      {
        payload: { elements, ...rest },
      }: PayloadAction<ModifiedVectorSetResponse>,
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        elements: state.data?.elements?.concat(elements),
      }
    },
    loadMoreVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

export const {
  loadVectorSetElements,
  loadVectorSetElementsSuccess,
  loadVectorSetElementsFailure,
  loadMoreVectorSetElements,
  loadMoreVectorSetElementsSuccess,
  loadMoreVectorSetElementsFailure,
} = vectorSetSlice.actions

export const vectorSetSelector = (state: RootState) => state.browser.vectorSet
export const vectorSetDataSelector = (state: RootState) =>
  state.browser.vectorSet?.data

export default vectorSetSlice.reducer

export function fetchVectorSetElements(
  key: RedisResponseBuffer,
  count: number = VECTOR_SET_COUNT_DEFAULT,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadVectorSetElements(resetData))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<ModifiedVectorSetResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_GET_ELEMENTS,
        ),
        {
          keyName: key,
          count,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadVectorSetElementsSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadVectorSetElementsFailure(errorMessage))
    }
  }
}

export function fetchMoreVectorSetElements(
  key: RedisResponseBuffer,
  nextCursor: string,
  count: number = VECTOR_SET_COUNT_DEFAULT,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreVectorSetElements())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<ModifiedVectorSetResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_GET_ELEMENTS,
        ),
        {
          keyName: key,
          start: nextCursor,
          count,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadMoreVectorSetElementsSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadMoreVectorSetElementsFailure(errorMessage))
    }
  }
}

export function refreshVectorSetElementsAction(
  key: RedisResponseBuffer,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadVectorSetElements(resetData))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<ModifiedVectorSetResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_GET_ELEMENTS,
        ),
        {
          keyName: key,
          count: VECTOR_SET_COUNT_DEFAULT,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadVectorSetElementsSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadVectorSetElementsFailure(errorMessage))
    }
  }
}
