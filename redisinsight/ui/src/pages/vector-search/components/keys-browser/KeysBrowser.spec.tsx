import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import KeysBrowser from './KeysBrowser'

jest.mock('./contexts/Context', () => {
  const MockReact = require('react')
  const actual = jest.requireActual('./contexts/Context')
  return {
    ...actual,
    Provider: ({ children }: { children: React.ReactNode }) =>
      MockReact.createElement(
        'div',
        { 'data-testid': 'mock-provider' },
        children,
      ),
  }
})

jest.mock('./components/Header', () => {
  const MockReact = require('react')
  return () =>
    MockReact.createElement('div', { 'data-testid': 'mock-header' }, 'Header')
})

jest.mock('./components/Content', () => {
  const MockReact = require('react')
  return () =>
    MockReact.createElement('div', { 'data-testid': 'mock-content' }, 'Content')
})

jest.mock('./components/Footer', () => {
  const MockReact = require('react')
  return () =>
    MockReact.createElement('div', { 'data-testid': 'mock-footer' }, 'Footer')
})

describe('KeysBrowser (vector-search)', () => {
  const onSelectKey = jest.fn()

  it('should render the composed layout', () => {
    render(<KeysBrowser onSelectKey={onSelectKey} />)

    expect(screen.getByTestId('vs-keys-browser')).toBeInTheDocument()
  })

  it('should render header, content, and footer slots', () => {
    render(<KeysBrowser onSelectKey={onSelectKey} />)

    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-content')).toBeInTheDocument()
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument()
  })

  it('should wrap content in the Provider', () => {
    render(<KeysBrowser onSelectKey={onSelectKey} />)

    expect(screen.getByTestId('mock-provider')).toBeInTheDocument()
  })
})
