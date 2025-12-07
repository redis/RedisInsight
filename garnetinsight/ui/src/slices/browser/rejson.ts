import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { AxiosError, CancelTokenSource } from 'axios'

import { isNumber } from 'lodash'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
  getJsonPathLevel,
} from 'uiSrc/telemetry'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { parseJsonData } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/utils'
import {
  GetRejsonRlResponseDto,
  RemoveRejsonRlResponse,
} from 'apiSrc/modules/browser/rejson-rl/dto'

import { refreshKeyInfoAction } from './keys'
import {
  EditorType,
  InitialStateRejson,
  RedisResponseBuffer,
} from '../interfaces'
import {
  addErrorNotification,
  addMessageNotification,
} from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const JSON_LENGTH_TO_FORCE_RETRIEVE = 200
const TELEMETRY_KEY_LEVEL_ENTIRE_KEY = 'entireKey'

export const initialState: InitialStateRejson = {
  loading: false,
  error: null,
  data: {
    downloaded: false,
    data: undefined,
    type: '',
  },
  editorType: EditorType.Default,
  isWithinThreshold: false,
}

// A slice for recipes
const rejsonSlice = createSlice({
  name: 'rejson',
  initialState,
  reducers: {
    // load reJSON part
    loadRejsonBranch: (
      state,
      { payload: resetData = true }: PayloadAction<Maybe<boolean>>,
    ) => {
      state.loading = true
      state.error = null

      if (resetData) {
        state.data = initialState.data
      }
    },
    loadRejsonBranchSuccess: (state, { payload }) => {
      state.data = payload
      state.loading = false
    },
    loadRejsonBranchFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    appendReJSONArrayItem: (state) => {
      state.loading = true
      state.error = null
    },
    appendReJSONArrayItemSuccess: (state) => {
      state.loading = false
      state.error = null
    },
    appendReJSONArrayItemFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setReJSONData: (state) => {
      state.loading = true
      state.error = null
    },
    setReJSONDataSuccess: (state) => {
      state.loading = false
      state.error = null
    },
    setReJSONDataFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeRejsonKey: (state) => {
      state.loading = true
      state.error = null
    },
    removeRejsonKeySuccess: (state) => {
      state.loading = false
      state.error = null
    },
    removeRejsonKeyFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setEditorType: (state, { payload }: PayloadAction<EditorType>) => {
      state.editorType = payload
    },
    setIsWithinThreshold: (state, { payload }: PayloadAction<boolean>) => {
      state.isWithinThreshold = payload
    },
  },
})

// Actions generated from the slice
export const {
  loadRejsonBranch,
  loadRejsonBranchSuccess,
  loadRejsonBranchFailure,
  appendReJSONArrayItem,
  appendReJSONArrayItemSuccess,
  appendReJSONArrayItemFailure,
  setReJSONData,
  setReJSONDataSuccess,
  setReJSONDataFailure,
  removeRejsonKey,
  removeRejsonKeySuccess,
  removeRejsonKeyFailure,
  setEditorType,
  setIsWithinThreshold,
} = rejsonSlice.actions

// A selector
export const rejsonSelector = (state: RootState) => state.browser.rejson
export const rejsonDataSelector = (state: RootState) =>
  state.browser.rejson?.data

// The reducer
export default rejsonSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let sourceRejson: Nullable<CancelTokenSource> = null

// Asynchronous thunk action
export function fetchReJSON(
  key: RedisResponseBuffer,
  path = '$',
  length?: number,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadRejsonBranch(resetData))

    try {
      sourceRejson?.cancel?.()

      const { CancelToken } = axios
      sourceRejson = CancelToken.source()

      const state = stateInit()
      const { editorType } = state.browser.rejson
      const { encoding } = state.app.info

      // "Force retrieve" means fetching the entire JSON value without any optimization.
      // Normally, the optimized approach retrieves only the necessary portion —
      // typically just the top-level properties currently visible.
      const shouldForceRetrieve =
        editorType === EditorType.Text ||
        !isNumber(length) ||
        length <= JSON_LENGTH_TO_FORCE_RETRIEVE

      const { data, status } = await apiService.post<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_GET,
        ),
        {
          keyName: key,
          path,
          forceRetrieve: shouldForceRetrieve,
          encoding,
        },
        { cancelToken: sourceRejson.token },
      )

      sourceRejson = null
      if (isStatusSuccessful(status)) {
        dispatch(loadRejsonBranchSuccess(data))
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error as AxiosError)
        dispatch(loadRejsonBranchFailure(errorMessage))
        dispatch(addErrorNotification(error))
      }
    }
  }
}

