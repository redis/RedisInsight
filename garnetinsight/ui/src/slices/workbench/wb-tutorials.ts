import { createSlice } from '@reduxjs/toolkit'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import {
  IEnablementAreaItem,
  StateWorkbenchEnablementArea,
} from 'uiSrc/slices/interfaces'

import { AppDispatch, RootState } from '../store'

export const defaultItems: IEnablementAreaItem[] = []
export const initialState: StateWorkbenchEnablementArea = {
  loading: false,
  error: '',
  items: [],
}

// A slice for recipes
const workbenchTutorialsSlice = createSlice({
  name: 'workbenchTutorials',
  initialState,
  reducers: {
    getWBTutorials: (state) => {
      state.loading = true
    },
    getWBTutorialsSuccess: (
      state,
      { payload }: { payload: IEnablementAreaItem },
    ) => {
      state.loading = false
      state.items = [payload]
    },
    getWBTutorialsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.items = defaultItems
    },
  },
})

// A selector
export const workbenchTutorialsSelector = (state: RootState) =>
  state.workbench.tutorials

// Actions generated from the slice
export const { getWBTutorials, getWBTutorialsSuccess, getWBTutorialsFailure } =
  workbenchTutorialsSlice.actions

// The reducer
export default workbenchTutorialsSlice.reducer

// Asynchronous thunk action
export function fetchTutorials(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getWBTutorials())

    try {
      const { data, status } = await resourcesService.get(
        ApiEndpoints.TUTORIALS,
      )
      if (isStatusSuccessful(status)) {
        dispatch(getWBTutorialsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getWBTutorialsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
