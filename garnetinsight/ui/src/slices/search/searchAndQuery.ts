import { createSlice } from '@reduxjs/toolkit'
import { RunQueryMode, StateSearchAndQuery } from 'uiSrc/slices/interfaces'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { RootState } from 'uiSrc/slices/store'

export const initialState: StateSearchAndQuery = {
  isLoaded: false,
  loading: false,
  processing: false,
  clearing: false,
  error: '',
  items: [],
  activeRunQueryMode:
    localStorageService?.get(BrowserStorageItem.SQRunQueryMode) ??
    RunQueryMode.ASCII,
}

const searchAndQuerySlice = createSlice({
  name: 'searchAndQuery',
  initialState,
  reducers: {
    changeSQActiveRunQueryMode: (state, { payload }) => {
      state.activeRunQueryMode = payload
      localStorageService.set(BrowserStorageItem.SQRunQueryMode, payload)
    },
  },
})

export const searchAndQuerySelector = (state: RootState) => state.search.query

export default searchAndQuerySlice.reducer

export const { changeSQActiveRunQueryMode } = searchAndQuerySlice.actions
