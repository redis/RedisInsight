import React from 'react'

import { ClearSlowLogModal, ClearSlowLogModalProps } from './ClearSlowLogModal'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

const renderClearSlowLogModal = (props?: Partial<ClearSlowLogModalProps>) => {
  const defaultProps: ClearSlowLogModalProps = {
    name: 'test-database',
    isOpen: true,
    onClose: jest.fn(),
    onClear: jest.fn(),
  }

  return render(<ClearSlowLogModal {...defaultProps} {...props} />)
}

describe('ClearSlowLogModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the modal when isOpen is true', () => {
    const props: Partial<ClearSlowLogModalProps> = {
      name: 'test-database',
      isOpen: true,
    }

    renderClearSlowLogModal(props)

    const title = screen.getByText('Clear slow log')
    expect(title).toBeInTheDocument()

    const message = screen.getByText(
      /Slow Log will be cleared for\s+test-database/,
    )
    expect(message).toBeInTheDocument()

    const note = screen.getByText('NOTE: This is server configuration')
    expect(note).toBeInTheDocument()

    const cancelButton = screen.getByTestId('reset-cancel-btn')
    expect(cancelButton).toBeInTheDocument()
    expect(cancelButton).toHaveTextContent('Cancel')

    const clearButton = screen.getByTestId('reset-confirm-btn')
    expect(clearButton).toBeInTheDocument()
    expect(clearButton).toHaveTextContent('Clear')
  })

  it('should not render the modal when isOpen is false', () => {
    renderClearSlowLogModal({ isOpen: false })

    const modal = screen.queryByTestId('clear-slow-log-modal')
    expect(modal).not.toBeInTheDocument()
  })

  it('should call onClose when Cancel button is clicked', () => {
    const props: Partial<ClearSlowLogModalProps> = {
      onClose: jest.fn(),
      onClear: jest.fn(),
    }

    renderClearSlowLogModal(props)

    const cancelButton = screen.getByTestId('reset-cancel-btn')
    fireEvent.click(cancelButton)

    expect(props.onClose).toHaveBeenCalledTimes(1)
    expect(props.onClear).not.toHaveBeenCalled()
  })

  it('should call onClear and onClose when Clear button is clicked', () => {
    const props: Partial<ClearSlowLogModalProps> = {
      onClose: jest.fn(),
      onClear: jest.fn(),
    }

    renderClearSlowLogModal(props)

    const clearButton = screen.getByTestId('reset-confirm-btn')
    fireEvent.click(clearButton)

    expect(props.onClear).toHaveBeenCalledTimes(1)
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })
})
