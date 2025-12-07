import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useHistory } from 'react-router-dom'
import { Nullable } from 'uiSrc/utils'
import {
  SidePanelsState,
  InsightsPanelTabs,
  SidePanels,
} from 'uiSrc/slices/interfaces/insights'
import { sessionStorageService } from 'uiSrc/services'
import { BrowserStorageItem, EAManifestFirstKey } from 'uiSrc/constants'
import { AppDispatch, RootState } from '../store'

const getInsightsTabSelected = (tab?: string): InsightsPanelTabs => {
  if (
    Object.values(InsightsPanelTabs).includes(
      tab as unknown as InsightsPanelTabs,
    )
  )
    return tab as InsightsPanelTabs
  return InsightsPanelTabs.Explore
}

export const initialState: SidePanelsState = {
  openedPanel: sessionStorageService.get(BrowserStorageItem.sidePanel) ?? null,
  insights: {
    tabSelected: getInsightsTabSelected(
      sessionStorageService.get(BrowserStorageItem.insightsPanel),
    ),
  },
  explore: {
    search: '',
    itemScrollTop: 0,
    data: null,
    url: null,
    manifest: null,
    isPageOpen: false,
  },
}

// A slice for recipes
const insightsPanelSlice = createSlice({
  name: 'insightsPanel',
  initialState,
  reducers: {
    changeSidePanel: (
      state,
      { payload }: { payload: Nullable<SidePanels> },
    ) => {
      state.openedPanel = payload
      sessionStorageService.set(BrowserStorageItem.sidePanel, payload)
    },
    toggleSidePanel: (
      state,
      { payload }: { payload: Nullable<SidePanels> },
    ) => {
      state.openedPanel = payload === state.openedPanel ? null : payload
      sessionStorageService.set(BrowserStorageItem.sidePanel, state.openedPanel)
    },
    changeSelectedTab: (
      state,
      { payload }: PayloadAction<InsightsPanelTabs>,
    ) => {
      state.insights.tabSelected = payload
      sessionStorageService.set(BrowserStorageItem.insightsPanel, payload)
    },
    setExplorePanelSearch: (state, { payload }: { payload: string }) => {
      const prevValue = state.explore.search
      state.explore.search = payload
      if (prevValue !== payload) {
        state.explore.itemScrollTop = 0
      }
    },
    setExplorePanelScrollTop: (state, { payload }: { payload: number }) => {
      state.explore.itemScrollTop = payload || 0
    },
    resetExplorePanelSearch: (state) => {
      state.explore.search = ''
      state.explore.itemScrollTop = 0
    },
    setExplorePanelContent: (state, { payload }) => {
      state.explore.data = payload.data
      state.explore.url = payload.url
    },
    setExplorePanelIsPageOpen: (state, { payload }) => {
      state.explore.isPageOpen = payload
    },
    setExplorePanelManifest: (state, { payload }) => {
      state.explore.manifest = payload
    },
  },
})

// A selector
export const sidePanelsSelector = (state: RootState) => state.panels.sidePanels
export const insightsPanelSelector = (state: RootState) =>
  state.panels.sidePanels.insights
export const explorePanelSelector = (state: RootState) =>
  state.panels.sidePanels.explore

// Actions generated from the slice
export const {
  changeSidePanel,
  toggleSidePanel,
  changeSelectedTab,
  setExplorePanelContent,
  setExplorePanelSearch,
  setExplorePanelScrollTop,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
  setExplorePanelManifest,
} = insightsPanelSlice.actions

export function openTutorialByPath(
  path: Nullable<string>,
  history: ReturnType<typeof useHistory>,
  openList = false,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(changeSidePanel(SidePanels.Insights))

    if (path) {
      history.push({
        search: `path=${EAManifestFirstKey.TUTORIALS}/${path}`,
      })
      return
    }

    if (openList) {
      dispatch(resetExplorePanelSearch())
      history.push({
        search: '',
      })
    }
  }
}

// The reducer
export default insightsPanelSlice.reducer
