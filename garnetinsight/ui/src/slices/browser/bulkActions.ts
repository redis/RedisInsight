import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import axios, { AxiosError } from 'axios'
import {
  ApiEndpoints,
  BulkActionsType,
  MAX_BULK_ACTION_ERRORS_LENGTH,
} from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'

import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { AppDispatch, RootState } from '../store'
import { StateBulkActions, IBulkActionOverview } from '../interfaces'

export const initialState: StateBulkActions = {
  isShowBulkActions: false,
  loading: false,
  error: '',
  isConnected: false,
  bulkDelete: {
    isActionTriggered: false,
    loading: false,
    error: '',
    overview: null,
    generateReport: true,
  },
  bulkUpload: {
    loading: false,
    error: '',
    overview: null,
    fileName: '',
  },
  selectedBulkAction: {
    id: '',
    type: null,
  },
}

// A slice for recipes
const bulkActionsSlice = createSlice({
  name: 'bulkActions',
  initialState,
  reducers: {
    setBulkActionsInitialState: () => initialState,
    setBulkDeleteStartAgain: (state) => {
      state.bulkDelete = initialState.bulkDelete
      state.isConnected = false
    },
    setBulkUploadStartAgain: (state) => {
      state.bulkUpload = initialState.bulkUpload
      state.isConnected = false
    },
    toggleBulkActions: (state) => {
      state.isShowBulkActions = !state.isShowBulkActions
    },
    setBulkActionConnected: (state, { payload }: PayloadAction<boolean>) => {
      state.isConnected = payload
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload
    },
    setBulkDeleteLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.bulkDelete.loading = payload
    },
    setBulkActionType: (state, { payload }: PayloadAction<BulkActionsType>) => {
      state.selectedBulkAction.type = payload
    },
    toggleBulkDeleteActionTriggered: (state) => {
      state.bulkDelete.isActionTriggered = !state.bulkDelete.isActionTriggered
    },
    setBulkDeleteGenerateReport: (
      state,
      { payload }: PayloadAction<boolean>,
    ) => {
      state.bulkDelete.generateReport = payload
    },
    setDeleteOverview: (
      state,
      { payload }: PayloadAction<IBulkActionOverview>,
    ) => {
      let errors = state.bulkDelete.overview?.summary?.errors || []

      errors = payload.summary?.errors
        ?.concat(errors)
        .slice(0, MAX_BULK_ACTION_ERRORS_LENGTH)
      state.bulkDelete.overview = {
        ...payload,
        summary: {
          ...payload.summary,
          errors,
        },
      }
    },
    setDeleteOverviewStatus: (state, { payload }) => {
      if (state.bulkDelete.overview) {
        state.bulkDelete.overview.status = payload
      }
    },
    disconnectBulkDeleteAction: (state) => {
      state.bulkDelete.loading = false
      state.bulkDelete.isActionTriggered = false
      state.isConnected = false
    },
    // bulk delete
    bulkDeleteSuccess: (state) => {
      state.bulkDelete.loading = false
    },
    bulkUpload: (state) => {
      state.bulkUpload.loading = true
      state.bulkUpload.error = ''
    },
    bulkUploadSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{ data: IBulkActionOverview; fileName?: string }>,
    ) => {
      state.bulkUpload.loading = false
      state.bulkUpload.overview = payload.data
      state.bulkUpload.fileName = payload.fileName
    },
    bulkUploadFailed: (state, { payload }: PayloadAction<Maybe<string>>) => {
      state.bulkUpload.loading = false

      if (payload) {
        state.bulkUpload.error = payload
      }
    },
    bulkImportDefaultData: (state) => {
      state.loading = true
    },
    bulkImportDefaultDataSuccess: (state) => {
      state.loading = false
    },
    bulkImportDefaultDataFailed: (state) => {
      state.loading = false
    },
  },
})

// Actions generated from the slice
export const {
  setLoading,
  setBulkDeleteLoading,
  setBulkDeleteStartAgain,
  setBulkUploadStartAgain,
  setBulkActionType,
  setBulkActionConnected,
  toggleBulkActions,
  disconnectBulkDeleteAction,
  toggleBulkDeleteActionTriggered,
  setBulkDeleteGenerateReport,
  setDeleteOverview,
  setDeleteOverviewStatus,
  setBulkActionsInitialState,
  bulkDeleteSuccess,
  bulkUpload,
  bulkUploadFailed,
  bulkUploadSuccess,
  bulkImportDefaultData,
  bulkImportDefaultDataSuccess,
  bulkImportDefaultDataFailed,
} = bulkActionsSlice.actions

// Selectors
export const bulkActionsSelector = (state: RootState) =>
  state.browser.bulkActions
export const selectedBulkActionsSelector = (state: RootState) =>
  state.browser.bulkActions?.selectedBulkAction
export const bulkActionsDeleteSelector = (state: RootState) =>
  state.browser.bulkActions.bulkDelete
export const bulkActionsDeleteOverviewSelector = (state: RootState) =>
  state.browser.bulkActions.bulkDelete.overview
export const bulkActionsDeleteSummarySelector = (state: RootState) =>
  state.browser.bulkActions.bulkDelete.overview?.summary

export const bulkActionsUploadSelector = (state: RootState) =>
  state.browser.bulkActions.bulkUpload
export const bulkActionsUploadOverviewSelector = (state: RootState) =>
  state.browser.bulkActions.bulkUpload.overview
export const bulkActionsUploadSummarySelector = (state: RootState) =>
  state.browser.bulkActions.bulkUpload.overview?.summary

// The reducer
export default bulkActionsSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let uploadController: Nullable<AbortController> = null

// Thunk actions
// Asynchronous thunk action
export function bulkUploadDataAction(
  id: string,
  uploadFile: { file: FormData; fileName: string },
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(bulkUpload())

    try {
      uploadController?.abort()
      uploadController = new AbortController()

      const { status, data } = await apiService.post(
        getUrl(id, ApiEndpoints.BULK_ACTIONS_IMPORT),
        uploadFile.file,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          signal: uploadController.signal,
        },
      )

      uploadController = null

      if (isStatusSuccessful(status)) {
        dispatch(bulkUploadSuccess({ data, fileName: uploadFile.fileName }))
        onSuccessAction?.()
      }
    } catch (error) {
      // show error when request wasn't aborted
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error as AxiosError)
        dispatch(addErrorNotification(error as AxiosError))
        dispatch(bulkUploadFailed(errorMessage))
        onFailAction?.()
      } else {
        dispatch(bulkUploadFailed())
      }
    }
  }
}

export function bulkImportDefaultDataAction(
  id: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(bulkImportDefaultData())

    try {
      const { status, data } = await apiService.post(
        getUrl(id, ApiEndpoints.BULK_ACTIONS_IMPORT_DEFAULT_DATA),
      )

      if (isStatusSuccessful(status)) {
        dispatch(bulkImportDefaultDataSuccess())
        dispatch(
          addMessageNotification(
            successMessages.UPLOAD_DATA_BULK(data as IBulkActionOverview),
          ),
        )
        onSuccessAction?.()
      }
    } catch (error) {
      dispatch(addErrorNotification(error as AxiosError))
      dispatch(bulkImportDefaultDataFailed())
      onFailAction?.()
    }
  }
}

export function resetBulkActions() {
  return async (dispatch: AppDispatch) => {
    uploadController?.abort()
    dispatch(setBulkActionsInitialState())
  }
}
