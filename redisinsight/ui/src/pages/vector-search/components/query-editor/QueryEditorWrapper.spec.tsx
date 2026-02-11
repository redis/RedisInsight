import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { QueryEditorWrapper } from './QueryEditorWrapper'

// Monaco is globally mocked in jest setup

const defaultProps = {
  query: '',
  setQuery: jest.fn(),
  onSubmit: jest.fn(),
}

const renderComponent = (props = {}) =>
  render(<QueryEditorWrapper {...defaultProps} {...props} />)

describe('QueryEditorWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the editor wrapper', () => {
    renderComponent()

    expect(screen.getByTestId('vector-search-query-editor')).toBeInTheDocument()
  })

  it('should render editor/library toggle', () => {
    renderComponent()

    expect(screen.getByTestId('editor-library-toggle')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editor' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Library' })).toBeInTheDocument()
  })

  it('should render editor view by default', () => {
    renderComponent()

    expect(screen.getByTestId('vector-search-editor')).toBeInTheDocument()
    expect(screen.getByTestId('vector-search-actions')).toBeInTheDocument()
  })

  it('should switch to library view when Library toggle is clicked', () => {
    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Library' }))

    expect(
      screen.getByTestId('vector-search-library-placeholder'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('vector-search-editor')).not.toBeInTheDocument()
  })

  it('should switch back to editor view when Editor toggle is clicked', () => {
    renderComponent()

    // Switch to library
    fireEvent.click(screen.getByRole('button', { name: 'Library' }))
    expect(screen.queryByTestId('vector-search-editor')).not.toBeInTheDocument()

    // Switch back to editor
    fireEvent.click(screen.getByRole('button', { name: 'Editor' }))
    expect(screen.getByTestId('vector-search-editor')).toBeInTheDocument()
  })
})
