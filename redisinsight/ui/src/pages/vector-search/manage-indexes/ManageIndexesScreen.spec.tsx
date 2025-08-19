import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { ManageIndexesScreen } from './ManageIndexesScreen'

// Mock the telemetry module, so no real requests are made
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

// Mock ManageIndexesList to keep this test focused on the screen wrapper + telemetry
jest.mock('./ManageIndexesList', () => ({
  ManageIndexesList: jest.fn().mockReturnValue(null),
}))

describe('ManageIndexesScreen', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    const { container } = render(<ManageIndexesScreen />)

    expect(container).toBeTruthy()

    expect(screen.getByTestId('manage-indexes-screen')).toBeInTheDocument()
    expect(screen.getByTestId('manage-indexes-screen-body')).toBeInTheDocument()
    expect(screen.getByTestId('title')).toHaveTextContent('Manage indexes')
  })

  describe('telemetry', () => {
    it('should send telemetry event on mount', () => {
      render(<ManageIndexesScreen />)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
        eventData: { databaseId: 'instanceId' },
      })
    })

    it('should send telemetry event on unmount', () => {
      const { unmount } = render(<ManageIndexesScreen />)

      // Unmount component to trigger the onUnmount event
      unmount()

      // Expect that the closed event has been sent at least once
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
        eventData: { databaseId: 'instanceId' },
      })
    })
  })
})
