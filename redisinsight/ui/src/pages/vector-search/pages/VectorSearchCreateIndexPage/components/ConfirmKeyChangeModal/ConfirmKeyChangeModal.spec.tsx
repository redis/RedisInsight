import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { ConfirmKeyChangeModal } from './ConfirmKeyChangeModal'
import { ConfirmKeyChangeModalProps } from './ConfirmKeyChangeModal.types'

describe('ConfirmKeyChangeModal', () => {
  const defaultProps: ConfirmKeyChangeModalProps = {
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  const renderComponent = (
    propsOverride?: Partial<ConfirmKeyChangeModalProps>,
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<ConfirmKeyChangeModal {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the modal with title and message', () => {
    renderComponent()

    const title = screen.getByText('Unsaved changes')
    const message = screen.getByTestId('change-key-modal-message')

    expect(title).toBeInTheDocument()
    expect(message).toBeInTheDocument()
  })

  it('should call onCancel when "Keep editing" button is clicked', () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    const cancelBtn = screen.getByTestId('change-key-modal-cancel')
    fireEvent.click(cancelBtn)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onConfirm when "Discard and load" button is clicked', () => {
    const onConfirm = jest.fn()
    renderComponent({ onConfirm })

    const confirmBtn = screen.getByTestId('change-key-modal-confirm')
    fireEvent.click(confirmBtn)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when close button is clicked', () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    const closeBtn = screen.getByTestId('change-key-modal-close')
    fireEvent.click(closeBtn)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
