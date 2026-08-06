import React from 'react'
import {
  render,
  screen,
  userEvent,
  waitFor,
  waitForRedisUiSelectVisible,
} from 'uiSrc/utils/test-utils'
import { AppUpdateStrategy } from 'uiSrc/electron/constants'
import { TelemetryEvent } from 'uiSrc/telemetry'

import UpdateSettings from './UpdateSettings'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/electron/utils', () => ({
  ...jest.requireActual('uiSrc/electron/utils'),
  ipcGetUpdateStrategy: jest.fn(),
  ipcSetUpdateStrategy: jest.fn(),
}))

const { sendEventTelemetry } = require('uiSrc/telemetry')
const {
  ipcGetUpdateStrategy,
  ipcSetUpdateStrategy,
} = require('uiSrc/electron/utils')

describe('UpdateSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render anything while the strategy is still unresolved (web build or enterprise-pinned)', async () => {
    ipcGetUpdateStrategy.mockResolvedValueOnce(null)

    const { container } = render(<UpdateSettings />)

    await waitFor(() => {
      expect(ipcGetUpdateStrategy).toHaveBeenCalled()
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('should render the resolved strategy selected', async () => {
    ipcGetUpdateStrategy.mockResolvedValueOnce(AppUpdateStrategy.auto)

    render(<UpdateSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('select-update-strategy')).toBeInTheDocument()
    })
  })

  it('should persist the new strategy and send telemetry on change', async () => {
    ipcGetUpdateStrategy.mockResolvedValueOnce(AppUpdateStrategy.auto)

    render(<UpdateSettings />)

    const dropdownButton = await screen.findByTestId('select-update-strategy')
    await userEvent.click(dropdownButton)

    await waitForRedisUiSelectVisible()

    await userEvent.click(screen.getByText('Ask me before downloading'))

    expect(ipcSetUpdateStrategy).toHaveBeenCalledWith(AppUpdateStrategy.notify)
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SETTINGS_UPDATE_STRATEGY_CHANGED,
      eventData: { strategy: AppUpdateStrategy.notify },
    })
  })
})
