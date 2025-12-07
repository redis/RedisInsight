import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'

import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ExpertChatHeader from './ExpertChatHeader'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ExpertChatHeader', () => {
  it('should render', () => {
    expect(render(<ExpertChatHeader databaseId="1" />)).toBeTruthy()
  })

  it('should render disabled restart session button', () => {
    render(<ExpertChatHeader databaseId="1" isClearDisabled />)

    expect(screen.getByTestId('ai-expert-restart-session-btn')).toBeDisabled()
  })

  it('should call proper actions after click on tutorial button', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    render(<ExpertChatHeader databaseId="1" />)

    fireEvent.click(screen.getByTestId('ai-expert-tutorial-btn'))

    await waitForRiPopoverVisible()

    fireEvent.click(screen.getByTestId('ai-expert-open-tutorials'))

    expect(store.getActions()).toEqual([
      resetExplorePanelSearch(),
      setExplorePanelIsPageOpen(false),
      changeSelectedTab(InsightsPanelTabs.Explore),
      changeSidePanel(SidePanels.Insights),
    ])

    expect(pushMock).toHaveBeenCalledWith({ search: '' })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        databaseId: '1',
        source: 'chatbot_tutorials_button',
      },
    })
  })
})
