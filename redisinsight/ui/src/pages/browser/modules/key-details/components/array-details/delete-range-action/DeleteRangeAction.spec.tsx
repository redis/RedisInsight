import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { DeleteRangeAction } from './DeleteRangeAction'
import { DeleteRangeActionProps } from './DeleteRangeAction.types'

const DELETE_TESTID = 'array-delete-range'
const DELETE_CONFIRM_TESTID = 'array-delete-range-confirm'

const defaultProps: DeleteRangeActionProps = {
  start: '0',
  end: '9',
  onDeleteRange: jest.fn(),
}

const renderComponent = (props: Partial<DeleteRangeActionProps> = {}) =>
  render(<DeleteRangeAction {...defaultProps} {...props} />)

describe('DeleteRangeAction', () => {
  it('opens a confirm popover stating the exact window', () => {
    renderComponent({ start: '5', end: '20' })

    fireEvent.click(screen.getByTestId(DELETE_TESTID))

    expect(
      screen.getByText(
        'Elements in range 5-20 will be permanently removed from the array.',
      ),
    ).toBeInTheDocument()
  })

  it('calls onDeleteRange on confirm and closes the popover', () => {
    const onDeleteRange = jest.fn()
    renderComponent({ onDeleteRange })

    fireEvent.click(screen.getByTestId(DELETE_TESTID))
    fireEvent.click(screen.getByTestId(DELETE_CONFIRM_TESTID))

    expect(onDeleteRange).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId(DELETE_CONFIRM_TESTID)).not.toBeInTheDocument()
  })

  it('does not delete before the confirm click', () => {
    const onDeleteRange = jest.fn()
    renderComponent({ onDeleteRange })

    fireEvent.click(screen.getByTestId(DELETE_TESTID))

    expect(onDeleteRange).not.toHaveBeenCalled()
  })

  it.each([
    ['loading', { loading: true }],
    ['disabled prop', { disabled: true }],
    ['invalid start index', { start: '-1' }],
    ['non-canonical end index', { end: '007' }],
  ])('disables the trigger on %s', (_, props) => {
    renderComponent(props)

    expect(screen.getByTestId(DELETE_TESTID)).toBeDisabled()
  })

  it('stays enabled for an over-cap span (the cap only guards the view query)', () => {
    // ARDELRANGE accepts any inclusive window — deleting 0..10M without
    // loading it first is a supported flow, so it is not span-capped.
    renderComponent({ start: '0', end: '10000000' })

    expect(screen.getByTestId(DELETE_TESTID)).not.toBeDisabled()
  })

  it('stays enabled for a reversed range (deletes the same inclusive window)', () => {
    renderComponent({ start: '20', end: '5' })

    expect(screen.getByTestId(DELETE_TESTID)).not.toBeDisabled()
  })

  it('closes an open confirm popover when the key changes', () => {
    // A confirm left open across a key switch would target the new key
    // with stale or default bounds.
    const { rerender } = renderComponent({ keyName: 'readings' })

    fireEvent.click(screen.getByTestId(DELETE_TESTID))
    expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).toBeInTheDocument()

    rerender(<DeleteRangeAction {...defaultProps} keyName="other-key" />)

    expect(screen.queryByTestId(DELETE_CONFIRM_TESTID)).not.toBeInTheDocument()
  })

  it('closes an open confirm popover when the action becomes disabled', () => {
    const { rerender } = renderComponent()

    fireEvent.click(screen.getByTestId(DELETE_TESTID))
    expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).toBeInTheDocument()

    rerender(<DeleteRangeAction {...defaultProps} disabled />)

    expect(screen.queryByTestId(DELETE_CONFIRM_TESTID)).not.toBeInTheDocument()
  })

  it('disables the confirm button when an index turns invalid while open', () => {
    const { rerender } = renderComponent()

    fireEvent.click(screen.getByTestId(DELETE_TESTID))
    expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).not.toBeDisabled()

    rerender(<DeleteRangeAction {...defaultProps} start="-1" />)

    expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).toBeDisabled()
  })
})
