import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { isVersionHigher } from 'uiSrc/utils'
import whatsNewContent from 'uiSrc/constants/content/whatsNew.json'
import {
  WhatsNewFeed,
  WhatsNewVersion,
} from 'uiSrc/constants/content/whatsNew.types'
import { StateWhatsNew } from 'uiSrc/slices/interfaces'
import { RootState } from 'uiSrc/slices/store'

/**
 * Bundled "What's new" content. Static import — no network fetch. Sorted by
 * version descending so the latest release is always first.
 */
export const whatsNewFeed: WhatsNewFeed = [
  ...(whatsNewContent.versions as unknown as WhatsNewFeed),
].sort((a, b) => (isVersionHigher(a.version, b.version) ? -1 : 1))

export const getLatestWhatsNewVersion = (): WhatsNewVersion | undefined =>
  whatsNewFeed[0]

/**
 * Whether the modal should auto-open for `toVersion` after an update: the
 * version must exist in the feed, have cards, not be a patch release, and be
 * newer than the last version the user has already seen. Pure — the caller
 * supplies `lastVersionSeen` (from redux state or localStorage). Manual opens
 * never use this.
 */
export const isWhatsNewEligible = (
  toVersion: string,
  lastVersionSeen: string | null,
): boolean => {
  const versionEntry = whatsNewFeed.find((v) => v.version === toVersion)
  const hasCards = !!versionEntry?.cards?.length
  const isAutoOpenable = versionEntry?.type !== 'patch'
  const isNewerThanSeen =
    !lastVersionSeen || isVersionHigher(toVersion, lastVersionSeen)

  return !!versionEntry && hasCards && isAutoOpenable && isNewerThanSeen
}

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

      // Opening the modal (auto or manual) means the user has now seen the
      // latest release, so record it to prevent it auto-opening again. Always
      // the latest version, never the browsed one.
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
