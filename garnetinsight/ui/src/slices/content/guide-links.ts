import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { StateContentGuideLinks } from 'uiSrc/slices/interfaces/content'
import { resourcesService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../store'

export const initialState: StateContentGuideLinks = {
  data: [],
  loading: false,
  error: '',
}

// A slice for recipes
const guideLinksContentSlice = createSlice({
  name: 'createRedisButtons',
  initialState,
  reducers: {
    getGuideLinks: (state) => {
      state.loading = true
    },
    getGuideLinksSuccess: (state, { payload }) => {
      state.loading = false
      state.data = payload
    },
    getGuideLinksFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const { getGuideLinks, getGuideLinksSuccess, getGuideLinksFailure } =
  guideLinksContentSlice.actions

// A selector
export const guideLinksSelector = (state: RootState) => state.content.guideLinks

// The reducer
export default guideLinksContentSlice.reducer

// Asynchronous thunk action
export function fetchGuideLinksAction() {
  return async (dispatch: AppDispatch) => {
    dispatch(getGuideLinks())

    try {
      const { data, status } = await resourcesService.get(
        ApiEndpoints.CONTENT_GUIDE_LINKS,
      )
      if (isStatusSuccessful(status)) {
        dispatch(getGuideLinksSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(getGuideLinksFailure(errorMessage))
    }
  }
}
