import React from 'react'
import { faker } from '@faker-js/faker'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { TelemetryEvent } from 'uiSrc/telemetry/events'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { VectorSearchQuery, VectorSearchQueryProps } from './VectorSearchQuery'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchListSelector: jest.fn().mockReturnValue({
    data: [Buffer.from('idx:bikes_vss')],
    loading: false,
    error: '',
  }),
  fetchRedisearchListAction: jest
    .fn()
    .mockReturnValue({ type: 'FETCH_REDISEARCH_LIST' }),
}))

const DEFAULT_PROPS: VectorSearchQueryProps = {
  instanceId: INSTANCE_ID_MOCK,
  defaultSavedQueriesIndex: undefined,
}

const renderVectorSearchQueryComponent = (
  props: VectorSearchQueryProps = DEFAULT_PROPS,
) => render(<VectorSearchQuery {...props} />)

describe('VectorSearchQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    const { container } = renderVectorSearchQueryComponent()

    expect(container).toBeTruthy()
    expect(container).toBeInTheDocument()
  })

  it('should not render Saved Queries screen by default', () => {
    renderVectorSearchQueryComponent()

    const savedQueriesScreen = screen.queryByTestId('saved-queries-screen')
    expect(savedQueriesScreen).not.toBeInTheDocument()
  })

  it('can close the Saved Queries screen', () => {
    renderVectorSearchQueryComponent({
      ...DEFAULT_PROPS,
      defaultSavedQueriesIndex: faker.string.uuid(),
    })

    // Verify the saved queries screen is open by default
    const savedQueriesScreen = screen.getByTestId('saved-queries-screen')
    expect(savedQueriesScreen).toBeInTheDocument()

    // Close the saved queries screen
    const savedQueriesButton = screen.getAllByText('Saved queries')[0]
    expect(savedQueriesButton).toBeInTheDocument()
    fireEvent.click(savedQueriesButton)

    // Verify the saved queries screen is closed
    expect(savedQueriesScreen).not.toBeInTheDocument()
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

    // TODO: We have hardocked mockSavedIndexes with only one index, so we cannot test index change telemetry at the moment
    it.skip('should collect telemetry when changing the index for the saved queries', () => {
      renderVectorSearchQueryComponent()

      // Open the saved queries screen
      const savedQueriesButton = screen.getByText('Saved queries')
      expect(savedQueriesButton).toBeInTheDocument()

      fireEvent.click(savedQueriesButton)

      // Change the index in the select dropdown
      const selectSavedIndex = screen.getByTestId('select-saved-index')
      expect(selectSavedIndex).toBeInTheDocument()

      // TODO: Replace with a valid index value from mockSavedIndexes once we have more than one index
      fireEvent.change(selectSavedIndex, {
        target: { value: faker.string.uuid() },
      })

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledTimes(2)
      expect(sendEventTelemetry).toHaveBeenNthCalledWith(2, {
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_INDEX_CHANGED,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })

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

    it('should collect telemetry on query clear', () => {
      renderVectorSearchQueryComponent()

      // Find and click the "Clear" button
      const clearButton = screen.getByTestId('btn-clear')
      expect(clearButton).toBeInTheDocument()

      fireEvent.click(clearButton)

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_EDITOR_CLICKED,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })
  })
})
