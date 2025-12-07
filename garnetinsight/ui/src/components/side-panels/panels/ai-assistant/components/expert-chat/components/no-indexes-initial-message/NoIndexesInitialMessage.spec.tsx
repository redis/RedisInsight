import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import NoIndexesInitialMessage from './NoIndexesInitialMessage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('NoIndexesInitialMessage', () => {
  it('should render', () => {
    expect(render(<NoIndexesInitialMessage />)).toBeTruthy()
  })

  it('should render load sample data button', () => {
    render(<NoIndexesInitialMessage />)

    expect(screen.getByTestId('load-sample-data-btn')).toBeInTheDocument()
  })

  it('should call telemetry on init', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<NoIndexesInitialMessage />)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_BOT_NO_INDEXES_MESSAGE_DISPLAYED,
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
