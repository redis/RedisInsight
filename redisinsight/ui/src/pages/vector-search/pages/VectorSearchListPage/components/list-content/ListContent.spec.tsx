import React from 'react'
import { faker } from '@faker-js/faker'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { ShowIcon, DeleteIcon } from 'uiSrc/components/base/icons'

import { useListContent } from 'uiSrc/pages/vector-search/hooks/useListContent'
import { ListContent } from './ListContent'

type UseListContentReturn = ReturnType<typeof useListContent>

jest.mock('uiSrc/pages/vector-search/hooks/useListContent', () => ({
  useListContent: jest.fn(),
}))

jest.mock('uiSrc/pages/vector-search/hooks/useIndexInfo/useIndexInfo', () => ({
  useIndexInfo: jest.fn().mockReturnValue({
    indexInfo: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

const mockOnQueryClick = jest.fn()
const mockOnCloseViewPanel = jest.fn()
const mockOnConfirmDelete = jest.fn()
const mockOnCloseDelete = jest.fn()
const mockViewIndexCallback = jest.fn()
const mockBrowseDatasetCallback = jest.fn()
const mockDeleteCallback = jest.fn()

const defaultHookReturn: UseListContentReturn = {
  data: [],
  loading: false,
  actions: [
    { name: 'View index', icon: ShowIcon, callback: mockViewIndexCallback },
    {
      name: 'Browse dataset',
      callback: mockBrowseDatasetCallback,
    },
    {
      name: 'Delete',
      icon: DeleteIcon,
      variant: 'destructive',
      callback: mockDeleteCallback,
    },
  ],
  onQueryClick: mockOnQueryClick,
  viewingIndexName: null,
  onCloseViewPanel: mockOnCloseViewPanel,
  pendingDeleteIndex: null,
  onConfirmDelete: mockOnConfirmDelete,
  onCloseDelete: mockOnCloseDelete,
}

const mockIndexRow = {
  id: faker.string.alpha(8),
  name: faker.string.alpha(8),
  prefixes: [],
  fieldTypes: [],
  numDocs: 0,
  numRecords: 0,
  numTerms: 0,
  numFields: 0,
}

const setupHook = (overrides?: Partial<typeof defaultHookReturn>) => {
  ;(useListContent as jest.Mock).mockReturnValue({
    ...defaultHookReturn,
    ...overrides,
  })
}

const renderComponent = () => render(<ListContent />)

describe('ListContent', () => {
  beforeEach(() => {
    cleanup()
    setupHook()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the index list table', () => {
    setupHook({ data: [mockIndexRow] })
    renderComponent()

    expect(screen.getByTestId('vector-search--list--table')).toBeInTheDocument()
  })

  it('should render empty state when no data', () => {
    renderComponent()

    expect(screen.getByText('No indexes found')).toBeInTheDocument()
  })

  it('should not render view index panel when viewingIndexName is null', () => {
    renderComponent()

    expect(screen.queryByTestId('view-index-panel')).not.toBeInTheDocument()
  })

  it('should render view index panel when viewingIndexName is set', () => {
    setupHook({ viewingIndexName: 'my-index' })
    renderComponent()

    expect(screen.getByTestId('view-index-panel')).toBeInTheDocument()
  })

  it('should not render delete confirmation when pendingDeleteIndex is null', () => {
    renderComponent()

    expect(
      screen.queryByText('Are you sure you want to delete this index?'),
    ).not.toBeInTheDocument()
  })

  it('should render delete confirmation when pendingDeleteIndex is set', () => {
    setupHook({ pendingDeleteIndex: 'some-index' })
    renderComponent()

    expect(
      screen.getByText('Are you sure you want to delete this index?'),
    ).toBeInTheDocument()
  })

  it('should call onQueryClick when query button is clicked', async () => {
    setupHook({ data: [mockIndexRow] })
    renderComponent()

    const queryBtn = screen.getByTestId(`index-query-btn-${mockIndexRow.id}`)
    await userEvent.click(queryBtn)

    expect(mockOnQueryClick).toHaveBeenCalledWith(mockIndexRow.name)
  })

  it('should call action callback when menu item is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    setupHook({ data: [mockIndexRow] })
    renderComponent()

    const menuTrigger = screen.getByTestId(
      `index-actions-menu-trigger-${mockIndexRow.id}`,
    )
    await user.click(menuTrigger)

    const browseOption = screen.getByText('Browse dataset')
    await user.click(browseOption)

    expect(mockBrowseDatasetCallback).toHaveBeenCalledWith(mockIndexRow.name)
  })
})
