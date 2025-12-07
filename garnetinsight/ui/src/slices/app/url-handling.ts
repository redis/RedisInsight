import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'uiSrc/slices/store'
import { StateUrlHandling } from 'uiSrc/slices/interfaces/urlHandling'
import { localStorageService } from 'uiSrc/services'
import { AppStorageItem } from 'uiSrc/constants/storage'

export const initialState: StateUrlHandling = {
  fromUrl: null,
  returnUrl: localStorageService.get(AppStorageItem.returnUrl),
  action: null,
  dbConnection: null,
  properties: {},
}

const appUrlHandlingSlice = createSlice({
  name: 'appUrlHandling',
  initialState,
  reducers: {
    setUrlHandlingInitialState: () => initialState,
    setFromUrl: (state, { payload }) => {
      state.fromUrl = payload
    },
    setReturnUrl: (state, { payload }) => {
      state.returnUrl = payload
    },
    setUrlDbConnection: (state, { payload }) => {
      state.action = payload.action
      state.dbConnection = payload.dbConnection
    },
    setUrlProperties: (state, { payload }) => {
      state.properties = payload
    },
  },
})

export const {
  setUrlHandlingInitialState,
  setFromUrl,
  setReturnUrl,
  setUrlDbConnection,
  setUrlProperties,
} = appUrlHandlingSlice.actions

export const appRedirectionSelector = (state: RootState) =>
  state.app.urlHandling

export const appReturnUrlSelector = (state: RootState) =>
  state.app.urlHandling.returnUrl

export default appUrlHandlingSlice.reducer
