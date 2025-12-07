import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { DeleteKeyPopover } from './DeleteKeyPopover'

describe('DeleteKeyPopover', () => {
  const mockProps = {
    nameString: 'test-key',
    name: stringToBuffer('test-key'),
    type: KeyTypes.String,
    rowId: 1,
    onDelete: jest.fn(),
    onOpenPopover: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render delete button with proper data-testid', () => {
    render(<DeleteKeyPopover {...mockProps} />)

    expect(
      screen.getByTestId(`delete-key-btn-${mockProps.nameString}`),
    ).toBeInTheDocument()
  })

  it('should not show popover content by default', () => {
    render(<DeleteKeyPopover {...mockProps} />)

    expect(screen.queryByText('will be deleted.')).not.toBeInTheDocument()
    expect(screen.queryByTestId('submit-delete-key')).not.toBeInTheDocument()
  })

  it('should show popover content when deletePopoverId matches rowId', () => {
    render(
      <DeleteKeyPopover {...mockProps} deletePopoverId={mockProps.rowId} />,
    )

    expect(screen.getByText('will be deleted.')).toBeInTheDocument()
    expect(screen.getByTestId('submit-delete-key')).toBeInTheDocument()
  })

  it('should call onOpenPopover when delete button is clicked', () => {
    render(<DeleteKeyPopover {...mockProps} />)

    fireEvent.click(
      screen.getByTestId(`delete-key-btn-${mockProps.nameString}`),
    )

    expect(mockProps.onOpenPopover).toHaveBeenCalledWith(
      mockProps.rowId,
      mockProps.type,
    )
  })

  it('should call onOpenPopover with -1 when closing the popover', () => {
    const { container } = render(
      <DeleteKeyPopover {...mockProps} deletePopoverId={mockProps.rowId} />,
    )

    container.querySelector('.euiPopover')
    const closePopover = () => mockProps.onOpenPopover(-1, mockProps.type)
    closePopover()

    expect(mockProps.onOpenPopover).toHaveBeenCalledWith(-1, mockProps.type)
  })

  it('should call onDelete with proper arguments when confirm button is clicked', () => {
    render(
      <DeleteKeyPopover {...mockProps} deletePopoverId={mockProps.rowId} />,
    )

    fireEvent.click(screen.getByTestId('submit-delete-key'))

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockProps.name)
  })

  it('should disable delete button when deleting is true', () => {
    render(
      <DeleteKeyPopover
        {...mockProps}
        deletePopoverId={mockProps.rowId}
        deleting
      />,
    )

    expect(screen.getByTestId('submit-delete-key')).toBeDisabled()
  })

  it('should format long names in the confirmation message', () => {
    const longNameProps = {
      ...mockProps,
      nameString: 'very-long-key-name-that-might-need-formatting',
      deletePopoverId: mockProps.rowId,
    }

    render(<DeleteKeyPopover {...longNameProps} />)

    expect(screen.getByText(longNameProps.nameString)).toBeInTheDocument()
  })
})
