import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { isUndefined, remove } from 'lodash'
import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import {
  EnablementAreaComponent,
  IBulkActionOverview,
  IEnablementAreaItem,
  StateWorkbenchCustomTutorials,
} from 'uiSrc/slices/interfaces'

import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { getFileNameFromPath } from 'uiSrc/utils/pathUtil'
import { AppDispatch, RootState } from '../store'

export const defaultItems: IEnablementAreaItem[] = [
  {
    id: 'custom-tutorials',
    label: 'MY TUTORIALS',
    type: EnablementAreaComponent.Group,
    children: [],
  },
]

export const initialState: StateWorkbenchCustomTutorials = {
  loading: false,
  deleting: false,
  error: '',
  items: defaultItems,
  bulkUpload: {
    pathsInProgress: [],
  },
}

// A slice for recipes
const workbenchCustomTutorialsSlice = createSlice({
  name: 'workbenchCustomTutorials',
  initialState,
  reducers: {
    getWBCustomTutorials: (state) => {
      state.loading = true
    },
    getWBCustomTutorialsSuccess: (
      state,
      { payload }: { payload: IEnablementAreaItem },
    ) => {
      state.loading = false
      state.items = [payload]
    },
    getWBCustomTutorialsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.items = defaultItems
    },
    uploadWbCustomTutorial: (state) => {
      state.loading = true
    },
    uploadWBCustomTutorialSuccess: (state, { payload }) => {
      state.loading = false
      if (state.items[0]?.children) {
        state.items[0].children.unshift(payload)
      }
    },
    uploadWBCustomTutorialFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    deleteWbCustomTutorial: (state) => {
      state.deleting = true
    },
    deleteWBCustomTutorialSuccess: (state, { payload }) => {
      state.deleting = false
      if (state.items[0].children) {
        remove(state.items[0].children, (item) => item.id === payload)
      }
    },
    deleteWBCustomTutorialFailure: (state, { payload }) => {
      state.deleting = false
      state.error = payload
    },
    uploadDataBulk: (state, { payload }) => {
      state.bulkUpload.pathsInProgress.push(payload)
    },
    uploadDataBulkSuccess: (state, { payload }) => {
      remove(state.bulkUpload.pathsInProgress, (p) => p === payload)
    },
    uploadDataBulkFailed: (state, { payload }) => {
      remove(state.bulkUpload.pathsInProgress, (p) => p === payload)
    },
    setWbCustomTutorialsState: (
      state,
      { payload }: PayloadAction<Maybe<boolean>>,
    ) => {
      if (state.items[0].args) {
        const { defaultInitialIsOpen, initialIsOpen } = state.items[0].args
        if (isUndefined(payload)) {
          state.items[0].args.initialIsOpen =
            defaultInitialIsOpen ?? initialIsOpen
          return
        }

        state.items[0].args.defaultInitialIsOpen = initialIsOpen
        state.items[0].args.initialIsOpen = payload
      }
    },
  },
})

// A selector
export const workbenchCustomTutorialsSelector = (state: RootState) =>
  state.workbench.customTutorials
export const customTutorialsBulkUploadSelector = (state: RootState) =>
  state.workbench.customTutorials.bulkUpload

// Actions generated from the slice
export const {
  getWBCustomTutorials,
  getWBCustomTutorialsSuccess,
  getWBCustomTutorialsFailure,
  uploadWbCustomTutorial,
  uploadWBCustomTutorialSuccess,
  uploadWBCustomTutorialFailure,
  deleteWbCustomTutorial,
  deleteWBCustomTutorialSuccess,
  deleteWBCustomTutorialFailure,
  uploadDataBulk,
  uploadDataBulkSuccess,
  uploadDataBulkFailed,
  setWbCustomTutorialsState,
} = workbenchCustomTutorialsSlice.actions

// The reducer
export default workbenchCustomTutorialsSlice.reducer

// Asynchronous thunk action
export function fetchCustomTutorials(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getWBCustomTutorials())

    try {
      const { data, status } = await apiService.get(
        ApiEndpoints.CUSTOM_TUTORIALS_MANIFEST,
      )
      if (isStatusSuccessful(status)) {
        dispatch(getWBCustomTutorialsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(getWBCustomTutorialsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

export function uploadCustomTutorial(
  formData: FormData,
  onSuccessAction?: () => void,
  onFailAction?: (error?: string) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(uploadWbCustomTutorial())
    try {
      const { status, data } = await apiService.post(
        ApiEndpoints.CUSTOM_TUTORIALS,
        formData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      if (isStatusSuccessful(status)) {
        dispatch(uploadWBCustomTutorialSuccess(data))
        onSuccessAction?.()
      }
    } catch (_error) {
      const error = _error as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(uploadWBCustomTutorialFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFailAction?.(error?.response?.data?.error)
    }
  }
}

export function deleteCustomTutorial(
  id: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(deleteWbCustomTutorial())
    try {
      const { status } = await apiService.delete(
        `${ApiEndpoints.CUSTOM_TUTORIALS}/${id}`,
      )
      if (isStatusSuccessful(status)) {
        dispatch(deleteWBCustomTutorialSuccess(id))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(deleteWBCustomTutorialFailure(errorMessage))
      dispatch(addErrorNotification(error as AxiosError))
      onFailAction?.()
    }
  }
}

export function uploadDataBulkAction(
  instanceId: string,
  path: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(uploadDataBulk(path))
    try {
      const { status, data } = await apiService.post(
        getUrl(instanceId, ApiEndpoints.BULK_ACTIONS_IMPORT_TUTORIAL_DATA),
        { path },
      )

      if (isStatusSuccessful(status)) {
        dispatch(uploadDataBulkSuccess(path))
        dispatch(
          addMessageNotification(
            successMessages.UPLOAD_DATA_BULK(
              data as IBulkActionOverview,
              getFileNameFromPath(path),
            ),
          ),
        )
        onSuccessAction?.()
      }
    } catch (error) {
      dispatch(uploadDataBulkFailed(path))
      dispatch(addErrorNotification(error as AxiosError))
      onFailAction?.()
    }
  }
}
