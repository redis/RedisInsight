import { createSlice } from '@reduxjs/toolkit'
import {
  ContentCreateRedis as IContentItem,
  StateContentCreateRedis as IState,
} from 'uiSrc/slices/interfaces/content'
import { resourcesService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../store'

export const initialState: IState = {
  data: {},
  loading: false,
  error: '',
}

// A slice for recipes
const createRedisButtonsSlice = createSlice({
  name: 'createRedisButtons',
  initialState,
  reducers: {
    getContent: (state) => {
      state.loading = true
    },
    getContentSuccess: (
      state,
      { payload }: { payload: Record<string, any> },
    ) => {
      state.loading = false
      state.data = payload
    },
    getContentFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const { getContent, getContentFailure, getContentSuccess } =
  createRedisButtonsSlice.actions

// A selector
export const contentSelector = (state: RootState) =>
  state.content.createRedisButtons

// The reducer
export default createRedisButtonsSlice.reducer

// Asynchronous thunk action
export function fetchContentAction() {
  return async (dispatch: AppDispatch) => {
    dispatch(getContent())

    try {
      const { data, status } = await resourcesService.get<
        Record<string, IContentItem>
      >(ApiEndpoints.CONTENT_CREATE_DATABASE)
      if (isStatusSuccessful(status)) {
        dispatch(getContentSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getContentFailure(errorMessage))
    }
  }
}
