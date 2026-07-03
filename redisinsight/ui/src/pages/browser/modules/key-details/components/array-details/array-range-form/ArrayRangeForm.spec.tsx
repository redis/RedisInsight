import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { ArrayRangeForm } from './ArrayRangeForm'
import { ArrayRangeFormProps } from './ArrayRangeForm.types'

const defaultProps: ArrayRangeFormProps = {
  start: '0',
  end: '9',
  showEmpty: true,
  loading: false,
  onChangeStart: jest.fn(),
  onChangeEnd: jest.fn(),
  onToggleShowEmpty: jest.fn(),
  onRun: jest.fn(),
}

const renderComponent = (props: Partial<ArrayRangeFormProps> = {}) =>
  render(<ArrayRangeForm {...defaultProps} {...props} />)

const PREVIEW_TEXT_TESTID = 'array-range-form-command-preview-text'
const PREVIEW_TOGGLE_TESTID = 'array-range-form-preview-toggle'

describe('ArrayRangeForm', () => {
  it('hides the command preview by default', () => {
    renderComponent()

    expect(screen.queryByTestId(PREVIEW_TEXT_TESTID)).not.toBeInTheDocument()
  })

  it('reveals the ARGETRANGE preview when the toggle is pressed (showEmpty=true)', () => {
    renderComponent({ showEmpty: true })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      /ARGETRANGE\s+\S+\s+0\s+9/,
    )
  })

  it('reveals the ARSCAN preview with the matching LIMIT when toggled (showEmpty=false)', () => {
    // The preview must mirror what `scanArrayRange` actually sends — the
    // slice always pins LIMIT to DEFAULT_SCAN_LIMIT — so copying the
    // preview into CLI/Workbench can't issue an unbounded ARSCAN.
    renderComponent({ showEmpty: false })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      /ARSCAN\s+\S+\s+0\s+9\s+LIMIT\s+1000000/,
    )
  })

  it('disables Run while loading', () => {
    renderComponent({ loading: true })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
  })

  it('disables Run when start index is not a valid BigInt-string', () => {
    renderComponent({ start: '-1' })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
  })

  it.each(['007', ' 7 ', '7.0', '1e3'])(
    'disables Run for non-canonical index input %p (matches backend @IsArrayIndex)',
    (input) => {
      renderComponent({ start: input })

      expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
    },
  )

  it('allows Run when end < start (backend returns reverse-order results)', () => {
    renderComponent({ start: '500', end: '100' })

    expect(screen.getByTestId('array-range-form-run')).not.toBeDisabled()
  })

  it('disables Run when the span exceeds the backend cap (1,000,000)', () => {
    // span = end - start + 1 = 1_000_001, one past the cap
    renderComponent({ start: '0', end: '1000000' })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
  })

  it('disables Run when a reversed range exceeds the backend cap', () => {
    // span = |end - start| + 1 = 1_000_001, one past the cap
    renderComponent({ start: '1000000', end: '0' })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
  })

  it('allows Run when the span equals the backend cap (1,000,000)', () => {
    // span = end - start + 1 = 1_000_000, exactly at the cap
    renderComponent({ start: '0', end: '999999' })

    expect(screen.getByTestId('array-range-form-run')).not.toBeDisabled()
  })

  it('allows Run for an over-cap span when ARSCAN is selected (showEmpty=false)', () => {
    // ARSCAN has no span cap on the backend — sparse arrays are routinely
    // browsed with ranges far larger than 1M; LIMIT is the backpressure.
    renderComponent({ start: '0', end: '10000000', showEmpty: false })

    expect(screen.getByTestId('array-range-form-run')).not.toBeDisabled()
  })

  it('disables Run, Reset, inputs and checkbox when the disabled prop is set', () => {
    // Container passes disabled=true while the selected-key slice has
    // not confirmed the new key is an array. Inputs/checkbox are also
    // disabled so the auto-fetch effect can't pick up half-typed or
    // over-cap drafts that bypass the form's rangeInvalid guard.
    const onReset = jest.fn()
    renderComponent({ onReset, disabled: true })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
    expect(screen.getByTestId('array-range-form-reset')).toBeDisabled()
    expect(screen.getByTestId('array-range-form-start')).toBeDisabled()
    expect(screen.getByTestId('array-range-form-end')).toBeDisabled()
    expect(screen.getByTestId('array-range-form-show-empty')).toBeDisabled()
  })

  it('quotes key names containing whitespace in the command preview', () => {
    renderComponent({ keyName: 'a b' })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      /ARGETRANGE\s+"a b"\s+0\s+9/,
    )
  })

  it('escapes embedded quotes/backslashes in keys for the command preview', () => {
    renderComponent({ keyName: 'a"b\\c' })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      /ARGETRANGE\s+"a\\"b\\\\c"\s+0\s+9/,
    )
  })

  it('calls onRun when Run is clicked with a valid range', () => {
    const onRun = jest.fn()
    renderComponent({ onRun })

    fireEvent.click(screen.getByTestId('array-range-form-run'))
    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it('renders the reset button only when onReset is provided', () => {
    const { rerender } = renderComponent()
    expect(
      screen.queryByTestId('array-range-form-reset'),
    ).not.toBeInTheDocument()

    const onReset = jest.fn()
    rerender(<ArrayRangeForm {...defaultProps} onReset={onReset} />)

    fireEvent.click(screen.getByTestId('array-range-form-reset'))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  describe('Delete range', () => {
    const DELETE_TESTID = 'array-range-form-delete'
    const DELETE_CONFIRM_TESTID = 'array-range-form-delete-confirm'

    it('renders the delete button only when onDeleteRange is provided', () => {
      renderComponent()

      expect(screen.queryByTestId(DELETE_TESTID)).not.toBeInTheDocument()
    })

    it('opens a confirm popover stating the exact window', () => {
      renderComponent({
        onDeleteRange: jest.fn(),
        start: '5',
        end: '20',
      })

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
      expect(
        screen.queryByTestId(DELETE_CONFIRM_TESTID),
      ).not.toBeInTheDocument()
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
    ])('disables Delete range on %s', (_, props) => {
      renderComponent({ onDeleteRange: jest.fn(), ...props })

      expect(screen.getByTestId(DELETE_TESTID)).toBeDisabled()
    })

    it('stays enabled for an over-cap span (the cap only guards the view query)', () => {
      // ARDELRANGE accepts any inclusive window — deleting 0..10M without
      // loading it first is a supported flow, so only Run is span-capped.
      renderComponent({
        onDeleteRange: jest.fn(),
        start: '0',
        end: '10000000',
      })

      expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
      expect(screen.getByTestId(DELETE_TESTID)).not.toBeDisabled()
    })

    it('stays enabled for a reversed range (deletes the same inclusive window)', () => {
      renderComponent({ onDeleteRange: jest.fn(), start: '20', end: '5' })

      expect(screen.getByTestId(DELETE_TESTID)).not.toBeDisabled()
    })

    it('closes an open confirm popover when the key changes', () => {
      // A confirm left open across a key switch would target the new key
      // with stale or default bounds.
      const { rerender } = renderComponent({
        onDeleteRange: jest.fn(),
        keyName: 'readings',
      })

      fireEvent.click(screen.getByTestId(DELETE_TESTID))
      expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).toBeInTheDocument()

      rerender(
        <ArrayRangeForm
          {...defaultProps}
          onDeleteRange={jest.fn()}
          keyName="other-key"
        />,
      )

      expect(
        screen.queryByTestId(DELETE_CONFIRM_TESTID),
      ).not.toBeInTheDocument()
    })

    it('closes an open confirm popover when the form becomes disabled', () => {
      const { rerender } = renderComponent({ onDeleteRange: jest.fn() })

      fireEvent.click(screen.getByTestId(DELETE_TESTID))
      expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).toBeInTheDocument()

      rerender(
        <ArrayRangeForm {...defaultProps} onDeleteRange={jest.fn()} disabled />,
      )

      expect(
        screen.queryByTestId(DELETE_CONFIRM_TESTID),
      ).not.toBeInTheDocument()
    })

    it('disables the confirm button when an index turns invalid while open', () => {
      const { rerender } = renderComponent({ onDeleteRange: jest.fn() })

      fireEvent.click(screen.getByTestId(DELETE_TESTID))
      expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).not.toBeDisabled()

      rerender(
        <ArrayRangeForm
          {...defaultProps}
          onDeleteRange={jest.fn()}
          start="-1"
        />,
      )

      expect(screen.getByTestId(DELETE_CONFIRM_TESTID)).toBeDisabled()
    })
  })
})
