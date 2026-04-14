import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { DeleteQueryModal } from './DeleteQueryModal'
import { DeleteQueryModalProps } from './DeleteQueryModal.types'

describe('DeleteQueryModal', () => {
  const defaultProps: DeleteQueryModalProps = {
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<DeleteQueryModalProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<DeleteQueryModal {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render modal with title, confirmation message and action buttons', () => {
    renderComponent()

    const dialog = screen.getByRole('dialog', { name: 'Delete query' })
    expect(dialog).toBeInTheDocument()

    const message = screen.getByTestId('query-library-delete-modal-message')
    expect(message).toBeInTheDocument()

    const question = screen.getByText(
      'Are you sure you want to delete this query?',
    )
    expect(question).toBeInTheDocument()

    const disclaimer = screen.getByText(
      "This action will remove the saved query, but won't affect your index or data.",
    )
    expect(disclaimer).toBeInTheDocument()

    const cancelBtn = screen.getByTestId('query-library-delete-modal-cancel')
    expect(cancelBtn).toHaveTextContent('Keep query')

    const confirmBtn = screen.getByTestId('query-library-delete-modal-confirm')
    expect(confirmBtn).toHaveTextContent('Delete query')
  })

  it('should call onConfirm when Delete query button is clicked', () => {
    renderComponent()

    const confirmBtn = screen.getByTestId('query-library-delete-modal-confirm')
    fireEvent.click(confirmBtn)

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when Keep query button is clicked', () => {
    renderComponent()

    const cancelBtn = screen.getByTestId('query-library-delete-modal-cancel')
    fireEvent.click(cancelBtn)

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when close icon is clicked', () => {
    renderComponent()

    const closeBtn = screen.getByTestId('query-library-delete-modal-close')
    fireEvent.click(closeBtn)

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })
})
