import React from 'react'
import { render, screen, fireEvent, waitFor } from 'uiSrc/utils/test-utils'
import { queryLibraryItemFactory } from 'uiSrc/mocks/factories/query-library/queryLibraryItem.factory'

import { QueryLibraryView } from './QueryLibraryView'
import { QueryLibraryViewProps } from './QueryLibraryView.types'

const mockItems = queryLibraryItemFactory.buildList(2)

const mockUseQueryLibrary = {
  items: mockItems,
  loading: false,
  error: null as string | null,
  search: '',
  openItemId: null,
  onSearchChange: jest.fn(),
  deleteItem: jest.fn(),
  toggleItemOpen: jest.fn(),
  getItemById: jest.fn((id: string) => mockItems.find((i) => i.id === id)),
  refreshList: jest.fn(),
}

jest.mock('./hooks/useQueryLibrary', () => ({
  useQueryLibrary: () => mockUseQueryLibrary,
}))

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement(
        'div',
        { 'data-testid': props['data-testid'] },
        props.value,
      ),
  }
})

describe('QueryLibraryView', () => {
  const defaultProps: QueryLibraryViewProps = {
    onRun: jest.fn(),
    onLoad: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<QueryLibraryViewProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<QueryLibraryView {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseQueryLibrary.items = mockItems
    mockUseQueryLibrary.loading = false
    mockUseQueryLibrary.error = null
    mockUseQueryLibrary.search = ''
    mockUseQueryLibrary.openItemId = null
    mockUseQueryLibrary.getItemById.mockImplementation((id: string) =>
      mockItems.find((i) => i.id === id),
    )
  })

  describe('rendering', () => {
    it('should render the view container', () => {
      renderComponent()

      const container = screen.getByTestId('query-library-view')
      expect(container).toBeInTheDocument()
    })

    it('should render search input', () => {
      renderComponent()

      const searchInput = screen.getByTestId('query-library-search')
      expect(searchInput).toBeInTheDocument()
    })

    it('should render query library items', () => {
      renderComponent()

      const firstItem = screen.getByTestId(
        `query-library-item-${mockItems[0].id}`,
      )
      expect(firstItem).toBeInTheDocument()

      const secondItem = screen.getByTestId(
        `query-library-item-${mockItems[1].id}`,
      )
      expect(secondItem).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loading state when loading with no items', () => {
      mockUseQueryLibrary.loading = true
      mockUseQueryLibrary.items = []
      renderComponent()

      const loading = screen.getByTestId('query-library-loading')
      expect(loading).toBeInTheDocument()
    })

    it('should show items when loading with existing items', () => {
      mockUseQueryLibrary.loading = true
      renderComponent()

      const loading = screen.queryByTestId('query-library-loading')
      expect(loading).not.toBeInTheDocument()

      const item = screen.getByTestId(`query-library-item-${mockItems[0].id}`)
      expect(item).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should show error message', () => {
      mockUseQueryLibrary.error = 'Failed to load query library'
      mockUseQueryLibrary.items = []
      renderComponent()

      const errorEl = screen.getByTestId('query-library-error')
      expect(errorEl).toHaveTextContent('Failed to load query library')
    })
  })

  describe('empty state', () => {
    it('should show empty message when no items and no search', () => {
      mockUseQueryLibrary.items = []
      renderComponent()

      const emptyState = screen.getByTestId('query-library-empty')
      expect(emptyState).toHaveTextContent('No queries in the library yet')
    })

    it('should show search empty message when no items with search', () => {
      mockUseQueryLibrary.items = []
      mockUseQueryLibrary.search = 'nonexistent'
      renderComponent()

      const emptyState = screen.getByTestId('query-library-empty')
      expect(emptyState).toHaveTextContent('No queries match your search')
    })
  })

  describe('actions', () => {
    it('should call onRun with query text when Run is clicked', () => {
      renderComponent()

      const runBtn = screen.getByTestId(
        `query-library-item-${mockItems[0].id}-run-btn`,
      )
      fireEvent.click(runBtn)

      expect(defaultProps.onRun).toHaveBeenCalledWith(mockItems[0].query)
    })

    it('should call onLoad with query text when Load is clicked', () => {
      renderComponent()

      const loadBtn = screen.getByTestId(
        `query-library-item-${mockItems[0].id}-load-btn`,
      )
      fireEvent.click(loadBtn)

      expect(defaultProps.onLoad).toHaveBeenCalledWith(mockItems[0].query)
    })

    it('should show delete confirmation modal when Delete is clicked', () => {
      renderComponent()

      const deleteBtn = screen.getByTestId(
        `query-library-item-${mockItems[0].id}-delete-btn`,
      )
      fireEvent.click(deleteBtn)

      const modalMessage = screen.getByTestId(
        'query-library-delete-modal-message',
      )
      expect(modalMessage).toBeInTheDocument()
    })

    it('should call deleteItem on confirm', async () => {
      mockUseQueryLibrary.deleteItem.mockResolvedValue(undefined)
      renderComponent()

      const deleteBtn = screen.getByTestId(
        `query-library-item-${mockItems[0].id}-delete-btn`,
      )
      fireEvent.click(deleteBtn)

      const confirmBtn = screen.getByTestId(
        'query-library-delete-modal-confirm',
      )
      fireEvent.click(confirmBtn)

      await waitFor(() => {
        expect(mockUseQueryLibrary.deleteItem).toHaveBeenCalledWith(
          mockItems[0].id,
        )
      })
    })

    it('should close delete modal on cancel', () => {
      renderComponent()

      const deleteBtn = screen.getByTestId(
        `query-library-item-${mockItems[0].id}-delete-btn`,
      )
      fireEvent.click(deleteBtn)

      const modalMessage = screen.getByTestId(
        'query-library-delete-modal-message',
      )
      expect(modalMessage).toBeInTheDocument()

      const cancelBtn = screen.getByTestId('query-library-delete-modal-cancel')
      fireEvent.click(cancelBtn)

      const dismissedModal = screen.queryByTestId(
        'query-library-delete-modal-message',
      )
      expect(dismissedModal).not.toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('should call onSearchChange when search input changes', () => {
      renderComponent()

      const searchInput = screen.getByTestId('query-library-search')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(mockUseQueryLibrary.onSearchChange).toHaveBeenCalledWith('test')
    })
  })
})
