import React from 'react'
import { act } from '@testing-library/react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import { indexFieldFactory } from 'uiSrc/mocks/factories/redisearch/IndexField.factory'
import { IndexDetails } from './IndexDetails'
import { IndexDetailsMode, IndexDetailsProps } from './IndexDetails.types'

const mockFields = indexFieldFactory.buildList(3)

const defaultProps: IndexDetailsProps = {
  fields: mockFields,
  mode: IndexDetailsMode.Editable,
  rowSelection: {},
  onRowSelectionChange: jest.fn(),
  onFieldEdit: jest.fn(),
}

const renderComponent = (props: Partial<IndexDetailsProps> = {}) =>
  render(<IndexDetails {...defaultProps} {...props} />)

describe('IndexDetails', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  describe('Readonly mode', () => {
    it('should render table with columns and field values', () => {
      renderComponent({ mode: IndexDetailsMode.Readonly })

      const table = screen.getByTestId('index-details-table')
      expect(table).toBeInTheDocument()

      // Verify the headers are present
      const nameHeader = screen.getByText('Field name')
      const valueHeader = screen.getByText('Field sample value')
      const typeHeader = screen.getByText('Indexing type')

      expect(nameHeader).toBeInTheDocument()
      expect(valueHeader).toBeInTheDocument()
      expect(typeHeader).toBeInTheDocument()

      // Verify the field values are present and edit buttons are not
      mockFields.forEach((field) => {
        const nameCell = screen.getByTestId(
          `index-details-field-name-${field.id}`,
        )
        const valueCell = screen.getByTestId(
          `index-details-field-value-${field.id}`,
        )
        const typeCell = screen.getByTestId(
          `index-details-field-type-${field.id}`,
        )
        const editBtn = screen.queryByTestId(
          `index-details-field-edit-btn-${field.id}`,
        )

        expect(nameCell).toBeInTheDocument()
        expect(valueCell).toBeInTheDocument()
        expect(typeCell).toBeInTheDocument()
        expect(editBtn).not.toBeInTheDocument()
      })
    })

    it('should show column header tooltips on hover', async () => {
      renderComponent({ mode: IndexDetailsMode.Readonly })

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

      // Field name tooltip
      await verifyTooltip(
        'Field name',
        /Represents a searchable attribute in your data/,
      )

      // Field sample value tooltip
      await verifyTooltip(
        'Field sample value',
        /A sample value from the data to be indexed/,
      )

      // Indexing type tooltip
      await verifyTooltip(
        'Indexing type',
        /Defines how Redis searches this field/,
      )
    })
  })

  describe('Editable mode', () => {
    it('should render selection and actions columns', () => {
      renderComponent({ mode: IndexDetailsMode.Editable })

      // Verify the column headers are present
      const nameHeader = screen.getByText('Field name')
      const valueHeader = screen.getByText('Field sample value')
      const typeHeader = screen.getByText('Suggested indexing type')

      expect(nameHeader).toBeInTheDocument()
      expect(valueHeader).toBeInTheDocument()
      expect(typeHeader).toBeInTheDocument()

      // Verify field columns and actions are present
      mockFields.forEach((field) => {
        const nameCell = screen.getByTestId(
          `index-details-field-name-${field.id}`,
        )
        const valueCell = screen.getByTestId(
          `index-details-field-value-${field.id}`,
        )
        const typeCell = screen.getByTestId(
          `index-details-field-type-${field.id}`,
        )
        const editBtn = screen.getByTestId(
          `index-details-field-edit-btn-${field.id}`,
        )

        expect(nameCell).toBeInTheDocument()
        expect(valueCell).toBeInTheDocument()
        expect(typeCell).toBeInTheDocument()
        expect(editBtn).toBeInTheDocument()
      })
    })

    it('should call onFieldEdit when edit button is clicked', () => {
      const onFieldEdit = jest.fn()
      renderComponent({ onFieldEdit, mode: IndexDetailsMode.Editable })

      const editBtn = screen.getByTestId(
        `index-details-field-edit-btn-${mockFields[0].id}`,
      )
      fireEvent.click(editBtn)

      expect(onFieldEdit).toHaveBeenCalledWith(mockFields[0])
    })
  })
})
