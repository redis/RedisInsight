import React from 'react'
import { fireEvent, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'

import { ArraySearchForm } from './ArraySearchForm'
import { ArraySearchFormProps } from './ArraySearchForm.types'
import { ARRAY_SEARCH_FORM_TEST_ID as TEST_ID } from './ArraySearchForm.constants'

const defaultProps: ArraySearchFormProps = {
  criteria: ArrayGrepCriteria.Exact,
  value: 'redis',
  loading: false,
  onChangeCriteria: jest.fn(),
  onChangeValue: jest.fn(),
  onRun: jest.fn(),
}

const renderComponent = (props: Partial<ArraySearchFormProps> = {}) =>
  render(<ArraySearchForm {...defaultProps} {...props} />)

// CommandPreview is shared with the View tab, so its internal test ids keep
// the `array-range-form` prefix until it moves to a shared location.
const PREVIEW_TEXT_TESTID = 'array-range-form-command-preview-text'
const PREVIEW_TOGGLE_TESTID = `${TEST_ID}-preview-toggle`
const RUN_TESTID = `${TEST_ID}-run`
const VALUE_TESTID = `${TEST_ID}-value`
const CRITERIA_TESTID = `${TEST_ID}-criteria`

describe('ArraySearchForm', () => {
  it('hides the command preview by default', () => {
    renderComponent()

    expect(screen.queryByTestId(PREVIEW_TEXT_TESTID)).not.toBeInTheDocument()
  })

  it('reveals the ARGREP preview (whole-array bounds + WITHVALUES) when toggled', () => {
    // Preview mirrors the command the backend builds from the request the
    // thunk sends: whole-array bounds (`- +`) and the default WITHVALUES.
    renderComponent({ keyName: 'readings' })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      'ARGREP readings - + EXACT redis WITHVALUES LIMIT 1000000',
    )
  })

  it('reflects the selected criteria token in the preview', () => {
    renderComponent({
      keyName: 'readings',
      criteria: ArrayGrepCriteria.Glob,
      value: 'a*',
    })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      'ARGREP readings - + GLOB a* WITHVALUES LIMIT 1000000',
    )
  })

  it('quotes and escapes values with whitespace/quotes in the preview', () => {
    renderComponent({ keyName: 'k', value: 'a "b"' })

    fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

    expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
      'ARGREP k - + EXACT "a \\"b\\"" WITHVALUES LIMIT 1000000',
    )
  })

  it('calls onChangeValue when the value input changes', () => {
    const onChangeValue = jest.fn()
    renderComponent({ onChangeValue })

    fireEvent.change(screen.getByTestId(VALUE_TESTID), {
      target: { value: 'abc' },
    })

    expect(onChangeValue).toHaveBeenCalledWith('abc')
  })

  it('calls onChangeCriteria when a criteria option is picked', async () => {
    const onChangeCriteria = jest.fn()
    renderComponent({ onChangeCriteria })

    await userEvent.click(screen.getByTestId(CRITERIA_TESTID))
    await userEvent.click(await screen.findByText('Glob'))

    expect(onChangeCriteria).toHaveBeenCalledWith(ArrayGrepCriteria.Glob)
  })

  it('calls onRun when Run is clicked with a non-empty value', () => {
    const onRun = jest.fn()
    renderComponent({ onRun })

    fireEvent.click(screen.getByTestId(RUN_TESTID))

    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it('keeps Run enabled with an empty value — EXACT "" is a valid array search', () => {
    renderComponent({ value: '' })

    expect(screen.getByTestId(RUN_TESTID)).not.toBeDisabled()
  })

  it('disables Run while loading', () => {
    renderComponent({ loading: true })

    expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
  })

  it('disables Run and the value input when the disabled prop is set', () => {
    renderComponent({ disabled: true })

    expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
    expect(screen.getByTestId(VALUE_TESTID)).toBeDisabled()
  })

  it('runs the search when Enter is pressed in the value input', () => {
    const onRun = jest.fn()
    renderComponent({ onRun })

    fireEvent.keyDown(screen.getByTestId(VALUE_TESTID), { key: 'Enter' })

    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it.each([{ loading: true }, { disabled: true }])(
    'ignores Enter in the value input when %p',
    (props) => {
      const onRun = jest.fn()
      renderComponent({ onRun, ...props })

      fireEvent.keyDown(screen.getByTestId(VALUE_TESTID), { key: 'Enter' })

      expect(onRun).not.toHaveBeenCalled()
    },
  )
})
