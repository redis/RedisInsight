import React from 'react'
import { render, screen, userEvent, cleanup } from 'uiSrc/utils/test-utils'

import { MakeSearchableModal } from './MakeSearchableModal'
import { MakeSearchableModalProps } from './MakeSearchableModal.types'

const defaultProps: MakeSearchableModalProps = {
  isOpen: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<MakeSearchableModalProps>) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<MakeSearchableModal {...props} />)
}

describe('MakeSearchableModal', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render nothing when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false })

    expect(container.innerHTML).toBe('')
  })

  it('should render the modal when isOpen is true', () => {
    renderComponent()

    expect(screen.getByTestId('make-searchable-modal-body')).toBeInTheDocument()
  })

  it('should display the title', () => {
    renderComponent()

    expect(screen.getByText('Make this data searchable')).toBeInTheDocument()
  })

  it('should show prefix in the body text when provided', () => {
    renderComponent({ prefix: 'bicycle:' })

    expect(screen.getByText("'bicycle:'")).toBeInTheDocument()
    expect(screen.getByText(/All keys starting with/)).toBeInTheDocument()
  })

  it('should show prefix text when prefix is empty string', () => {
    renderComponent({ prefix: '' })

    expect(screen.getByText(/All keys starting with/)).toBeInTheDocument()
  })

  it('should not show prefix text when prefix is undefined', () => {
    renderComponent({ prefix: undefined })

    expect(screen.queryByText(/All keys starting with/)).not.toBeInTheDocument()
  })

  it('should call onConfirm when Continue button is clicked', async () => {
    const onConfirm = jest.fn()
    renderComponent({ onConfirm })

    await userEvent.click(screen.getByTestId('make-searchable-modal-confirm'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when Cancel button is clicked', async () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    await userEvent.click(screen.getByTestId('make-searchable-modal-cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when close button is clicked', async () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    await userEvent.click(screen.getByTestId('make-searchable-modal-close'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
