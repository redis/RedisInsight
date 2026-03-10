import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { SaveQueryModal } from './SaveQueryModal'
import { SaveQueryModalProps } from './SaveQueryModal.types'

describe('SaveQueryModal', () => {
  const defaultProps: SaveQueryModalProps = {
    isOpen: true,
    isSaving: false,
    onSave: jest.fn(),
    onClose: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<SaveQueryModalProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<SaveQueryModal {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    renderComponent({ isOpen: false })

    expect(
      screen.queryByTestId('save-query-modal-body'),
    ).not.toBeInTheDocument()
  })

  it('should render modal with title, input, and buttons', () => {
    renderComponent()

    const dialog = screen.getByRole('dialog', { name: 'Save query' })
    expect(dialog).toBeInTheDocument()

    expect(
      screen.getByTestId('save-query-modal-name-input'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('save-query-modal-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('save-query-modal-confirm')).toBeInTheDocument()
  })

  it('should disable save button when name is empty', () => {
    renderComponent()

    const saveBtn = screen.getByTestId('save-query-modal-confirm')
    expect(saveBtn).toBeDisabled()
  })

  it('should enable save button when name is entered', () => {
    renderComponent()

    const input = screen.getByTestId('save-query-modal-name-input')
    fireEvent.change(input, { target: { value: faker.lorem.words(2) } })

    const saveBtn = screen.getByTestId('save-query-modal-confirm')
    expect(saveBtn).not.toBeDisabled()
  })

  it('should disable save button when name is whitespace only', () => {
    renderComponent()

    const input = screen.getByTestId('save-query-modal-name-input')
    fireEvent.change(input, { target: { value: '   ' } })

    const saveBtn = screen.getByTestId('save-query-modal-confirm')
    expect(saveBtn).toBeDisabled()
  })

  it('should call onSave with trimmed name when save is clicked', () => {
    const queryName = faker.lorem.words(3)
    renderComponent()

    const input = screen.getByTestId('save-query-modal-name-input')
    fireEvent.change(input, { target: { value: `  ${queryName}  ` } })

    const saveBtn = screen.getByTestId('save-query-modal-confirm')
    fireEvent.click(saveBtn)

    expect(defaultProps.onSave).toHaveBeenCalledWith(queryName)
  })

  it('should call onClose when cancel button is clicked', () => {
    renderComponent()

    const cancelBtn = screen.getByTestId('save-query-modal-cancel')
    fireEvent.click(cancelBtn)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close icon is clicked', () => {
    renderComponent()

    const closeBtn = screen.getByTestId('save-query-modal-close')
    fireEvent.click(closeBtn)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should disable save button when isSaving is true', () => {
    renderComponent({ isSaving: true })

    const input = screen.getByTestId('save-query-modal-name-input')
    fireEvent.change(input, { target: { value: faker.lorem.words(2) } })

    const saveBtn = screen.getByTestId('save-query-modal-confirm')
    expect(saveBtn).toBeDisabled()
  })
})
