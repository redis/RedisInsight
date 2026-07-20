import React from 'react'
import { cloneDeep } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'

import AggregateTab from './AggregateTab'
import { AggregateTabProps } from './AggregateTab.types'

const baseHookResult = {
  start: '0',
  end: '9',
  operation: ArrayAggregateOperation.Sum,
  value: '',
  setStart: jest.fn(),
  setEnd: jest.fn(),
  setOperation: jest.fn(),
  setValue: jest.fn(),
  runQuery: jest.fn(),
  resetQuery: jest.fn(),
  isArrayKeyReady: true,
  loading: false,
  error: '',
  result: null as string | null,
  hasResult: false,
}

const mockUseArrayAggregateQuery = jest.fn(
  (..._args: unknown[]) => baseHookResult,
)

const mockAggregateFormProps = jest.fn()
jest.mock('../array-aggregate-form', () => ({
  ArrayAggregateForm: (props: { disabled?: boolean }) => {
    mockAggregateFormProps(props)
    const ReactLib = require('react')
    return ReactLib.createElement('div', {
      'data-testid': 'array-aggregate-form-mock',
    })
  },
}))
jest.mock('../hooks', () => ({
  useArrayAggregateQuery: (...args: unknown[]) =>
    mockUseArrayAggregateQuery(...args),
}))

const TEST_ID = 'array-aggregate-tab'
const keyBuffer = stringToBuffer('numbers')

const defaultProps: AggregateTabProps = {
  keyProp: keyBuffer,
}

const renderComponent = (
  propsOverride: Partial<AggregateTabProps> = {},
  store?: ReturnType<typeof mockStore>,
) =>
  render(
    <AggregateTab {...defaultProps} {...propsOverride} />,
    store ? { store } : undefined,
  )

describe('AggregateTab', () => {
  beforeEach(() => {
    mockUseArrayAggregateQuery.mockReset()
    mockUseArrayAggregateQuery.mockReturnValue({ ...baseHookResult })
    mockAggregateFormProps.mockClear()
  })

  it('disables the form while the edit/refresh lock is active', () => {
    // isRefreshDisabled is true while an inline edit is open or its ARSET is
    // in flight; running an AROP then would be aborted+cleared by the edit's
    // post-write cleanup, so the form must be disabled.
    const state = cloneDeep(initialStateDefault)
    state.browser.keys.selectedKey.isRefreshDisabled = true
    renderComponent({}, mockStore(state))

    expect(mockAggregateFormProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ disabled: true }),
    )
  })

  it('enables the form when the lock is clear and the key is ready', () => {
    renderComponent()

    expect(mockAggregateFormProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ disabled: false }),
    )
  })

  it('renders the form and an empty results area by default', () => {
    renderComponent()

    expect(screen.getByTestId('array-aggregate-form-mock')).toBeInTheDocument()
    expect(screen.getByTestId(TEST_ID)).toBeInTheDocument()
    expect(screen.queryByTestId(`${TEST_ID}-loading`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`${TEST_ID}-error`)).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(`${TEST_ID}-result-value`),
    ).not.toBeInTheDocument()
  })

  it('shows the loader while the query is in flight', () => {
    mockUseArrayAggregateQuery.mockReturnValue({
      ...baseHookResult,
      loading: true,
    })

    renderComponent()

    expect(screen.getByTestId(`${TEST_ID}-loading`)).toBeInTheDocument()
    expect(
      screen.queryByTestId(`${TEST_ID}-result-value`),
    ).not.toBeInTheDocument()
  })

  it('shows the error text when the hook surfaces an error', () => {
    mockUseArrayAggregateQuery.mockReturnValue({
      ...baseHookResult,
      error: 'Range too large',
    })

    renderComponent()

    expect(screen.getByTestId(`${TEST_ID}-error`)).toHaveTextContent(
      'Range too large',
    )
    expect(
      screen.queryByTestId(`${TEST_ID}-result-value`),
    ).not.toBeInTheDocument()
  })

  it('renders the result field with the raw string and copy button on success', () => {
    // A 20-digit value would lose precision via Number() — assert the tab
    // surfaces the exact bytes returned by the hook (BigInt safety).
    const bigResult = '18446744073709551614'
    mockUseArrayAggregateQuery.mockReturnValue({
      ...baseHookResult,
      result: bigResult,
      hasResult: true,
    })

    renderComponent()

    const wrapper = screen.getByTestId(`${TEST_ID}-result-value`)
    const input = wrapper.querySelector('input') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe(bigResult)
    expect(screen.getByTestId(`${TEST_ID}-result-copy-btn`)).toBeInTheDocument()
    expect(screen.queryByTestId(`${TEST_ID}-loading`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`${TEST_ID}-error`)).not.toBeInTheDocument()
  })

  it('renders the nil placeholder without copy when AROP returned null', () => {
    // hasResult=true with result=null signals AROP completed with a RESP
    // nil reply (e.g. SUM over a range with no numeric values). The panel
    // surfaces "(nil)" so the user can tell the query ran, and hides the
    // copy button because there are no bytes to copy.
    mockUseArrayAggregateQuery.mockReturnValue({
      ...baseHookResult,
      result: null,
      hasResult: true,
    })

    renderComponent()

    const wrapper = screen.getByTestId(`${TEST_ID}-result-value`)
    const input = wrapper.querySelector('input') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe('(nil)')
    expect(
      screen.queryByTestId(`${TEST_ID}-result-copy-btn`),
    ).not.toBeInTheDocument()
  })

  it('keeps the existing result visible (no loader) while a refresh recompute is in flight', () => {
    // Header-refresh replay dispatches AROP with resetData=false, so the
    // slice keeps the prior result/hasResult while loading. The panel must
    // hold the value on screen rather than flashing the loader.
    mockUseArrayAggregateQuery.mockReturnValue({
      ...baseHookResult,
      loading: true,
      result: '42',
      hasResult: true,
    })

    renderComponent()

    expect(screen.queryByTestId(`${TEST_ID}-loading`)).not.toBeInTheDocument()
    const wrapper = screen.getByTestId(`${TEST_ID}-result-value`)
    const input = wrapper.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('42')
  })

  it('suppresses stale slice state while the selected key is not ready', () => {
    mockUseArrayAggregateQuery.mockReturnValue({
      ...baseHookResult,
      isArrayKeyReady: false,
      loading: true,
      error: 'stale error from the prior key',
      result: '999',
      hasResult: true,
    })

    renderComponent()

    expect(screen.queryByTestId(`${TEST_ID}-loading`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`${TEST_ID}-error`)).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(`${TEST_ID}-result-value`),
    ).not.toBeInTheDocument()
  })

  it('forwards the key buffer to the hook', () => {
    renderComponent()

    expect(mockUseArrayAggregateQuery).toHaveBeenCalledWith(keyBuffer)
  })

  it('renders an empty form context when keyProp is null', () => {
    renderComponent({ keyProp: null })

    expect(screen.getByTestId('array-aggregate-form-mock')).toBeInTheDocument()
    expect(mockUseArrayAggregateQuery).toHaveBeenCalledWith(null)
  })
})
