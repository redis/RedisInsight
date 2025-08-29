/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { SavedQueriesScreen } from './SavedQueriesScreen'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useRedisearchListData } from '../useRedisearchListData'

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
      stringData: ['idx:bikes_vss', 'idx:restaurants_vss'],
    })
  })

  it('should render', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
  })

  it('should render the main content', () => {
    renderComponent()

    expect(screen.getByText('Saved queries')).toBeInTheDocument()
    expect(screen.getByText('Index:')).toBeInTheDocument()

    // Check that preset queries are rendered for bikes index
    expect(
      screen.getByText('Search for "Nord" bikes ordered by price'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Find road alloy bikes under 20kg'),
    ).toBeInTheDocument()
  })

  it('should render insert buttons for each query', () => {
    renderComponent()
    const insertButtons = screen.getAllByText('Insert')
    expect(insertButtons).toHaveLength(2)
  })

  it('should select the first index by default', () => {
    renderComponent()
    expect(screen.queryByText('idx:bikes_vss')).toBeInTheDocument()
  })

  it('should select the default index if provided', () => {
    renderComponent('idx:restaurants_vss')
    // The Select component isn't a native <select>, so assert by displayed text
    expect(screen.queryByText('idx:bikes_vss')).not.toBeInTheDocument()
    expect(screen.queryByText('idx:restaurants_vss')).toBeInTheDocument()
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
      'FT.SEARCH idx:bikes_vss "@brand:Nord" SORTBY price ASC',
    )
  })

  it('should call onQueryInsert for the second query', () => {
    renderComponent()
    const secondInsertButton = screen.getAllByText('Insert')[1]
    fireEvent.click(secondInsertButton)
    expect(mockOnQueryInsert).toHaveBeenCalledWith(
      'FT.SEARCH idx:bikes_vss "@material:{alloy} @weight:[0 20]"',
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

  it('should render "No saved queries" message when there are no indexes', async () => {
    ;(useRedisearchListData as jest.Mock).mockReturnValue({
      loading: false,
      data: [],
      stringData: [],
    })
    renderComponent()

    const noSavedQueriesMessage = await screen.findByTestId('no-data-message')
    const noSavedQueriesMessageTitle =
      await screen.getByText('No saved queries.')

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
