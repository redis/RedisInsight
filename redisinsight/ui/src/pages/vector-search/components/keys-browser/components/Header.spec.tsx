import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import Header from './Header'
import { createMockKeysBrowserContext } from '../__mocks__/contextMock'

let mockContextValue = createMockKeysBrowserContext()

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
