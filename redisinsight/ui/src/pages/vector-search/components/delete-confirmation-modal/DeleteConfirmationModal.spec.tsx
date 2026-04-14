import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { DeleteConfirmationModalProps } from './DeleteConfirmationModal.types'

describe('DeleteConfirmationModal', () => {
  const defaultProps: DeleteConfirmationModalProps = {
    isOpen: true,
    title: faker.lorem.words(2),
    question: faker.lorem.sentence(),
    message: faker.lorem.sentence(),
    cancelLabel: faker.lorem.word(),
    confirmLabel: faker.lorem.word(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    testId: 'test-modal',
  }

  const renderComponent = (
    propsOverride?: Partial<DeleteConfirmationModalProps>,
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<DeleteConfirmationModal {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    renderComponent({ isOpen: false })

    const message = screen.queryByTestId('test-modal-message')
    expect(message).not.toBeInTheDocument()
  })

  it('should render modal with title, question, message and action buttons', () => {
    renderComponent()

    const dialog = screen.getByRole('dialog', { name: defaultProps.title })
    expect(dialog).toBeInTheDocument()

    const question = screen.getByText(defaultProps.question)
    expect(question).toBeInTheDocument()

    const message = screen.getByText(defaultProps.message)
    expect(message).toBeInTheDocument()

    const cancelBtn = screen.getByTestId('test-modal-cancel')
    expect(cancelBtn).toHaveTextContent(defaultProps.cancelLabel)

    const confirmBtn = screen.getByTestId('test-modal-confirm')
    expect(confirmBtn).toHaveTextContent(defaultProps.confirmLabel)
  })

  it('should call onConfirm when confirm button is clicked', () => {
    renderComponent()

    const confirmBtn = screen.getByTestId('test-modal-confirm')
    fireEvent.click(confirmBtn)

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when cancel button is clicked', () => {
    renderComponent()

    const cancelBtn = screen.getByTestId('test-modal-cancel')
    fireEvent.click(cancelBtn)

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when close icon is clicked', () => {
    renderComponent()

    const closeBtn = screen.getByTestId('test-modal-close')
    fireEvent.click(closeBtn)

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('should use default testId when none is provided', () => {
    renderComponent({ testId: undefined })

    const message = screen.getByTestId('delete-confirmation-modal-message')
    expect(message).toBeInTheDocument()
  })
})
