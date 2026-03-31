import React from 'react'
import { cloneDeep } from 'lodash'
import { mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
  sidePanelsSelector,
} from 'uiSrc/slices/panels/sidePanels'
import { connectedInstanceCDSelector } from 'uiSrc/slices/instances/instances'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import { getTutorialCapability } from 'uiSrc/utils'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import { appContextCapability } from 'uiSrc/slices/app/context'

import ExplorePanelTemplate from './ExplorePanelTemplate'

let store: typeof mockedStore

jest.mock('uiSrc/slices/panels/sidePanels', () => ({
  ...jest.requireActual('uiSrc/slices/panels/sidePanels'),
  sidePanelsSelector: jest.fn().mockReturnValue({
    openedPanel: 'insights',
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceCDSelector: jest.fn().mockReturnValue({
    free: false,
  }),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextCapability: jest.fn().mockReturnValue({
    source: '',
  }),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  getTutorialCapability: jest
    .fn()
    .mockReturnValue({ path: 'path', telemetryName: 'searchAndQuery' }),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  isShowCapabilityTutorialPopover: jest.fn(),
}))

const mockedAppContextCapability = appContextCapability as jest.Mock
const mockedConnectedInstanceCDSelector =
  connectedInstanceCDSelector as jest.Mock
const mockedIsShowCapabilityTutorialPopover =
  isShowCapabilityTutorialPopover as jest.Mock
const mockedSidePanelsSelector = sidePanelsSelector as jest.Mock
const mockedGetTutorialCapability = getTutorialCapability as jest.Mock

beforeEach(() => {
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ExplorePanelTemplate', () => {
  it('should render', () => {
    expect(
      render(
        <ExplorePanelTemplate>
          <div />
        </ExplorePanelTemplate>,
      ),
    ).toBeTruthy()
  })

  it('should render children and insights panel', () => {
    render(
      <ExplorePanelTemplate>
        <div data-testid="children" />
      </ExplorePanelTemplate>,
    )

    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByTestId('side-panels-insights')).toBeInTheDocument()
  })

  describe('capability auto-open', () => {
    beforeEach(() => {
      mockedAppContextCapability.mockReturnValue({
        source: 'workbench RediSearch',
      })
      mockedConnectedInstanceCDSelector.mockReturnValueOnce({ free: true })
      mockedIsShowCapabilityTutorialPopover.mockImplementation(() => true)
    })

    it('should dispatch actions to open insights panel when capability tutorial is not found', () => {
      mockedSidePanelsSelector.mockReturnValue({ openedPanel: null })
      mockedGetTutorialCapability.mockImplementation(() => ({
        tutorialPage: { args: { path: 'path' } },
      }))

      render(
        <ExplorePanelTemplate>
          <div />
        </ExplorePanelTemplate>,
      )

      const expectedActions = [
        resetExplorePanelSearch(),
        setExplorePanelIsPageOpen(false),
        changeSelectedTab(InsightsPanelTabs.Explore),
        changeSidePanel(SidePanels.Insights),
      ]
      expect(store.getActions()).toEqual(expectedActions)
      mockedGetTutorialCapability.mockRestore()
    })

    it('should dispatch resetExplorePanelSearch if capability was not found', () => {
      mockedSidePanelsSelector.mockReturnValue({ openedPanel: null })

      render(
        <ExplorePanelTemplate>
          <div />
        </ExplorePanelTemplate>,
      )

      const expectedActions = [
        resetExplorePanelSearch(),
        setExplorePanelIsPageOpen(false),
        changeSelectedTab(InsightsPanelTabs.Explore),
        changeSidePanel(SidePanels.Insights),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
