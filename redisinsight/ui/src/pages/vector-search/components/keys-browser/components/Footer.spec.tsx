import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import Footer from './Footer'
import { createMockKeysBrowserContext } from '../__stories__/contextMock'

let mockContextValue = createMockKeysBrowserContext({
  keysState: {
    keys: [],
    nextCursor: '0',
    total: 100,
    scanned: 0,
    lastRefreshTime: null,
    previousResultCount: 0,
    shardsMeta: {},
  },
})

jest.mock('../hooks/useKeysBrowser', () => ({
  useKeysBrowser: () => mockContextValue,
}))

describe('Footer (vector-search keys-browser)', () => {
  it('should render summary container', () => {
    render(<Footer />)

    expect(screen.getByTestId('vs-keys-summary')).toBeInTheDocument()
  })

  it('should display total when not scanned', () => {
    render(<Footer />)

    expect(screen.getByText(/Total:/)).toBeInTheDocument()
  })

  it('should display results when scanned', () => {
    mockContextValue.isSearched = true
    mockContextValue.keysState = {
      ...mockContextValue.keysState,
      keys: Array.from({ length: 50 }, (_, i) => ({
        name: { data: [i], type: 'Buffer' },
        nameString: `key:${i}`,
        type: 'hash',
        ttl: -1,
        size: 100,
      })) as any,
      scanned: 3000,
      total: 126339,
    }

    render(<Footer />)

    expect(screen.getByTestId('vs-keys-number-of-results')).toHaveTextContent(
      '50',
    )
    expect(screen.getByTestId('vs-keys-number-of-scanned')).toHaveTextContent(
      '3 000',
    )
    expect(screen.getByTestId('vs-keys-total')).toHaveTextContent('126 339')

    mockContextValue.isSearched = false
  })

  it('should display scanning text when loading with no total', () => {
    mockContextValue.headerLoading = true
    mockContextValue.keysState = {
      ...mockContextValue.keysState,
      keys: [],
      total: 0,
      scanned: 0,
    }

    render(<Footer />)

    expect(screen.getByTestId('vs-scanning-text')).toBeInTheDocument()

    mockContextValue.headerLoading = false
  })
})
