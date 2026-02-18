import React from 'react'
import { act, cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { TelemetryEvent } from 'uiSrc/telemetry/events'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { VectorSearchQueryPage } from './VectorSearchQueryPage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockInstanceId = 'instanceId'
const mockPush = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({
      instanceId: mockInstanceId,
      indexName: 'test-index',
    }),
    useHistory: () => ({
      push: mockPush,
    }),
  }
})

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchListSelector: jest.fn().mockReturnValue({
    data: [],
    loading: false,
    error: '',
  }),
  fetchRedisearchListAction: jest
    .fn()
    .mockReturnValue({ type: 'FETCH_REDISEARCH_LIST' }),
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [],
  }),
}))

const mockGetCommandsHistory = jest.fn()
const mockAddCommandsToHistory = jest.fn()
const mockDeleteCommandFromHistory = jest.fn()
const mockClearCommandsHistory = jest.fn()
const mockGetCommandHistory = jest.fn()

jest.mock('uiSrc/services/commands-history/commandsHistoryService', () => ({
  CommandsHistoryService: jest.fn().mockImplementation(() => ({
    getCommandsHistory: mockGetCommandsHistory,
    getCommandHistory: mockGetCommandHistory,
    addCommandsToHistory: mockAddCommandsToHistory,
    deleteCommandFromHistory: mockDeleteCommandFromHistory,
    clearCommandsHistory: mockClearCommandsHistory,
  })),
}))

const mockHistoryItems = commandExecutionUIFactory.buildList(2)

const renderComponent = async () => {
  let result: ReturnType<typeof render>

  await act(async () => {
    result = render(<VectorSearchQueryPage />)
  })

  return result!
}

describe('VectorSearchQueryPage', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    mockGetCommandsHistory.mockResolvedValue([])
    mockAddCommandsToHistory.mockResolvedValue([])
    mockDeleteCommandFromHistory.mockResolvedValue(undefined)
    mockClearCommandsHistory.mockResolvedValue(undefined)
    mockGetCommandHistory.mockResolvedValue(null)
  })

  it('should render page with header, editor, and query results', async () => {
    await renderComponent()

    const page = screen.getByTestId('vector-search-query-page')
    const viewIndexBtn = screen.getByTestId('view-index-btn')
    const editor = screen.getByTestId('vector-search-query-editor')
    const results = screen.getByTestId('query-results')

    expect(page).toBeInTheDocument()
    expect(viewIndexBtn).toBeInTheDocument()
    expect(editor).toBeInTheDocument()
    expect(results).toBeInTheDocument()
  })

  it('should render no results placeholder when there are no items', async () => {
    mockGetCommandsHistory.mockResolvedValueOnce([])

    await renderComponent()

    const placeholder = screen.getByTestId('no-search-results')
    expect(placeholder).toBeInTheDocument()
  })

  it('should render query cards and hide placeholder when history items exist', async () => {
    mockGetCommandsHistory.mockResolvedValueOnce(mockHistoryItems)

    await renderComponent()

    // should render query cards when history items exist
    const card1 = screen.getByTestId(
      `query-card-container-${mockHistoryItems[0].id}`,
    )
    const card2 = screen.getByTestId(
      `query-card-container-${mockHistoryItems[1].id}`,
    )

    expect(card1).toBeInTheDocument()
    expect(card2).toBeInTheDocument()

    // should hide no results placeholder when items exist
    const placeholder = screen.queryByTestId('no-search-results')
    expect(placeholder).not.toBeInTheDocument()

    // should render clear results button when items exist
    const clearBtn = screen.getByTestId('clear-history-btn')
    expect(clearBtn).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should send telemetry on clear all results', async () => {
      mockGetCommandsHistory.mockResolvedValueOnce(mockHistoryItems)
      mockClearCommandsHistory.mockResolvedValueOnce(undefined)

      await renderComponent()

      const clearResultsButton = screen.getByTestId('clear-history-btn')

      await act(async () => {
        fireEvent.click(clearResultsButton)
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
        eventData: { databaseId: mockInstanceId },
      })
    })
  })
})
