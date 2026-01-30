import React from 'react'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { indexFieldFactory } from 'uiSrc/mocks/factories/redisearch/IndexField.factory'
import { FieldActionsCell } from './FieldActionsCell'

const mockField = indexFieldFactory.build()

describe('FieldActionsCell', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render edit button', () => {
    render(<FieldActionsCell field={mockField} />)

    const editBtn = screen.getByTestId(
      `index-details-field-edit-btn-${mockField.id}`,
    )
    expect(editBtn).toBeInTheDocument()
  })

  it('should call onEdit with field when clicked', () => {
    const onEdit = jest.fn()
    render(<FieldActionsCell field={mockField} onEdit={onEdit} />)

    const editBtn = screen.getByTestId(
      `index-details-field-edit-btn-${mockField.id}`,
    )
    fireEvent.click(editBtn)

    expect(onEdit).toHaveBeenCalledWith(mockField)
  })
})
