import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'

import { QueryEditorContextProvider } from 'uiSrc/components/query'
import {
  TOOLTIP_EXPLAIN,
  TOOLTIP_PROFILE,
  TOOLTIP_DISABLED_NO_QUERY,
  TOOLTIP_DISABLED_LOADING,
} from './QueryEditor.constants'
import { VectorSearchActions } from './VectorSearchActions'

const mockOnSubmit = jest.fn()

const renderComponent = ({
  query = '',
  isLoading = false,
}: { query?: string; isLoading?: boolean } = {}) =>
  render(
    <QueryEditorContextProvider
      value={{
        query,
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

  it('should render actions bar with run, explain, and profile buttons', () => {
    renderComponent()

    expect(screen.getByTestId('vector-search-actions')).toBeInTheDocument()
    expect(screen.getByTestId('btn-submit')).toBeInTheDocument()
    expect(screen.getByTestId('btn-explain')).toBeInTheDocument()
    expect(screen.getByTestId('btn-profile')).toBeInTheDocument()
  })

  it('should call onSubmit when run button is clicked', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('btn-submit'))
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('should disable run button when loading', () => {
    renderComponent({ isLoading: true })

    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })

  describe('Explain button', () => {
    it('should be disabled when query is empty', () => {
      renderComponent({ query: '' })

      expect(screen.getByTestId('btn-explain')).toBeDisabled()
    })

    it('should be disabled for non-explainable commands', () => {
      renderComponent({ query: 'GET mykey' })

      expect(screen.getByTestId('btn-explain')).toBeDisabled()
    })

    it('should be enabled for FT.SEARCH query', () => {
      renderComponent({ query: 'FT.SEARCH idx "*"' })

      expect(screen.getByTestId('btn-explain')).not.toBeDisabled()
    })

    it('should be enabled for FT.AGGREGATE query', () => {
      renderComponent({ query: 'FT.AGGREGATE idx "*"' })

      expect(screen.getByTestId('btn-explain')).not.toBeDisabled()
    })

    it('should be enabled for lowercase ft.search', () => {
      renderComponent({ query: 'ft.search idx "*"' })

      expect(screen.getByTestId('btn-explain')).not.toBeDisabled()
    })

    it('should be disabled when loading even with valid query', () => {
      renderComponent({ query: 'FT.SEARCH idx "*"', isLoading: true })

      expect(screen.getByTestId('btn-explain')).toBeDisabled()
    })

    it('should submit FT.EXPLAIN query when clicked', () => {
      renderComponent({ query: 'FT.SEARCH idx "*" LIMIT 0 10' })

      fireEvent.click(screen.getByTestId('btn-explain'))
      expect(mockOnSubmit).toHaveBeenCalledWith('FT.EXPLAIN idx "*" LIMIT 0 10')
    })

    it('should show disabled reason in tooltip when no valid query', async () => {
      renderComponent({ query: '' })

      await act(async () => {
        fireEvent.focus(screen.getByTestId('btn-explain'))
      })
      await waitForRiTooltipVisible()

      expect(screen.getAllByText(TOOLTIP_EXPLAIN)[0]).toBeInTheDocument()
      expect(
        screen.getAllByText(TOOLTIP_DISABLED_NO_QUERY)[0],
      ).toBeInTheDocument()
    })

    it('should show loading reason in tooltip when query is running', async () => {
      renderComponent({ query: 'FT.SEARCH idx "*"', isLoading: true })

      await act(async () => {
        fireEvent.focus(screen.getByTestId('btn-explain'))
      })
      await waitForRiTooltipVisible()

      expect(screen.getAllByText(TOOLTIP_EXPLAIN)[0]).toBeInTheDocument()
      expect(
        screen.getAllByText(TOOLTIP_DISABLED_LOADING)[0],
      ).toBeInTheDocument()
    })

    it('should show only base tooltip when enabled', async () => {
      renderComponent({ query: 'FT.SEARCH idx "*"' })

      await act(async () => {
        fireEvent.focus(screen.getByTestId('btn-explain'))
      })
      await waitForRiTooltipVisible()

      expect(screen.getAllByText(TOOLTIP_EXPLAIN)[0]).toBeInTheDocument()
      expect(
        screen.queryByText(TOOLTIP_DISABLED_NO_QUERY),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(TOOLTIP_DISABLED_LOADING),
      ).not.toBeInTheDocument()
    })
  })

  describe('Profile button', () => {
    it('should be disabled when query is empty', () => {
      renderComponent({ query: '' })

      expect(screen.getByTestId('btn-profile')).toBeDisabled()
    })

    it('should be disabled for non-explainable commands', () => {
      renderComponent({ query: 'SET foo bar' })

      expect(screen.getByTestId('btn-profile')).toBeDisabled()
    })

    it('should be enabled for FT.SEARCH query', () => {
      renderComponent({ query: 'FT.SEARCH idx "*"' })

      expect(screen.getByTestId('btn-profile')).not.toBeDisabled()
    })

    it('should submit FT.PROFILE SEARCH query when clicked on FT.SEARCH', () => {
      renderComponent({ query: 'FT.SEARCH idx "*" LIMIT 0 10' })

      fireEvent.click(screen.getByTestId('btn-profile'))
      expect(mockOnSubmit).toHaveBeenCalledWith(
        'FT.PROFILE idx SEARCH QUERY "*" LIMIT 0 10',
      )
    })

    it('should submit FT.PROFILE AGGREGATE query when clicked on FT.AGGREGATE', () => {
      renderComponent({ query: 'FT.AGGREGATE idx "*" GROUPBY 1 @field' })

      fireEvent.click(screen.getByTestId('btn-profile'))
      expect(mockOnSubmit).toHaveBeenCalledWith(
        'FT.PROFILE idx AGGREGATE QUERY "*" GROUPBY 1 @field',
      )
    })

    it('should show disabled reason in tooltip when no valid query', async () => {
      renderComponent({ query: '' })

      await act(async () => {
        fireEvent.focus(screen.getByTestId('btn-profile'))
      })
      await waitForRiTooltipVisible()

      expect(screen.getAllByText(TOOLTIP_PROFILE)[0]).toBeInTheDocument()
      expect(
        screen.getAllByText(TOOLTIP_DISABLED_NO_QUERY)[0],
      ).toBeInTheDocument()
    })

    it('should show only base tooltip when enabled', async () => {
      renderComponent({ query: 'FT.SEARCH idx "*"' })

      await act(async () => {
        fireEvent.focus(screen.getByTestId('btn-profile'))
      })
      await waitForRiTooltipVisible()

      expect(screen.getAllByText(TOOLTIP_PROFILE)[0]).toBeInTheDocument()
      expect(
        screen.queryByText(TOOLTIP_DISABLED_NO_QUERY),
      ).not.toBeInTheDocument()
    })
  })
})
