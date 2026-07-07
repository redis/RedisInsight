import React from 'react'
import reactRouterDom from 'react-router-dom'
import { act, cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { TelemetryEvent } from 'uiSrc/telemetry/events'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { redisearchListSelector } from 'uiSrc/slices/browser/redisearch'
import { SearchIndexDetailsSource } from 'uiSrc/pages/vector-search/telemetry.constants'
import { OPEN_INDEX_PANEL_PARAM } from './VectorSearchQueryPage.constants'

const redisearchListSelectorMock = redisearchListSelector as jest.Mock
import { VectorSearchQueryPage } from './VectorSearchQueryPage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockInstanceId = 'instanceId'
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchListSelector: jest.fn().mockReturnValue({
    data: ['test-index'],
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

const setupRouterMocks = (indexName = 'test-index', search = '') => {
  reactRouterDom.useHistory = jest
    .fn()
    .mockReturnValue({ push: mockPush, replace: mockReplace })
  reactRouterDom.useLocation = jest
    .fn()
    .mockReturnValue({ pathname: 'pathname', search })
  reactRouterDom.useParams = jest
    .fn()
    .mockReturnValue({ instanceId: mockInstanceId, indexName })
}

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
    setupRouterMocks()
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

    it('should send telemetry with query source when the index panel is toggled open', async () => {
      await renderComponent()

      fireEvent.click(screen.getByTestId('view-index-btn'))

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_INDEX_DETAILS_VIEWED,
        eventData: {
          databaseId: mockInstanceId,
          source: SearchIndexDetailsSource.Query,
        },
      })
    })
  })

  describe('index panel auto-open from key details', () => {
    beforeEach(() => {
      redisearchListSelectorMock.mockReturnValue({
        data: ['test-index'],
        loading: false,
        error: '',
      })
    })

    it('should keep the index panel closed without the open panel param', async () => {
      await renderComponent()

      const panel = screen.queryByTestId('view-index-panel')
      expect(panel).not.toBeInTheDocument()
      expect(mockReplace).not.toHaveBeenCalled()
      expect(sendEventTelemetry).not.toHaveBeenCalledWith(
        expect.objectContaining({
          event: TelemetryEvent.SEARCH_INDEX_DETAILS_VIEWED,
        }),
      )
    })

    it('should open the index panel when the open panel param is present', async () => {
      setupRouterMocks('test-index', `?${OPEN_INDEX_PANEL_PARAM}=true`)

      await renderComponent()

      const panel = screen.getByTestId('view-index-panel')
      expect(panel).toBeInTheDocument()
    })

    it('should strip the open panel param from the URL', async () => {
      setupRouterMocks('test-index', `?${OPEN_INDEX_PANEL_PARAM}=true`)

      await renderComponent()

      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({ search: '' }),
      )
    })

    it('should send SEARCH_INDEX_DETAILS_VIEWED telemetry with key details source', async () => {
      setupRouterMocks('test-index', `?${OPEN_INDEX_PANEL_PARAM}=true`)

      await renderComponent()

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_INDEX_DETAILS_VIEWED,
        eventData: {
          databaseId: mockInstanceId,
          source: SearchIndexDetailsSource.KeyDetails,
        },
      })
    })
  })

  describe('redirect when index does not exist', () => {
    it('should redirect to vector search list when navigating to a non-existent index', async () => {
      setupRouterMocks('deleted-index')
      redisearchListSelectorMock.mockReturnValue({
        data: ['index-a', 'index-b'],
        loading: false,
        error: '',
      })

      await renderComponent()

      expect(mockPush).toHaveBeenCalledWith(`/${mockInstanceId}/vector-search`)
    })

    it('should not redirect when navigating to an existing index', async () => {
      setupRouterMocks('my-index')
      redisearchListSelectorMock.mockReturnValue({
        data: ['my-index', 'other-index'],
        loading: false,
        error: '',
      })

      await renderComponent()

      expect(mockPush).not.toHaveBeenCalledWith(
        `/${mockInstanceId}/vector-search`,
      )
    })

    it('should not redirect while the index list is still loading', async () => {
      setupRouterMocks('my-index')
      redisearchListSelectorMock.mockReturnValue({
        data: [],
        loading: true,
        error: '',
      })

      await renderComponent()

      expect(mockPush).not.toHaveBeenCalledWith(
        `/${mockInstanceId}/vector-search`,
      )
    })

    it('should redirect when loading finishes with an empty index list', async () => {
      setupRouterMocks('my-index')
      redisearchListSelectorMock.mockReturnValue({
        data: [],
        loading: false,
        error: '',
      })

      await renderComponent()

      expect(mockPush).toHaveBeenCalledWith(`/${mockInstanceId}/vector-search`)
    })

    it('should not redirect when the index list fetch fails', async () => {
      setupRouterMocks('my-index')
      redisearchListSelectorMock.mockReturnValue({
        data: [],
        loading: false,
        error: 'Network Error',
      })

      await renderComponent()

      expect(mockPush).not.toHaveBeenCalledWith(
        `/${mockInstanceId}/vector-search`,
      )
    })

    it('should not redirect when loading has not started yet', async () => {
      setupRouterMocks('my-index')
      redisearchListSelectorMock.mockReturnValue({
        data: [],
        loading: undefined,
        error: '',
      })

      await renderComponent()

      expect(mockPush).not.toHaveBeenCalledWith(
        `/${mockInstanceId}/vector-search`,
      )
    })
  })
})
