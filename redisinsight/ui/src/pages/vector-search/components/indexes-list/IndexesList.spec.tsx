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
import {
  indexListRowFactory,
  exampleIndexListRows,
  mockIndexListData,
} from 'uiSrc/mocks/factories/vector-search/indexList.factory'
import IndexesList from './IndexesList'
import { IndexesListProps, IndexListAction } from './IndexesList.types'

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

  describe('Edge cases', () => {
    it('should handle single index', () => {
      renderComponent({ data: [exampleIndexListRows.products] })

      expect(
        screen.getByText(exampleIndexListRows.products.name),
      ).toBeInTheDocument()
      expect(
        screen.queryByText(exampleIndexListRows.users.name),
      ).not.toBeInTheDocument()
    })

    it('should handle large dataset', () => {
      const largeData = indexListRowFactory.buildList(50)
      renderComponent({ data: largeData })

      expect(screen.getByTestId('indexes-list')).toBeInTheDocument()
    })

    it('should handle index with all field types', () => {
      const allTypesRow = exampleIndexListRows.allFieldTypes
      renderComponent({ data: [allTypesRow] })

      allTypesRow.fieldTypes.forEach((type) => {
        expect(
          screen.getByTestId(
            `index-field-types-${allTypesRow.id}--tag-${type}`,
          ),
        ).toBeInTheDocument()
      })
    })

    it('should handle index with zero documents', () => {
      const emptyRow = exampleIndexListRows.empty
      renderComponent({ data: [emptyRow] })

      expect(screen.getByTestId(`index-docs-${emptyRow.id}`)).toHaveTextContent(
        '0',
      )
      expect(
        screen.getByTestId(`index-records-${emptyRow.id}`),
      ).toHaveTextContent('0')
      expect(
        screen.getByTestId(`index-terms-${emptyRow.id}`),
      ).toHaveTextContent('0')
    })

    it('should handle index with no prefixes', () => {
      const noPrefixRow = exampleIndexListRows.noPrefix
      renderComponent({ data: [noPrefixRow] })

      // When no prefixes, the cell shows empty string
      expect(
        screen.getByTestId(`index-prefix-${noPrefixRow.id}`),
      ).toHaveTextContent('')
    })
  })

  describe('Column header tooltips', () => {
    it('should show default Edit and Delete actions when menu is opened', async () => {
      const defaultActions: IndexListAction[] = [
        { name: 'Edit', callback: () => {} },
        { name: 'Delete', callback: () => {} },
      ]
      renderComponent({ actions: defaultActions })

      const firstRow = mockIndexListData[0]
      const actionsCell = screen.getByTestId(`index-actions-${firstRow.id}`)
      const buttons = within(actionsCell).getAllByRole('button')
      const menuTrigger = buttons[buttons.length - 1]
      await userEvent.click(menuTrigger)

      expect(
        screen.getByTestId(`index-actions-edit-btn-${firstRow.id}`),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId(`index-actions-delete-btn-${firstRow.id}`),
      ).toBeInTheDocument()
    })

    it('should show tooltip content when focusing info icon for each column with tooltip', async () => {
      renderComponent()

      const verifyTooltip = async (
        headerText: string,
        tooltipPattern: RegExp,
      ) => {
        const header = screen.getByText(headerText)
        const infoIcon = header.parentElement?.querySelector('svg') as Element

        await act(async () => {
          fireEvent.focus(infoIcon)
        })
        await waitForRiTooltipVisible()

        const tooltipContent = screen.getAllByText(tooltipPattern)[0]
        expect(tooltipContent).toBeInTheDocument()
      }

      await verifyTooltip(
        'Index prefix',
        /Keys matching this prefix are automatically indexed/,
      )
      await verifyTooltip('Docs', /Number of documents currently indexed/)
      await verifyTooltip(
        'Records',
        /Total indexed field-value pairs across all documents/,
      )
      await verifyTooltip(
        'Terms',
        /Unique words extracted from TEXT fields for full-text search/,
      )
      await verifyTooltip(
        'Fields',
        /Total number of fields defined in the index schema/,
      )
    })
  })

  describe('Actions column callbacks', () => {
    it('should call onQueryClick with index name when Query button is clicked', async () => {
      const onQueryClick = jest.fn()
      renderComponent({ data: mockIndexListData, onQueryClick })

      const firstRow = mockIndexListData[0]
      const queryBtn = screen.getByTestId(`index-query-btn-${firstRow.id}`)

      await userEvent.click(queryBtn)

      expect(onQueryClick).toHaveBeenCalledTimes(1)
      expect(onQueryClick).toHaveBeenCalledWith(firstRow.name)
    })

    it('should call action callback with index name when menu action is clicked', async () => {
      const onEdit = jest.fn()
      const onDelete = jest.fn()
      const actions: IndexListAction[] = [
        { name: 'Edit', callback: onEdit },
        { name: 'Delete', callback: onDelete },
      ]
      renderComponent({
        data: mockIndexListData,
        actions,
      })

      const firstRow = mockIndexListData[0]
      const actionsCell = screen.getByTestId(`index-actions-${firstRow.id}`)
      const buttons = within(actionsCell).getAllByRole('button')
      const menuTrigger = buttons[buttons.length - 1]

      await userEvent.click(menuTrigger)

      const editBtn = screen.getByTestId(
        `index-actions-edit-btn-${firstRow.id}`,
      )
      await userEvent.click(editBtn)
      expect(onEdit).toHaveBeenCalledTimes(1)
      expect(onEdit).toHaveBeenCalledWith(firstRow.name)

      await userEvent.click(menuTrigger)
      const deleteBtn = screen.getByTestId(
        `index-actions-delete-btn-${firstRow.id}`,
      )
      await userEvent.click(deleteBtn)
      expect(onDelete).toHaveBeenCalledTimes(1)
      expect(onDelete).toHaveBeenCalledWith(firstRow.name)
    })

    it('should render custom actions in the menu', async () => {
      const actions: IndexListAction[] = [
        { name: 'CustomOne', callback: () => {} },
        { name: 'CustomTwo', callback: () => {} },
      ]
      renderComponent({ data: mockIndexListData, actions })

      const firstRow = mockIndexListData[0]
      const actionsCell = screen.getByTestId(`index-actions-${firstRow.id}`)
      const buttons = within(actionsCell).getAllByRole('button')
      const menuTrigger = buttons[buttons.length - 1]
      await userEvent.click(menuTrigger)

      expect(
        screen.getByTestId(`index-actions-customone-btn-${firstRow.id}`),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId(`index-actions-customtwo-btn-${firstRow.id}`),
      ).toBeInTheDocument()
    })
  })
})
