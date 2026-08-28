import React from 'react'
import {
  render,
  screen,
  userEvent,
  waitFor,
  waitForRedisUiSelectVisible,
} from 'uiSrc/utils/test-utils'
import { AppUpdateStatus, AppUpdateStrategy } from 'uiSrc/electron/constants'
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
  ipcCheckForUpdate: jest.fn(),
}))

const { sendEventTelemetry } = require('uiSrc/telemetry')
const {
  ipcGetUpdateStrategy,
  ipcSetUpdateStrategy,
  ipcCheckForUpdate,
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

  it('should not render the check-for-updates button when strategy is auto', async () => {
    ipcGetUpdateStrategy.mockResolvedValueOnce(AppUpdateStrategy.auto)

    render(<UpdateSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('select-update-strategy')).toBeInTheDocument()
    })
    expect(
      screen.queryByTestId('btn-check-for-updates'),
    ).not.toBeInTheDocument()
  })

  it('should render the check-for-updates button when strategy is notify', async () => {
    ipcGetUpdateStrategy.mockResolvedValueOnce(AppUpdateStrategy.notify)

    render(<UpdateSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('btn-check-for-updates')).toBeInTheDocument()
    })
  })

  it('should trigger a manual check and disable the button while it is in flight', async () => {
    ipcGetUpdateStrategy.mockResolvedValueOnce(AppUpdateStrategy.notify)
    let resolveCheck: (value: { status: AppUpdateStatus }) => void
    ipcCheckForUpdate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCheck = resolve
      }),
    )

    render(<UpdateSettings />)

    const button = await screen.findByTestId('btn-check-for-updates')
    await userEvent.click(button)

    expect(ipcCheckForUpdate).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    resolveCheck!({ status: AppUpdateStatus.NotAvailable })

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })
})
