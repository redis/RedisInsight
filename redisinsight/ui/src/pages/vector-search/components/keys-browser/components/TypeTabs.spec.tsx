import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'

import TypeTabs from './TypeTabs'
import { createMockKeysBrowserContext } from '../__mocks__/contextMock'

let mockContextValue = createMockKeysBrowserContext()

jest.mock('../hooks/useKeysBrowser', () => ({
  useKeysBrowser: () => mockContextValue,
}))

describe('TypeTabs (vector-search keys-browser)', () => {
  beforeEach(() => {
    mockContextValue = createMockKeysBrowserContext()
  })

  it('should render tabs container', () => {
    render(<TypeTabs />)

    expect(screen.getByTestId('vs-keys-type-tabs')).toBeInTheDocument()
  })

  it('should render HASH and JSON tab labels', () => {
    render(<TypeTabs />)

    expect(screen.getByText('HASH')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })

  it('should render info icon with tooltip', () => {
    render(<TypeTabs />)

    expect(screen.getByTestId('vs-keys-info-icon')).toBeInTheDocument()
  })

  it('should render with HASH as the default active tab', () => {
    render(<TypeTabs />)

    expect(screen.getByTestId('vs-keys-type-tabs')).toBeInTheDocument()
    expect(screen.getByText('HASH')).toBeInTheDocument()
  })

  it('should render with JSON as the active tab', () => {
    mockContextValue = createMockKeysBrowserContext({
      activeTab: KeyTypes.ReJSON,
    })

    render(<TypeTabs />)

    expect(screen.getByTestId('vs-keys-type-tabs')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })
})
