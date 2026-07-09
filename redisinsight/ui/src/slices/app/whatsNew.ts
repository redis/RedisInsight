import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { getLatestWhatsNewVersion } from 'uiSrc/utils'
import { StateWhatsNew } from 'uiSrc/slices/interfaces'
import { RootState } from 'uiSrc/slices/store'

export const initialState: StateWhatsNew = {
  isOpen: false,
  selectedVersion: null,
  lastVersionSeen:
    localStorageService?.get(BrowserStorageItem.whatsNewLastVersionSeen) ??
    null,
}

const whatsNewSlice = createSlice({
  name: 'whatsNew',
  initialState,
  reducers: {
    openWhatsNew: (state, { payload }: PayloadAction<string | undefined>) => {
      const latest = getLatestWhatsNewVersion()?.version ?? null
      state.isOpen = true
      state.selectedVersion = payload ?? latest

      // Any open counts as seeing the latest release — prevents re-auto-open.
      if (latest && latest !== state.lastVersionSeen) {
        state.lastVersionSeen = latest
        localStorageService.set(
          BrowserStorageItem.whatsNewLastVersionSeen,
          latest,
        )
      }
    },
    setSelectedVersion: (state, { payload }: PayloadAction<string>) => {
      state.selectedVersion = payload
    },
    closeWhatsNew: (state) => {
      state.isOpen = false
    },
  },
})

export const { openWhatsNew, setSelectedVersion, closeWhatsNew } =
  whatsNewSlice.actions

export const whatsNewSelector = (state: RootState) => state.app.whatsNew
export const whatsNewIsOpenSelector = (state: RootState) =>
  state.app.whatsNew.isOpen
export const whatsNewSelectedVersionSelector = (state: RootState) =>
  state.app.whatsNew.selectedVersion

export default whatsNewSlice.reducer
