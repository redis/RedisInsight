import React from 'react'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'

import {
  DeleteIndexConfirmation,
  DeleteIndexConfirmationProps,
} from './DeleteIndexConfirmation'

const defaultProps: DeleteIndexConfirmationProps = {
  isOpen: true,
  onConfirm: jest.fn(),
  onClose: jest.fn(),
}

const renderComponent = (
  propsOverride?: Partial<DeleteIndexConfirmationProps>,
) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<DeleteIndexConfirmation {...props} />)
}

describe('DeleteIndexConfirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    renderComponent({ isOpen: false })

    expect(
      screen.queryByTestId('delete-index-modal-message'),
    ).not.toBeInTheDocument()
  })

  it('should render modal when isOpen is true', () => {
    renderComponent()

    expect(screen.getByTestId('delete-index-modal-message')).toBeInTheDocument()
    expect(screen.getByTestId('delete-index-modal-confirm')).toBeInTheDocument()
    expect(screen.getByTestId('delete-index-modal-cancel')).toBeInTheDocument()
  })

  it('should call onConfirm when Delete index button is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onConfirm = jest.fn()
    renderComponent({ onConfirm })

    await user.click(screen.getByTestId('delete-index-modal-confirm'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Keep index button is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onClose = jest.fn()
    renderComponent({ onClose })

    await user.click(screen.getByTestId('delete-index-modal-cancel'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close icon is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onClose = jest.fn()
    renderComponent({ onClose })

    await user.click(screen.getByTestId('delete-index-modal-close'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
