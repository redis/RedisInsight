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

  it('reveals the ARSCAN preview when the toggle is pressed (showEmpty=false)', () => {
    renderComponent({ showEmpty: false })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      /ARSCAN\s+\S+\s+0\s+9/,
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

  it('disables Run when end < start (backend rejects reversed ranges)', () => {
    renderComponent({ start: '500', end: '100' })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
  })

  it('disables Run when the span exceeds the backend cap (1,000,000)', () => {
    // span = end - start + 1 = 1_000_001, one past the cap
    renderComponent({ start: '0', end: '1000000' })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
  })

  it('allows Run when the span equals the backend cap (1,000,000)', () => {
    // span = end - start + 1 = 1_000_000, exactly at the cap
    renderComponent({ start: '0', end: '999999' })

    expect(screen.getByTestId('array-range-form-run')).not.toBeDisabled()
  })

  it('disables Run and Reset when the disabled prop is set', () => {
    // Container passes disabled=true while the selected-key slice has
    // not confirmed the new key is an array, so manual clicks during a
    // key switch can't dispatch ARGETRANGE/ARSCAN at a non-array key.
    const onReset = jest.fn()
    renderComponent({ onReset, disabled: true })

    expect(screen.getByTestId('array-range-form-run')).toBeDisabled()
    expect(screen.getByTestId('array-range-form-reset')).toBeDisabled()
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
