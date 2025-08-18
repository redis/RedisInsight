import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import {
  redisearchListSelector,
  fetchRedisearchListAction,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ManageIndexesList } from './ManageIndexesList'

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

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'test-instance-123',
    connectionType: 'STANDALONE',
    host: 'localhost',
    modules: [{ name: 'search' }],
    db: 0,
  }),
}))

const renderComponent = () => render(<ManageIndexesList />)

describe('ManageIndexesList', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()

    // Reset mocks to default state before each test
    ;(redisearchListSelector as jest.Mock).mockReturnValue({
      data: [],
      loading: false,
      error: '',
    })
    ;(connectedInstanceSelector as jest.Mock).mockReturnValue({
      id: 'test-instance-123',
      connectionType: 'STANDALONE',
      host: 'localhost',
      modules: [{ name: 'search' }],
      db: 0,
    })
  })

  it('should render', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()

    const list = screen.getByTestId('manage-indexes-list')
    expect(list).toBeInTheDocument()
  })

  it('should render Loader spinner while fetching data', async () => {
    ;(redisearchListSelector as jest.Mock).mockReturnValue({
      data: [],
      loading: true,
      error: '',
    })

    renderComponent()

    const loader = await screen.findByTestId('manage-indexes-list--loader')
    expect(loader).toBeInTheDocument()
  })

  it('should render indexes boxes when data is available', () => {
    const mockIndexes = [
      Buffer.from('test-index-1'),
      Buffer.from('test-index-2'),
    ]

    ;(redisearchListSelector as jest.Mock).mockReturnValue({
      data: mockIndexes,
      loading: false,
      error: '',
    })

    renderComponent()

    // Make sure the loader is not present
    const loader = screen.queryByTestId('manage-indexes-list--loader')
    expect(loader).not.toBeInTheDocument()

    // Check if each index is rendered
    const items = screen.getAllByTestId(/^manage-indexes-list--item--/)
    expect(items.length).toBe(mockIndexes.length)

    mockIndexes.forEach((index) => {
      const indexName = index.toString()
      const indexElement = screen.getByTestId(
        `manage-indexes-list--item--${indexName}`,
      )

      expect(indexElement).toBeInTheDocument()
    })
  })

  it('should not render indexes boxes when there is no instanceHost', () => {
    // Mock connectedInstanceSelector to return no host
    // TODO: Potential candidate for a factory function to create mock instances
    ;(connectedInstanceSelector as jest.Mock).mockReturnValue({
      id: 'test-instance-123',
      connectionType: 'STANDALONE',
      host: null, // No host means no instanceId
      modules: [{ name: 'search' }],
      db: 0,
    })

    renderComponent()

    // Verify that fetchRedisearchListAction was not called
    expect(fetchRedisearchListAction).not.toHaveBeenCalled()

    // Should still render the container but no data/loader
    const list = screen.getByTestId('manage-indexes-list')
    expect(list).toBeInTheDocument()

    const loader = screen.queryByTestId('manage-indexes-list--loader')
    expect(loader).not.toBeInTheDocument()

    const items = screen.queryAllByTestId(/^manage-indexes-list--item--/)
    expect(items.length).toBe(0)
  })

  it('should not render indexes boxes when redisearch module is not available', () => {
    // Mock connectedInstanceSelector to return modules without redisearch
    // TODO: Potential candidate for a factory function to create mock instances
    ;(connectedInstanceSelector as jest.Mock).mockReturnValue({
      id: 'test-instance-123',
      connectionType: 'STANDALONE',
      host: 'localhost',
      modules: [{ name: 'timeseries' }, { name: 'graph' }], // No search/redisearch module
      db: 0,
    })

    renderComponent()

    // Verify that fetchRedisearchListAction was not called
    expect(fetchRedisearchListAction).not.toHaveBeenCalled()

    // Should still render the container but no data/loader
    const list = screen.getByTestId('manage-indexes-list')
    expect(list).toBeInTheDocument()

    const loader = screen.queryByTestId('manage-indexes-list--loader')
    expect(loader).not.toBeInTheDocument()

    const items = screen.queryAllByTestId(/^manage-indexes-list--item--/)
    expect(items.length).toBe(0)
  })
})
