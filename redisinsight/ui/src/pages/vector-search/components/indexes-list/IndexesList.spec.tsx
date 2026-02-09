import React from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  userEvent,
  waitForRiTooltipVisible,
  within,
} from 'uiSrc/utils/test-utils'
import { mockIndexListData } from 'uiSrc/mocks/factories/vector-search/indexList.factory'
import IndexesList from './IndexesList'
import { IndexesListProps } from './IndexesList.types'

const defaultProps: IndexesListProps = {
  data: mockIndexListData,
  dataTestId: 'indexes-list',
}

const renderComponent = (props: Partial<IndexesListProps> = {}) =>
  render(<IndexesList {...defaultProps} {...props} />)

describe('IndexesList', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render list with correct columns', () => {
      renderComponent()

      expect(screen.getByTestId('indexes-list')).toBeInTheDocument()
      expect(screen.getByText('Index name')).toBeInTheDocument()
      expect(screen.getByText('Index prefix')).toBeInTheDocument()
      expect(screen.getByText('Index fields')).toBeInTheDocument()
      expect(screen.getByText('Docs')).toBeInTheDocument()
      expect(screen.getByText('Records')).toBeInTheDocument()
      expect(screen.getByText('Terms')).toBeInTheDocument()
      expect(screen.getByText('Fields')).toBeInTheDocument()
    })

    it('should render index names correctly', () => {
      renderComponent()

      expect(screen.getByText(mockIndexListData[0].name)).toBeInTheDocument()
      expect(screen.getByText(mockIndexListData[1].name)).toBeInTheDocument()
      expect(screen.getByText(mockIndexListData[2].name)).toBeInTheDocument()
    })

    it('should render prefixes correctly', () => {
      renderComponent()

      mockIndexListData.forEach((row) => {
        if (row.prefixes.length > 0) {
          const formattedPrefixes = row.prefixes.map((p) => `"${p}"`).join(', ')
          expect(screen.getByText(formattedPrefixes)).toBeInTheDocument()
        }
      })
    })

    it('should render field type badges correctly', () => {
      renderComponent()

      const firstRow = mockIndexListData[0]
      const firstIndexTypes = screen.getByTestId(
        `index-field-types-${firstRow.id}`,
      )
      expect(firstIndexTypes).toBeInTheDocument()

      // Verify badges exist for each field type
      firstRow.fieldTypes.forEach((type) => {
        expect(
          screen.getByTestId(`index-field-types-${firstRow.id}--tag-${type}`),
        ).toBeInTheDocument()
      })
    })

    it('should render docs correctly', () => {
      renderComponent()

      mockIndexListData.forEach((row) => {
        expect(screen.getByTestId(`index-docs-${row.id}`)).toHaveTextContent(
          row.numDocs.toLocaleString(),
        )
      })
    })

    it('should render records correctly', () => {
      renderComponent()

      mockIndexListData.forEach((row) => {
        expect(screen.getByTestId(`index-records-${row.id}`)).toHaveTextContent(
          row.numRecords.toLocaleString(),
        )
      })
    })

    it('should render terms correctly', () => {
      renderComponent()

      mockIndexListData.forEach((row) => {
        expect(screen.getByTestId(`index-terms-${row.id}`)).toHaveTextContent(
          row.numTerms.toLocaleString(),
        )
      })
    })

    it('should render fields count correctly', () => {
      renderComponent()

      mockIndexListData.forEach((row) => {
        expect(screen.getByTestId(`index-fields-${row.id}`)).toHaveTextContent(
          row.numFields.toLocaleString(),
        )
      })
    })

    it('should render actions column with query buttons when onQueryClick is provided', () => {
      renderComponent({ onQueryClick: () => {} })

      mockIndexListData.forEach((row) => {
        expect(
          screen.getByTestId(`index-actions-${row.id}`),
        ).toBeInTheDocument()
        expect(
          screen.getByTestId(`index-query-btn-${row.id}`),
        ).toBeInTheDocument()
      })
    })

    it('should not render Query button when onQueryClick is omitted', () => {
      renderComponent()

      mockIndexListData.forEach((row) => {
        expect(
          screen.getByTestId(`index-actions-${row.id}`),
        ).toBeInTheDocument()
        expect(
          screen.queryByTestId(`index-query-btn-${row.id}`),
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading and empty state', () => {
    it('should show Loading... when loading is true and data is empty', () => {
      renderComponent({ data: [], loading: true })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show No indexes found when loading is false and data is empty', () => {
      renderComponent({ data: [], loading: false })

      expect(screen.getByText('No indexes found')).toBeInTheDocument()
    })

    it('should show index data when loading is true but data is provided', () => {
      renderComponent({ data: mockIndexListData, loading: true })

      expect(screen.getByText(mockIndexListData[0].name)).toBeInTheDocument()
    })
  })

  describe('Column header tooltips', () => {
    it('shows tooltip when info icon is focused', async () => {
      renderComponent()
      const header = screen.getByText('Index prefix')
      const infoIcon = header.parentElement?.querySelector('svg') as Element

      await act(async () => {
        fireEvent.focus(infoIcon)
      })
      await waitForRiTooltipVisible()

      const tooltip = screen.getAllByText(
        /Keys matching this prefix are automatically indexed/,
      )[0]
      expect(tooltip).toBeInTheDocument()
    })
  })

  describe('Actions column callbacks', () => {
    it('calls onQueryClick with index name when Query is clicked', async () => {
      const onQueryClick = jest.fn()
      renderComponent({ data: mockIndexListData, onQueryClick })

      await userEvent.click(
        screen.getByTestId(`index-query-btn-${mockIndexListData[0].id}`),
      )

      expect(onQueryClick).toHaveBeenCalledWith(mockIndexListData[0].name)
    })

    it('calls action callback with index name when menu item is clicked', async () => {
      const onEdit = jest.fn()
      renderComponent({
        data: mockIndexListData,
        actions: [{ name: 'Edit', callback: onEdit }],
      })

      const actionsCell = screen.getByTestId(
        `index-actions-${mockIndexListData[0].id}`,
      )
      const [menuTrigger] = within(actionsCell).getAllByRole('button')
      await userEvent.click(menuTrigger)
      await userEvent.click(
        screen.getByTestId(`index-actions-edit-btn-${mockIndexListData[0].id}`),
      )

      expect(onEdit).toHaveBeenCalledWith(mockIndexListData[0].name)
    })
  })
})
