import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { RunQueryMode } from 'uiSrc/slices/interfaces'
import QueryCard, { Props } from './QueryCard'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderQueryCardComponent = (props: Partial<Props> = {}) => {
  const defaultProps: Props = {
    id: 'query-card',
    command: 'mock-command',
    isOpen: true,
    result: [],
    activeMode: RunQueryMode.ASCII,
    onQueryReRun: jest.fn(),
    onQueryOpen: jest.fn(),
    onQueryProfile: jest.fn(),
    onQueryDelete: jest.fn(),
  }

  return render(<QueryCard {...defaultProps} {...props} />)
}

describe('QueryCard', () => {
  it('should render correctly', () => {
    const { container } = renderQueryCardComponent()

    expect(container).toBeInTheDocument()

    // TODO: Verify the rendered content
  })

  describe('Telemetry', () => {
    it('should send telemetry event on query copy', () => {
      const mockCommand = 'mock-command'

      renderQueryCardComponent({ command: mockCommand })

      // Find and click the "Copy" button
      const copyButton = screen.getByTestId('copy-command')
      expect(copyButton).toBeInTheDocument()

      fireEvent.click(copyButton)

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_COPIED,
        eventData: { databaseId: INSTANCE_ID_MOCK, command: mockCommand },
      })
    })
  })
})
