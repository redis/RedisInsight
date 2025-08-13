import React from 'react'
import userEvent from '@testing-library/user-event'
import DeleteConfirmationButton from './DeleteConfirmationButton'
import { render, screen } from 'uiSrc/utils/test-utils'

describe('DeleteConfirmationButton', () => {
  it('renders the trigger IconButton', () => {
    const onConfirm = jest.fn()
    render(<DeleteConfirmationButton onConfirm={onConfirm} />)

    const trigger = screen.getByTestId('manage-index-delete-btn')
    expect(trigger).toBeInTheDocument()
  })

  it('opens the popover on trigger click and shows content', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<DeleteConfirmationButton onConfirm={onConfirm} />)

    expect(
      screen.queryByText(/are you sure you want to delete this index\?/i),
    ).not.toBeInTheDocument()

    await user.click(screen.getByTestId('manage-index-delete-btn'))

    expect(
      screen.getByText(/are you sure you want to delete this index\?/i),
    ).toBeInTheDocument()

    const deleteBtn = screen.getByTestId('manage-index-delete-confirmation-btn')
    expect(deleteBtn).toBeInTheDocument()
    expect(deleteBtn).toHaveTextContent(/delete/i)
  })

  it('calls onConfirm when the Delete button is clicked', async () => {
    const onConfirm = jest.fn()

    render(<DeleteConfirmationButton onConfirm={onConfirm} isOpen />)

    // In JSDOM, Popover content may be rendered with `pointer-events: none`
    // or `visibility: hidden` due to missing layout measurements.
    // This disables userEvent's pointer-events check so the button can be clicked in tests.
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    await user.click(screen.getByTestId('manage-index-delete-btn'))
    const deleteBtn = await screen.findByTestId(
      'manage-index-delete-confirmation-btn',
    )
    await user.click(deleteBtn)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('forwards RiPopover props via ...rest and keeps hardcoded ones', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()

    render(
      <DeleteConfirmationButton
        onConfirm={onConfirm}
        id="test-id-manage-index"
        anchorPosition="upLeft"
      />,
    )

    await user.click(screen.getByTestId('manage-index-delete-btn'))

    const popoverRoot = document.querySelector('#test-id-manage-index')
    expect(popoverRoot).not.toBeNull()

    expect(
      screen.getByText(/are you sure you want to delete this index\?/i),
    ).toBeInTheDocument()
  })
})
