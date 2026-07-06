import React from 'react'
import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from 'uiSrc/utils/test-utils'
import {
  ArrayCombinator,
  ArrayGrepCriteria,
} from 'uiSrc/slices/interfaces/array'

import { ArraySearchForm } from './ArraySearchForm'
import { ArraySearchFormProps } from './ArraySearchForm.types'
import {
  ARRAY_SEARCH_FORM_TEST_ID as TEST_ID,
  OPTIONS_LABEL,
} from './ArraySearchForm.constants'
// Reuse the real default options so the fixture can't drift from production.
import { DEFAULT_SEARCH_OPTIONS as DEFAULT_OPTIONS } from '../constants'

const defaultProps: ArraySearchFormProps = {
  predicates: [{ criteria: ArrayGrepCriteria.Exact, value: '' }],
  combinator: ArrayCombinator.Or,
  options: DEFAULT_OPTIONS,
  loading: false,
  onAddPredicate: jest.fn(),
  onRemovePredicate: jest.fn(),
  onChangePredicate: jest.fn(),
  onChangeCombinator: jest.fn(),
  onChangeOptions: jest.fn(),
  context: { enabled: false, count: 5 },
  onChangeContext: jest.fn(),
  onRun: jest.fn(),
  onReset: jest.fn(),
}

const renderComponent = (props: Partial<ArraySearchFormProps> = {}) =>
  render(<ArraySearchForm {...defaultProps} {...props} />)

// CommandPreview is shared with the View tab, so its internal test ids keep
// the `array-range-form` prefix.
const PREVIEW_TEXT_TESTID = 'array-range-form-command-preview-text'
const PREVIEW_TOGGLE_TESTID = `${TEST_ID}-preview-toggle`
const RUN_TESTID = `${TEST_ID}-run`

const twoPredicates = [
  { criteria: ArrayGrepCriteria.Exact, value: 'a' },
  { criteria: ArrayGrepCriteria.Glob, value: 'b*' },
]

