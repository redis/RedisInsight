import React from 'react'
import { faker } from '@faker-js/faker'
import { fireEvent, render, screen, act } from 'uiSrc/utils/test-utils'
import { TelemetryEvent } from 'uiSrc/telemetry/events'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
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
// Mock the CommandsHistoryService
const mockGetCommandsHistory = jest.fn()
const mockAddCommandsToHistory = jest.fn()
const mockDeleteCommandFromHistory = jest.fn()
const mockClearCommandsHistory = jest.fn()

jest.mock('uiSrc/services/commands-history/commandsHistoryService', () => ({
  CommandsHistoryService: jest.fn().mockImplementation(() => ({
    getCommandsHistory: mockGetCommandsHistory,
    addCommandsToHistory: mockAddCommandsToHistory,
    deleteCommandFromHistory: mockDeleteCommandFromHistory,
    clearCommandsHistory: mockClearCommandsHistory,
  })),
}))

const DEFAULT_PROPS: VectorSearchQueryProps = {
  instanceId: INSTANCE_ID_MOCK,
  defaultSavedQueriesIndex: undefined,
}

const mockHistoryItems: CommandExecutionUI[] = [
  {
    id: 'cmd-1',
    command: 'FT.SEARCH idx *',
    isOpen: false,
    result: [{ response: 'OK', status: 'success' }],
    loading: false,
    createdAt: new Date(),
  } as CommandExecutionUI,
]

const renderVectorSearchQueryComponent = async (
  props: VectorSearchQueryProps = DEFAULT_PROPS,
) => {
  let result: ReturnType<typeof render>

  await act(async () => {
    result = render(<VectorSearchQuery {...props} />)
  })

  return result!
}

describe('VectorSearchQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock functions
    mockGetCommandsHistory.mockResolvedValue([])
    mockAddCommandsToHistory.mockResolvedValue([])
    mockDeleteCommandFromHistory.mockResolvedValue(undefined)
    mockClearCommandsHistory.mockResolvedValue(undefined)
  })

  it('should render correctly', async () => {
    const { container } = await renderVectorSearchQueryComponent()

    expect(container).toBeTruthy()
    expect(container).toBeInTheDocument()
  })

  it('should not render Saved Queries screen by default', async () => {
    await renderVectorSearchQueryComponent()

    const savedQueriesScreen = screen.queryByTestId('saved-queries-screen')
    expect(savedQueriesScreen).not.toBeInTheDocument()
  })

  it('can close the Saved Queries screen', async () => {
    await renderVectorSearchQueryComponent({
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
    mockGetCommandsHistory.mockResolvedValueOnce([])

    await renderVectorSearchQueryComponent()

    const noResultsMessage = screen.getByTestId('no-data-message')
    const noResultsMessageTitle = screen.getByText('No search results.')

    expect(noResultsMessage).toBeInTheDocument()
    expect(noResultsMessageTitle).toBeInTheDocument()
  })

  it('should render QueryResults with items when history is loaded', async () => {
    mockGetCommandsHistory.mockResolvedValueOnce(mockHistoryItems)

    await renderVectorSearchQueryComponent()

    expect(screen.getByTestId('query-results')).toBeInTheDocument()
    expect(screen.getByTestId('query-card-container-cmd-1')).toBeInTheDocument()
    expect(screen.queryByTestId('no-data-message')).not.toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should collect telemetry when inserting a saved query', async () => {
      await renderVectorSearchQueryComponent()

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
    it.skip('should collect telemetry when changing the index for the saved queries', async () => {
      await renderVectorSearchQueryComponent()

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

    it('should collect telemetry on query submit', async () => {
      const mockQuery = faker.lorem.sentence()

      await renderVectorSearchQueryComponent()

      // Enter a dummy query
      const queryInput = screen.getByTestId('monaco')
      fireEvent.change(queryInput, { target: { value: mockQuery } })

      // Find and click the "Run" button
      const runQueryButton = screen.getByText('Run')
      expect(runQueryButton).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(runQueryButton)
      })

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
        eventData: { databaseId: INSTANCE_ID_MOCK, commands: [mockQuery] },
      })
    })

    it('should collect telemetry on clear results', async () => {
      mockGetCommandsHistory.mockResolvedValueOnce(mockHistoryItems)
      mockClearCommandsHistory.mockResolvedValueOnce(undefined)

      await renderVectorSearchQueryComponent()

      const clearResultsButton = screen.getByTestId('clear-history-btn')
      expect(clearResultsButton).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(clearResultsButton)
      })

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })

    it('should collect telemetry on query clear', async () => {
      await renderVectorSearchQueryComponent()

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
