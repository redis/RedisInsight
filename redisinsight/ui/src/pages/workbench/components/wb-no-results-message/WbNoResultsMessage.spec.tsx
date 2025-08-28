import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import {
  changeSelectedTab,
  changeSidePanel,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import WbNoResultsMessage from './WbNoResultsMessage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'REDIS_CLOUD',
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WbNoResultsMessage', () => {
  it('should render', () => {
    expect(render(<WbNoResultsMessage />)).toBeTruthy()
  })

  it('should call proper actions after click on insight btn', () => {
    render(<WbNoResultsMessage />)

    fireEvent.click(screen.getByTestId('no-results-explore-btn'))

    expect(store.getActions()).toEqual([
      changeSelectedTab(InsightsPanelTabs.Explore),
      changeSidePanel(SidePanels.Insights),
    ])
  })

  it('should call proper telemetry events after click on insights', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<WbNoResultsMessage />)

    fireEvent.click(screen.getByTestId('no-results-explore-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: 'instanceId',
        provider: 'REDIS_CLOUD',
        source: 'workbench',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
