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
})
