import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  bufferToString,
  getApiErrorMessage,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'
import successMessages from 'uiSrc/components/notifications/success-messages'

import {
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import { RedisResponseBuffer } from '../interfaces'
import {
  InitialStateVectorSet,
  ModifiedVectorSetResponse,
} from '../interfaces/vectorSet'
import {
  addErrorNotification,
  addMessageNotification,
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
        payload: { elements, nextCursor, ...rest },
      }: PayloadAction<ModifiedVectorSetResponse>,
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        nextCursor,
        elements: (state.data?.elements ?? []).concat(elements),
      }
    },
    loadMoreVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    removeVectorSetElements: (state) => {
      state.loading = true
      state.error = ''
    },
    removeVectorSetElementsSuccess: (state) => {
      state.loading = false
    },
    removeVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeElementsFromList: (
      state,
      { payload: elements }: PayloadAction<RedisResponseBuffer[]>,
    ) => {
      state.data.elements = state.data.elements.filter(
        (el) => !elements.some((element) => isEqualBuffers(el.name, element)),
      )
      state.data.total -= elements.length
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
  removeVectorSetElements,
  removeVectorSetElementsSuccess,
  removeVectorSetElementsFailure,
  removeElementsFromList,
} = vectorSetSlice.actions

export const vectorSetSelector = (state: RootState) => state.browser.vectorSet
export const vectorSetDataSelector = (state: RootState) =>
  state.browser.vectorSet?.data

export default vectorSetSlice.reducer

interface FetchVectorSetElementsParams {
  key: RedisResponseBuffer
  count?: number
  resetData?: boolean
}

interface FetchMoreVectorSetElementsParams {
  key: RedisResponseBuffer
  nextCursor: string
  count?: number
}

export function fetchVectorSetElements({
  key,
  count = VECTOR_SET_COUNT_DEFAULT,
  resetData,
}: FetchVectorSetElementsParams) {
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

export function fetchMoreVectorSetElements({
  key,
  nextCursor,
  count = VECTOR_SET_COUNT_DEFAULT,
}: FetchMoreVectorSetElementsParams) {
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

export function deleteVectorSetElements(
  key: RedisResponseBuffer,
  elements: RedisResponseBuffer[],
  onSuccessAction?: (newTotal: number) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeVectorSetElements())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_ELEMENTS,
        ),
        {
          data: {
            keyName: key,
            elements,
          },
          params: { encoding },
        },
      )

      if (isStatusSuccessful(status)) {
        const newTotalValue = state.browser.vectorSet.data.total - data.affected

        onSuccessAction?.(newTotalValue)
        dispatch(removeVectorSetElementsSuccess())
        dispatch(removeElementsFromList(elements))
        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
          dispatch(
            addMessageNotification(
              successMessages.REMOVED_KEY_VALUE(
                key,
                elements.map((element) => bufferToString(element)).join(''),
                'Element',
              ),
            ),
          )
        } else {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(removeVectorSetElementsFailure(errorMessage))
    }
  }
}
