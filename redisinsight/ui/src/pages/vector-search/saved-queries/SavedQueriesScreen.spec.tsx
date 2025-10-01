/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { SavedQueriesScreen } from './SavedQueriesScreen'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useRedisearchListData } from '../useRedisearchListData'
import { PresetDataType } from '../create-index/types'

// Mock the telemetry sender once for this spec file
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

// Mock the redisearch list data hook
jest.mock('../useRedisearchListData', () => ({
  useRedisearchListData: jest.fn(),
}))

const mockOnQueryInsert = jest.fn()
const mockOnClose = jest.fn()

describe('SavedQueriesScreen', () => {
  const instanceId = 'instanceId'
  const renderComponent = (defaultSavedQueriesIndex?: string) =>
    render(
      <SavedQueriesScreen
        instanceId={instanceId}
        onQueryInsert={mockOnQueryInsert}
        onClose={mockOnClose}
        defaultSavedQueriesIndex={defaultSavedQueriesIndex}
      />,
    )

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRedisearchListData as jest.Mock).mockReturnValue({
      loading: false,
      data: [],
      stringData: [PresetDataType.BIKES, PresetDataType.MOVIES],
    })
  })

  it('should render', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
  })

  it('should render the main content', () => {
    renderComponent()

    expect(screen.getByText('Sample queries')).toBeInTheDocument()
    expect(screen.getByText('Index:')).toBeInTheDocument()

    // Check that preset queries are rendered for bikes index
    expect(
      screen.getByText("Run a vector search for 'Comfortable commuter bike'"),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Run a vector search for 'Commuter bike for people over 60'",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Run a vector search for 'Female specific mountain bike'",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Run a vector search for 'Female specific mountain bike' for bikes type 'Mountain bikes' and with price between $3500 and $3500",
      ),
    ).toBeInTheDocument()
  })

  it('should render insert buttons for each query', () => {
    renderComponent()
    const insertButtons = screen.getAllByText('Insert')
    expect(insertButtons).toHaveLength(4)
  })

  it('should select the first index by default', () => {
    renderComponent()
    expect(screen.queryByText(PresetDataType.BIKES)).toBeInTheDocument()
  })

  it('should select the default index if provided', () => {
    renderComponent(PresetDataType.MOVIES)

    // The Select component isn't a native <select>, so assert by displayed text
    expect(screen.queryByText(PresetDataType.BIKES)).not.toBeInTheDocument()
    expect(screen.queryByText(PresetDataType.MOVIES)).toBeInTheDocument()
  })

  it('should not render queries if the there is no index with preset data', () => {
    ;(useRedisearchListData as jest.Mock).mockReturnValue({
      loading: false,
      data: [],
      stringData: ['idx:unknown_index'],
    })

    renderComponent()

    expect(screen.queryByText('idx:unknown_index')).not.toBeInTheDocument()
    expect(screen.queryByText(PresetDataType.BIKES)).not.toBeInTheDocument()
    expect(screen.queryByText(PresetDataType.MOVIES)).not.toBeInTheDocument()
  })

  it('should render only saved queries related to preset data', () => {
    ;(useRedisearchListData as jest.Mock).mockReturnValue({
      loading: false,
      data: [],
      stringData: ['idx:unknown_index', PresetDataType.BIKES],
    })

    renderComponent()

    expect(screen.queryByText('idx:unknown_index')).not.toBeInTheDocument()
    expect(screen.queryByText(PresetDataType.MOVIES)).not.toBeInTheDocument()
    expect(screen.queryByText(PresetDataType.BIKES)).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    renderComponent()
    const closeButton = screen.getByTestId('close-saved-queries-btn')
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onQueryInsert for the first query', () => {
    renderComponent()
    const firstInsertButton = screen.getAllByText('Insert')[0]
    fireEvent.click(firstInsertButton)
    expect(mockOnQueryInsert).toHaveBeenCalledWith(
      expect.stringContaining(
        'FT.SEARCH idx:bikes_vss \"*=>[KNN 3 @description_embeddings $my_blob AS score ]\" RETURN 4 score brand type description PARAMS 2 my_blob \"\\xecNN<\\xec\\xc78=\\`',
      ),
    )
  })

  it('should call onQueryInsert for the second query', () => {
    renderComponent()
    const secondInsertButton = screen.getAllByText('Insert')[1]
    fireEvent.click(secondInsertButton)
    expect(mockOnQueryInsert).toHaveBeenCalledWith(
      expect.stringContaining(
        'FT.SEARCH idx:bikes_vss \"*=>[KNN 3 @description_embeddings $my_blob AS score ]\" PARAMS 2 my_blob \"A=\\xe1\\xbb\\x8a\\xad\\x9b<&7R',
      ),
    )
  })

  it('should render loader when loading is true', () => {
    ;(useRedisearchListData as jest.Mock).mockReturnValue({
      loading: true,
      data: [],
      stringData: [],
    })
    renderComponent()
    expect(
      screen.getByTestId('manage-indexes-list--loader'),
    ).toBeInTheDocument()
  })

  it('should render "No sample queries" message when there are no indexes', async () => {
    ;(useRedisearchListData as jest.Mock).mockReturnValue({
      loading: false,
      data: [],
      stringData: [],
    })
    renderComponent()

    const noSavedQueriesMessage = await screen.findByTestId('no-data-message')
    const noSavedQueriesMessageTitle =
      await screen.getByText('No sample queries.')

    expect(noSavedQueriesMessage).toBeInTheDocument()
    expect(noSavedQueriesMessageTitle).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should send telemetry event on mount', () => {
      renderComponent()
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
        eventData: { databaseId: 'instanceId' },
      })
    })

    it('should send telemetry event on unmount', () => {
      const { unmount } = renderComponent()
      ;(sendEventTelemetry as jest.Mock).mockClear()
      unmount()
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED,
        eventData: { databaseId: 'instanceId' },
      })
    })
  })
})
