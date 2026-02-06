import React from 'react'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  indexListRowFactory,
  exampleIndexListRows,
  mockIndexListData,
} from 'uiSrc/mocks/factories/vector-search/indexList.factory'
import IndexesList from './IndexesList'
import { IndexesListProps } from './IndexesList.types'

const defaultProps: IndexesListProps = {
  data: mockIndexListData,
  onQueryClick: jest.fn(),
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

    it('should render actions column with query buttons', () => {
      renderComponent()

      mockIndexListData.forEach((row) => {
        expect(
          screen.getByTestId(`index-actions-${row.id}`),
        ).toBeInTheDocument()
        expect(
          screen.getByTestId(`index-query-btn-${row.id}`),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Interactions', () => {
    it('should call onQueryClick with correct index name when query button clicked', () => {
      const onQueryClick = jest.fn()
      renderComponent({ onQueryClick })

      const firstRow = mockIndexListData[0]
      const queryButton = screen.getByTestId(`index-query-btn-${firstRow.id}`)
      fireEvent.click(queryButton)

      expect(onQueryClick).toHaveBeenCalledTimes(1)
      expect(onQueryClick).toHaveBeenCalledWith(firstRow.name)
    })

    it('should call onQueryClick for different indexes', () => {
      const onQueryClick = jest.fn()
      renderComponent({ onQueryClick })

      const secondRow = mockIndexListData[1]
      const thirdRow = mockIndexListData[2]

      fireEvent.click(screen.getByTestId(`index-query-btn-${secondRow.id}`))
      expect(onQueryClick).toHaveBeenCalledWith(secondRow.name)

      fireEvent.click(screen.getByTestId(`index-query-btn-${thirdRow.id}`))
      expect(onQueryClick).toHaveBeenCalledWith(thirdRow.name)
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
})
