import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'

import Content from './Content'

const mockContextValue = {
  loading: false,
  headerLoading: false,
  keysState: {
    keys: [],
    nextCursor: '0',
    total: 0,
    scanned: 0,
    lastRefreshTime: null,
    previousResultCount: 0,
  },
  keysError: '',
  commonFilterType: null,
  scrollTopPosition: 0,
  activeTab: KeyTypes.Hash,
  isSearched: false,
  isFiltered: false,
  keyListRef: { current: null },
  selectKey: jest.fn(),
  handleRefreshKeys: jest.fn(),
  handleEnableAutoRefresh: jest.fn(),
  handleChangeAutoRefreshRate: jest.fn(),
  handleTabChange: jest.fn(),
  loadMoreItems: jest.fn(),
  handleScanMore: jest.fn(),
}

jest.mock('../hooks/useKeysBrowser', () => ({
  useKeysBrowser: () => mockContextValue,
}))

jest.mock('uiSrc/pages/browser/components/key-tree', () => {
  const MockReact = require('react')
  return {
    __esModule: true,
    default: MockReact.forwardRef((_props: any, _ref: any) =>
      MockReact.createElement(
        'div',
        { 'data-testid': 'mock-key-tree' },
        'KeyTree',
      ),
    ),
  }
})

describe('Content (vector-search keys-browser)', () => {
  it('should render type tabs', () => {
    render(<Content />)

    expect(screen.getByTestId('vs-keys-type-tabs')).toBeInTheDocument()
  })

  it('should render HASH and JSON tab labels', () => {
    render(<Content />)

    expect(screen.getByText('HASH')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })

  it('should render the info icon', () => {
    render(<Content />)

    expect(screen.getByTestId('vs-keys-info-icon')).toBeInTheDocument()
  })

  it('should render KeyTree', () => {
    render(<Content />)

    expect(screen.getByTestId('mock-key-tree')).toBeInTheDocument()
  })

  it('should render error when keysError is set', () => {
    mockContextValue.keysError = 'Connection failed'

    render(<Content />)

    expect(screen.getByTestId('vs-keys-error')).toBeInTheDocument()
    expect(screen.getByText('Connection failed')).toBeInTheDocument()

    mockContextValue.keysError = ''
  })
})
