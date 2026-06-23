import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'

import { ArrayAggregateForm } from './ArrayAggregateForm'
import { ArrayAggregateFormProps } from './ArrayAggregateForm.types'

const defaultProps: ArrayAggregateFormProps = {
  start: '0',
  end: '9',
  operation: ArrayAggregateOperation.Sum,
  value: '',
  loading: false,
  onChangeStart: jest.fn(),
  onChangeEnd: jest.fn(),
  onChangeOperation: jest.fn(),
  onChangeValue: jest.fn(),
  onRun: jest.fn(),
}

const renderComponent = (props: Partial<ArrayAggregateFormProps> = {}) =>
  render(<ArrayAggregateForm {...defaultProps} {...props} />)

const TEST_ID = 'array-aggregate-form'
const RUN_TESTID = `${TEST_ID}-run`
const RESET_TESTID = `${TEST_ID}-reset`
const START_TESTID = `${TEST_ID}-start`
const END_TESTID = `${TEST_ID}-end`
const VALUE_TESTID = `${TEST_ID}-value`
const PREVIEW_TOGGLE_TESTID = `${TEST_ID}-preview-toggle`
// CommandPreview keeps a shared, hard-coded test id across the range and
// aggregate forms — assert against that rather than a per-form id.
const PREVIEW_TEXT_TESTID = 'array-range-form-command-preview-text'

describe('ArrayAggregateForm', () => {
  describe('command preview', () => {
    it('hides the command preview by default', () => {
      renderComponent()

      expect(screen.queryByTestId(PREVIEW_TEXT_TESTID)).not.toBeInTheDocument()
    })

    it('reveals the AROP preview without a value for non-MATCH operations', () => {
      renderComponent({ operation: ArrayAggregateOperation.Sum })

      fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

      expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
        /^AROP\s+<key>\s+0\s+9\s+SUM$/,
      )
    })

    it('appends the comparison value to the preview for MATCH', () => {
      renderComponent({
        operation: ArrayAggregateOperation.Match,
        value: 'needle',
      })

      fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

      expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
        /AROP\s+<key>\s+0\s+9\s+MATCH\s+needle/,
      )
    })

    it('quotes key names containing whitespace in the command preview', () => {
      renderComponent({ keyName: 'a b' })

      fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

      expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
        /AROP\s+"a b"\s+0\s+9\s+SUM/,
      )
    })

    it('escapes embedded quotes/backslashes in keys for the command preview', () => {
      renderComponent({ keyName: 'a"b\\c' })

      fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

      expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
        /AROP\s+"a\\"b\\\\c"\s+0\s+9\s+SUM/,
      )
    })
  })

  describe('the comparison-value input', () => {
    it('renders only when the operation is MATCH', () => {
      const { rerender } = renderComponent({
        operation: ArrayAggregateOperation.Sum,
      })
      expect(screen.queryByTestId(VALUE_TESTID)).not.toBeInTheDocument()

      rerender(
        <ArrayAggregateForm
          {...defaultProps}
          operation={ArrayAggregateOperation.Match}
        />,
      )
      expect(screen.getByTestId(VALUE_TESTID)).toBeInTheDocument()
    })

    it('forwards typed input to onChangeValue', () => {
      const onChangeValue = jest.fn()
      renderComponent({
        operation: ArrayAggregateOperation.Match,
        onChangeValue,
      })

      fireEvent.change(screen.getByTestId(VALUE_TESTID), {
        target: { value: 'needle' },
      })

      expect(onChangeValue).toHaveBeenCalledWith('needle')
    })
  })

  describe('Run enablement / index validation', () => {
    it('disables Run while loading', () => {
      renderComponent({ loading: true })

      expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
    })

    it('disables Run when the start index is not a valid BigInt-string', () => {
      renderComponent({ start: '-1' })

      expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
    })

    it.each(['007', ' 7 ', '7.0', '1e3'])(
      'disables Run for non-canonical index input %p (matches backend @IsArrayIndex)',
      (input) => {
        renderComponent({ start: input })

        expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
      },
    )

    it('allows Run when end < start (AROP returns reverse-order results)', () => {
      renderComponent({ start: '500', end: '100' })

      expect(screen.getByTestId(RUN_TESTID)).not.toBeDisabled()
    })

    it('disables Run when the span exceeds the backend cap (1,000,000)', () => {
      // span = end - start + 1 = 1_000_001, one past the cap
      renderComponent({ start: '0', end: '1000000' })

      expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
    })

    it('disables Run when a reversed range exceeds the backend cap', () => {
      // span = |end - start| + 1 = 1_000_001, one past the cap
      renderComponent({ start: '1000000', end: '0' })

      expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
    })

    it('allows Run when the span equals the backend cap (1,000,000)', () => {
      // span = end - start + 1 = 1_000_000, exactly at the cap
      renderComponent({ start: '0', end: '999999' })

      expect(screen.getByTestId(RUN_TESTID)).not.toBeDisabled()
    })
  })

  describe('MATCH value enablement', () => {
    // AROP MATCH accepts any RedisString, including empty / whitespace-only
    // values — the backend only rejects an omitted `value` field. The form
    // must not gate Run on a non-empty (or trimmed-non-empty) value, so
    // populated zero-length / whitespace slots can be counted.
    it.each([
      ['an empty string', ''],
      ['a whitespace-only string', '   '],
    ])('allows Run for MATCH with %s', (_label, value) => {
      renderComponent({ operation: ArrayAggregateOperation.Match, value })

      expect(screen.getByTestId(RUN_TESTID)).not.toBeDisabled()
    })
  })

  describe('the disabled prop', () => {
    it('disables Run, Reset and the inputs when set', () => {
      // Container passes disabled=true while the selected-key slice has not
      // confirmed the new key is an array yet.
      renderComponent({
        operation: ArrayAggregateOperation.Match,
        onReset: jest.fn(),
        disabled: true,
      })

      expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
      expect(screen.getByTestId(RESET_TESTID)).toBeDisabled()
      expect(screen.getByTestId(START_TESTID)).toBeDisabled()
      expect(screen.getByTestId(END_TESTID)).toBeDisabled()
      expect(screen.getByTestId(VALUE_TESTID)).toBeDisabled()
    })
  })

  describe('actions', () => {
    it('calls onRun when Run is clicked with a valid range', () => {
      const onRun = jest.fn()
      renderComponent({ onRun })

      fireEvent.click(screen.getByTestId(RUN_TESTID))

      expect(onRun).toHaveBeenCalledTimes(1)
    })

    it('forwards typed input to onChangeStart', () => {
      const onChangeStart = jest.fn()
      renderComponent({ onChangeStart })

      fireEvent.change(screen.getByTestId(START_TESTID), {
        target: { value: '42' },
      })

      expect(onChangeStart).toHaveBeenCalledWith('42')
    })

    it('renders the reset button only when onReset is provided', () => {
      const { rerender } = renderComponent()
      expect(screen.queryByTestId(RESET_TESTID)).not.toBeInTheDocument()

      const onReset = jest.fn()
      rerender(<ArrayAggregateForm {...defaultProps} onReset={onReset} />)

      fireEvent.click(screen.getByTestId(RESET_TESTID))
      expect(onReset).toHaveBeenCalledTimes(1)
    })
  })
})
