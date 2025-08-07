import React from 'react'
import { faker } from '@faker-js/faker'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { TelemetryEvent } from 'uiSrc/telemetry/events'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { VectorSearchQuery } from './VectorSearchQuery'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderVectorSearchQueryComponent = () => render(<VectorSearchQuery />)

describe('VectorSearchQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    const { container } = renderVectorSearchQueryComponent()

    expect(container).toBeTruthy()
    expect(container).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should collect telemetry on query submit', () => {
      const mockQuery = faker.lorem.sentence()

      renderVectorSearchQueryComponent()

      // Enter a dummy query
      const queryInput = screen.getByTestId('monaco')
      fireEvent.change(queryInput, { target: { value: mockQuery } })

      // Find and click the "Run" button
      const runQueryButton = screen.getByText('Run')
      expect(runQueryButton).toBeInTheDocument()

      fireEvent.click(runQueryButton)

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
        eventData: { databaseId: INSTANCE_ID_MOCK, commands: [mockQuery] },
      })
    })

    // Note: Enable this test once you implement the other tests and find a way to render the component with items
    it.skip('should collect telemetry on clear results', () => {
      // TODO: Find a way to mock the items in the useQuery hook, so we have what to clear
      renderVectorSearchQueryComponent()

      // Find and click the "Clear Results" button
      const clearResultsButton = screen.getByText('Clear Results')
      expect(clearResultsButton).toBeInTheDocument()

      fireEvent.click(clearResultsButton)

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })
  })
})
