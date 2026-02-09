import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { QueryEditorContextProvider } from 'uiSrc/components/query'
import { VectorSearchActions } from './VectorSearchActions'

const mockOnSubmit = jest.fn()

const renderComponent = (isLoading = false) =>
  render(
    <QueryEditorContextProvider
      value={{
        query: '',
        setQuery: jest.fn(),
        isLoading,
        commands: [],
        indexes: [],
        onSubmit: mockOnSubmit,
      }}
    >
      <VectorSearchActions />
    </QueryEditorContextProvider>,
  )

describe('VectorSearchActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render actions bar with run button', () => {
    renderComponent()

    expect(screen.getByTestId('vector-search-actions')).toBeInTheDocument()
    expect(screen.getByTestId('btn-submit')).toBeInTheDocument()
  })

  it('should call onSubmit when run button is clicked', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('btn-submit'))
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('should disable run button when loading', () => {
    renderComponent(true)

    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })
})