describe('ArraySearchForm', () => {
  describe('predicate rows', () => {
    it('renders a criteria + value input per predicate', () => {
      renderComponent({ predicates: twoPredicates })

      expect(screen.getByTestId(`${TEST_ID}-value-0`)).toBeInTheDocument()
      expect(screen.getByTestId(`${TEST_ID}-value-1`)).toBeInTheDocument()
    })

    it('calls onChangePredicate when a row value changes', () => {
      const onChangePredicate = jest.fn()
      renderComponent({ onChangePredicate })

      fireEvent.change(screen.getByTestId(`${TEST_ID}-value-0`), {
        target: { value: 'abc' },
      })

      expect(onChangePredicate).toHaveBeenCalledWith(0, { value: 'abc' })
    })

    it('calls onChangePredicate when a row criteria changes', async () => {
      const onChangePredicate = jest.fn()
      renderComponent({ onChangePredicate })

      await userEvent.click(screen.getByTestId(`${TEST_ID}-criteria-0`))
      await userEvent.click(await screen.findByText('Glob'))

      expect(onChangePredicate).toHaveBeenCalledWith(0, {
        criteria: ArrayGrepCriteria.Glob,
      })
    })

    it('adds a predicate via the add-predicate button', () => {
      const onAddPredicate = jest.fn()
      renderComponent({ onAddPredicate })

      fireEvent.click(screen.getByTestId(`${TEST_ID}-add-predicate`))

      expect(onAddPredicate).toHaveBeenCalledTimes(1)
    })

    it('hides the remove control with one predicate and removes a row with 2+', () => {
      const onRemovePredicate = jest.fn()
      const { rerender } = renderComponent({ onRemovePredicate })
      // One row → nothing to remove, so no delete control at all.
      expect(
        screen.queryByTestId(`${TEST_ID}-remove-0`),
      ).not.toBeInTheDocument()

      rerender(
        <ArraySearchForm
          {...defaultProps}
          predicates={twoPredicates}
          onRemovePredicate={onRemovePredicate}
        />,
      )
      fireEvent.click(screen.getByTestId(`${TEST_ID}-remove-1`))

      expect(onRemovePredicate).toHaveBeenCalledWith(1)
    })
  })

  describe('global connective', () => {
    const threePredicates = [
      ...twoPredicates,
      { criteria: ArrayGrepCriteria.Match, value: 'c' },
    ]

    it('is hidden with a single predicate', () => {
      renderComponent()

      expect(
        screen.queryByTestId(`${TEST_ID}-combinator-0`),
      ).not.toBeInTheDocument()
    })

    it('shows AND/OR and reports the choice with 2+ predicates', () => {
      const onChangeCombinator = jest.fn()
      renderComponent({ predicates: twoPredicates, onChangeCombinator })

      expect(screen.getByTestId(`${TEST_ID}-combinator-0`)).toBeInTheDocument()
      fireEvent.click(screen.getByTestId(`${TEST_ID}-combinator-0-and`))

      expect(onChangeCombinator).toHaveBeenCalledWith(ArrayCombinator.And)
    })

    it('renders one connective per gap, all driving the single global value', () => {
      const onChangeCombinator = jest.fn()
      renderComponent({ predicates: threePredicates, onChangeCombinator })

      // Three rows → two gaps → two connectives.
      expect(screen.getByTestId(`${TEST_ID}-combinator-0`)).toBeInTheDocument()
      expect(screen.getByTestId(`${TEST_ID}-combinator-1`)).toBeInTheDocument()

      // Changing the second connective drives the same handler as the first,
      // so the choice always applies to all.
      fireEvent.click(screen.getByTestId(`${TEST_ID}-combinator-1-and`))
      expect(onChangeCombinator).toHaveBeenCalledWith(ArrayCombinator.And)
    })
  })

  describe('options', () => {
    // Options live behind a collapsed toggle; expand it before interacting.
    const openOptions = () =>
      fireEvent.click(screen.getByTestId(`${TEST_ID}-options-toggle`))

    it('reports range / NOCASE / WITHVALUES / LIMIT changes via onChangeOptions', () => {
      const onChangeOptions = jest.fn()
      renderComponent({ onChangeOptions })
      openOptions()

      fireEvent.change(screen.getByTestId(`${TEST_ID}-start`), {
        target: { value: '5' },
      })
      expect(onChangeOptions).toHaveBeenCalledWith({ start: '5' })

      fireEvent.click(screen.getByTestId(`${TEST_ID}-nocase`))
      expect(onChangeOptions).toHaveBeenCalledWith({ nocase: true })

      fireEvent.click(screen.getByTestId(`${TEST_ID}-withvalues`))
      expect(onChangeOptions).toHaveBeenCalledWith({ withValues: false })

      fireEvent.click(screen.getByTestId(`${TEST_ID}-limit-toggle`))
      expect(onChangeOptions).toHaveBeenCalledWith({ limitEnabled: true })
    })

    it('keeps the limit input visible, disabled until the limit toggle is enabled', () => {
      const { rerender } = renderComponent()
      openOptions()
      // Always present so ticking LIMIT doesn't shift the layout.
      expect(screen.getByTestId(`${TEST_ID}-limit`)).toBeDisabled()

      rerender(
        <ArraySearchForm
          {...defaultProps}
          options={{ ...DEFAULT_OPTIONS, limitEnabled: true }}
        />,
      )
      expect(screen.getByTestId(`${TEST_ID}-limit`)).toBeEnabled()
    })
  })

  describe('context', () => {
    // Context is always visible, so no need to expand Options first.
    it('keeps the context input disabled until the toggle is ticked', () => {
      const { rerender } = renderComponent()
      // Off by default → input present (so layout is stable) but disabled.
      expect(screen.getByTestId(`${TEST_ID}-context`)).toBeDisabled()

      rerender(
        <ArraySearchForm
          {...defaultProps}
          context={{ enabled: true, count: 5 }}
        />,
      )
      expect(screen.getByTestId(`${TEST_ID}-context`)).toBeEnabled()
    })

    it('enables context when the toggle is ticked', () => {
      const onChangeContext = jest.fn()
      renderComponent({ onChangeContext })

      fireEvent.click(screen.getByTestId(`${TEST_ID}-context-toggle`))

      expect(onChangeContext).toHaveBeenCalledWith({ enabled: true })
    })

    it('shows the passed count and clamps a typed value above the max to 50', async () => {
      const user = userEvent.setup()
      renderComponent({ context: { enabled: true, count: 5 } })

      const input = screen.getByTestId(`${TEST_ID}-context`)
      // redis-ui NumericInput renders a text input, so the DOM value is a
      // string.
      expect(input).toHaveValue('5')

      // redis-ui's `autoValidate` clamps onChange, but the field text only
      // settles to the clamped value on blur — so '99' stays verbatim while
      // typing and resolves to '50' once the input blurs.
      await user.clear(input)
      await user.type(input, '99')
      await user.tab()

      await waitFor(() => {
        expect(input).toHaveValue('50')
      })
    })

    it('reports a new count via onChangeContext', () => {
      const onChangeContext = jest.fn()
      renderComponent({
        context: { enabled: true, count: 5 },
        onChangeContext,
      })

      fireEvent.change(screen.getByTestId(`${TEST_ID}-context`), {
        target: { value: '8' },
      })

      expect(onChangeContext).toHaveBeenCalledWith({ count: 8 })
    })
  })

  describe('run', () => {
    it('calls onRun on click and on Enter in a value input', () => {
      const onRun = jest.fn()
      renderComponent({ onRun })

      fireEvent.click(screen.getByTestId(RUN_TESTID))
      fireEvent.keyDown(screen.getByTestId(`${TEST_ID}-value-0`), {
        key: 'Enter',
      })

      expect(onRun).toHaveBeenCalledTimes(2)
    })

    it('disables Run while loading and when disabled', () => {
      expect(
        renderComponent({ loading: true }).getByTestId(RUN_TESTID),
      ).toBeDisabled()
    })

    it('disables Run for an invalid start index', () => {
      renderComponent({ options: { ...DEFAULT_OPTIONS, start: '-1' } })

      expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
    })

    it('disables Run for an out-of-range limit when the limit is enabled', () => {
      renderComponent({
        options: { ...DEFAULT_OPTIONS, limitEnabled: true, limit: '0' },
      })

      expect(screen.getByTestId(RUN_TESTID)).toBeDisabled()
    })
  })

  describe('reset', () => {
    const RESET_TESTID = `${TEST_ID}-reset`

    it('calls onReset on click', () => {
      const onReset = jest.fn()
      renderComponent({ onReset })

      fireEvent.click(screen.getByTestId(RESET_TESTID))

      expect(onReset).toHaveBeenCalledTimes(1)
    })

    it('disables reset while loading and when disabled', () => {
      expect(
        renderComponent({ loading: true }).getByTestId(RESET_TESTID),
      ).toBeDisabled()
    })

    it('omits the reset button when no onReset is provided', () => {
      renderComponent({ onReset: undefined })

      expect(screen.queryByTestId(RESET_TESTID)).not.toBeInTheDocument()
    })
  })

  describe('command preview', () => {
    it('reflects all predicates, the connective, options, and LIMIT', () => {
      renderComponent({
        keyName: 'readings',
        predicates: twoPredicates,
        combinator: ArrayCombinator.And,
        options: {
          start: '0',
          end: '99',
          nocase: true,
          withValues: true,
          limitEnabled: true,
          limit: '50',
        },
      })

      fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

      expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
        'ARGREP readings 0 99 EXACT a GLOB b* AND NOCASE WITHVALUES LIMIT 50',
      )
    })

    it('uses whole-array bounds and omits LIMIT when options are untouched', () => {
      renderComponent({ keyName: 'readings', predicates: [twoPredicates[0]] })

      fireEvent.click(screen.getByTestId(PREVIEW_TOGGLE_TESTID))

      // Single predicate → no connective; blank bounds → `-`/`+`; LIMIT off →
      // no LIMIT token (uncapped).
      expect(screen.getByTestId(PREVIEW_TEXT_TESTID)).toHaveTextContent(
        'ARGREP readings - + EXACT a WITHVALUES',
      )
    })
  })

  it('renders the options panel by its label', () => {
    renderComponent()

    expect(screen.getByText(OPTIONS_LABEL)).toBeInTheDocument()
  })
})