// Asynchronous thunk action
export function setReJSONDataAction(
  key: RedisResponseBuffer,
  path: string,
  data: string,
  isEditMode: boolean,
  length?: number,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(setReJSONData())

    try {
      const state = stateInit()

      const { status } = await apiService.patch<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_SET,
        ),
        {
          keyName: key,
          path,
          data,
        },
      )

      if (isStatusSuccessful(status)) {
        try {
          const { editorType } = state.browser.rejson
          const keyLevel =
            editorType === EditorType.Text
              ? TELEMETRY_KEY_LEVEL_ENTIRE_KEY
              : getJsonPathLevel(path)
          sendEventTelemetry({
            event: getBasedOnViewTypeEvent(
              state.browser.keys?.viewType,
              isEditMode
                ? TelemetryEvent.BROWSER_JSON_PROPERTY_EDITED
                : TelemetryEvent.BROWSER_JSON_PROPERTY_ADDED,
              isEditMode
                ? TelemetryEvent.TREE_VIEW_JSON_PROPERTY_EDITED
                : TelemetryEvent.TREE_VIEW_JSON_PROPERTY_ADDED,
            ),
            eventData: {
              databaseId: state.connections.instances?.connectedInstance?.id,
              keyLevel,
            },
          })
        } catch (error) {
          // console.log(error)
        }

        dispatch(setReJSONDataSuccess())
        dispatch<any>(fetchReJSON(key, '$', length))
        dispatch<any>(refreshKeyInfoAction(key))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(setReJSONDataFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function appendReJSONArrayItemAction(
  key: RedisResponseBuffer,
  path: string,
  data: string,
  length?: number,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(appendReJSONArrayItem())

    try {
      const state = stateInit()
      const { status } = await apiService.patch<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_ARRAPPEND,
        ),
        {
          keyName: key,
          path,
          data: [data],
        },
      )

      if (isStatusSuccessful(status)) {
        const keyLevel = path === '$' ? '0' : getJsonPathLevel(`${path}[0]`)
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_JSON_PROPERTY_ADDED,
            TelemetryEvent.TREE_VIEW_JSON_PROPERTY_ADDED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyLevel,
          },
        })
        dispatch(appendReJSONArrayItemSuccess())
        dispatch<any>(fetchReJSON(key, '$', length))
        dispatch<any>(refreshKeyInfoAction(key))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(appendReJSONArrayItemFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function removeReJSONKeyAction(
  key: RedisResponseBuffer,
  path = '$',
  jsonKeyName = '',
  length?: number,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeRejsonKey())

    try {
      const state = stateInit()
      const { status } = await apiService.delete<RemoveRejsonRlResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON,
        ),
        {
          data: {
            keyName: key,
            path,
          },
        },
      )

      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_JSON_PROPERTY_DELETED,
            TelemetryEvent.TREE_VIEW_JSON_PROPERTY_DELETED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyLevel: getJsonPathLevel(path),
          },
        })
        dispatch(removeRejsonKeySuccess())
        dispatch<any>(fetchReJSON(key, '$', length))
        dispatch<any>(refreshKeyInfoAction(key))
        dispatch(
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(key, jsonKeyName, 'JSON key'),
          ),
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(removeRejsonKeyFailure(errorMessage))
      dispatch(addErrorNotification(error as AxiosError))
    }
  }
}

// Asynchronous thunk action
export function fetchVisualisationResults(path = '$', forceRetrieve = false) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const key = state.browser.keys?.selectedKey?.data?.name
      const { data, status } = await apiService.post<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_GET,
        ),
        {
          keyName: key,
          path,
          forceRetrieve,
          encoding,
        },
      )

      if (isStatusSuccessful(status)) {
        return {
          ...data,
          data: parseJsonData(data?.data),
        }
      }
      throw new Error(data.toString())
    } catch (_err) {
      const error = _err as AxiosError
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(loadRejsonBranchFailure(errorMessage))
        dispatch(addErrorNotification(error))
      }
    }

    return null
  }
}
