import React from 'react'
import { faker } from '@faker-js/faker'
import {
  fireEvent,
  initialStateDefault,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { TelemetryEvent } from 'uiSrc/telemetry/events'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { VectorSearchQuery, VectorSearchQueryProps } from './VectorSearchQuery'
import * as workbenchResultsSlice from 'uiSrc/slices/workbench/wb-results'

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

// Mock the workbench results slice
jest.mock('uiSrc/slices/workbench/wb-results', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-results'),
  workbenchResultsSelector: jest.fn(),
  fetchWBHistoryAction: jest.fn(() => ({ type: 'FETCH_WB_HISTORY' })),
  sendWbQueryAction: jest.fn(() => ({ type: 'SEND_WB_QUERY' })),
  deleteWBCommandAction: jest.fn(() => ({ type: 'DELETE_WB_COMMAND' })),
  clearWbResultsAction: jest.fn(() => ({ type: 'CLEAR_WB_RESULTS' })),
  fetchWBCommandAction: jest.fn(() => ({ type: 'FETCH_WB_COMMAND' })),
  toggleOpenWBResult: jest.fn(() => ({ type: 'TOGGLE_OPEN_WB_RESULT' })),
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

    // Set default mock return value for workbenchResultsSelector
    const mockedWorkbenchResultsSlice = workbenchResultsSlice as jest.Mocked<
      typeof workbenchResultsSlice
    >
    mockedWorkbenchResultsSlice.workbenchResultsSelector.mockReturnValue({
      ...initialStateDefault.workbench.results,
      items: [],
      clearing: false,
      processing: false,
      loading: false,
      error: '',
      isLoaded: false,
    })
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
    const savedQueriesButton = screen.getAllByText('Sample queries')[0]
    expect(savedQueriesButton).toBeInTheDocument()
    fireEvent.click(savedQueriesButton)

    // Verify the saved queries screen is closed
    expect(savedQueriesScreen).not.toBeInTheDocument()
  })

  it('should render "No query results" message if there are no results', async () => {
    // Mock the workbenchResultsSelector to return empty items with isLoaded: true
    const mockedWorkbenchResultsSlice = workbenchResultsSlice as jest.Mocked<
      typeof workbenchResultsSlice
    >
    mockedWorkbenchResultsSlice.workbenchResultsSelector.mockReturnValue({
      ...initialStateDefault.workbench.results,
      items: [],
      loading: false,
      isLoaded: true, // This is key - results are loaded but empty
    })

    renderVectorSearchQueryComponent()

    // Wait for the component to load
    await screen.findByTestId('no-data-message')

    const noResultsMessage = screen.getByTestId('no-data-message')
    const noResultsMessageTitle = screen.getByText('No search results.')

    expect(noResultsMessage).toBeInTheDocument()
    expect(noResultsMessageTitle).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should collect telemetry when inserting a saved query', () => {
      renderVectorSearchQueryComponent()

      // Open the saved queries screen
      const savedQueriesButton = screen.getByText('Sample queries')
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

    // TODO: We have hardcoded mockSavedIndexes with only one index, so we cannot test index change telemetry at the moment
    it.skip('should collect telemetry when changing the index for the saved queries', () => {
      renderVectorSearchQueryComponent()

      // Open the saved queries screen
      const savedQueriesButton = screen.getByText('Sample queries')
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

    it('should collect telemetry on clear results', async () => {
      // Mock the workbenchResultsSelector to return items so Clear Results button appears
      const mockedWorkbenchResultsSlice = workbenchResultsSlice as jest.Mocked<
        typeof workbenchResultsSlice
      >
      mockedWorkbenchResultsSlice.workbenchResultsSelector.mockReturnValue({
        items: [
          {
            id: '1',
            command: 'FT.SEARCH idx *',
            result: [{ data: 'result' }],
          },
        ],
        clearing: false,
        processing: false,
        loading: false,
        error: '',
        isLoaded: true,
      })

      renderVectorSearchQueryComponent()

      // Wait for items to render and find the "Clear Results" button
      const clearResultsButton = await screen.findByText('Clear Results')
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
