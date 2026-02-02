import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { RunQueryMode } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import QueryCard, { Props } from './QueryCard'
import {
  ViewMode,
  ViewModeContextProvider,
} from 'uiSrc/components/query/context/view-mode.context'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderQueryCardComponent = (props?: Partial<Props>) => {
  const defaultProps: Props = {
    id: '1',
    command: 'FT.SEARCH',
    isOpen: true,
    result: [], // Maybe<CommandExecutionResult[]>
    activeMode: RunQueryMode.ASCII,
    onQueryDelete: jest.fn(),
    onQueryReRun: jest.fn(),
    onQueryOpen: jest.fn(),
    onQueryProfile: jest.fn(),
  }

  return render(
    <ViewModeContextProvider viewMode={ViewMode.VectorSearch}>
      <QueryCard {...defaultProps} {...props} />
    </ViewModeContextProvider>,
  )
}

describe('QueryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    const { container } = renderQueryCardComponent()
    expect(container).toBeInTheDocument()

    // TODO: Verify the rendered content
  })

  describe('Telemetry', () => {
    it('should collect telemetry when clicking the "toggle full-screen" button', () => {
      renderQueryCardComponent()

      // Simulate clicking the full-screen button
      const fullScreenButton = screen.getByTestId('toggle-full-screen')
      expect(fullScreenButton).toBeInTheDocument()

      fireEvent.click(fullScreenButton)

      // Verify telemetry event is sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          state: 'Open',
        },
      })

      // Simulate closing full-screen
      fireEvent.click(fullScreenButton)

      // Verify telemetry event is sent for closing full-screen
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          state: 'Close',
        },
      })
    })
  })
})
