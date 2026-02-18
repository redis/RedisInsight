import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import Header from './Header'

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
  activeTab: 'hash',
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
    KeyTreeSettings: () =>
      MockReact.createElement(
        'div',
        { 'data-testid': 'tree-view-settings-btn' },
        'Settings',
      ),
  }
})

describe('Header (vector-search keys-browser)', () => {
  it('should render "Select key" title', () => {
    render(<Header />)

    expect(screen.getByText('Select key')).toBeInTheDocument()
  })

  it('should render AutoRefresh controls', () => {
    render(<Header />)

    expect(screen.getByTestId('vs-keys-refresh-btn')).toBeInTheDocument()
  })

  it('should render KeyTreeSettings', () => {
    render(<Header />)

    expect(screen.getByTestId('tree-view-settings-btn')).toBeInTheDocument()
  })
})
