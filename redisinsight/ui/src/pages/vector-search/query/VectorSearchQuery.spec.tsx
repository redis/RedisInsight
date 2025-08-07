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
    it('should collect telemetry when inserting a saved query', () => {
      renderVectorSearchQueryComponent()

      // Open the saved queries screen
      const savedQueriesButton = screen.getByText('Saved queries')
      expect(savedQueriesButton).toBeInTheDocument()

      fireEvent.click(savedQueriesButton)

      // Select a saved query
      const insertQueryButton = screen.getAllByTestId('btn-insert-query')[0]
      expect(insertQueryButton).toBeInTheDocument()

      fireEvent.click(insertQueryButton)

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_INSERT_CLICKED,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })
  })
})
