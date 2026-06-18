import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'

import AggregateTab from './AggregateTab'

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
  result: '',
}

const mockUseArrayAggregateQuery = jest.fn(() => baseHookResult)

jest.mock('../array-aggregate-form', () => ({
  ArrayAggregateForm: () => {
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

describe('AggregateTab', () => {
  beforeEach(() => {
    mockUseArrayAggregateQuery.mockReset()
    mockUseArrayAggregateQuery.mockReturnValue({ ...baseHookResult })
  })

  it('renders the form and an empty results area by default', () => {
    render(<AggregateTab keyProp={keyBuffer} />)

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

    render(<AggregateTab keyProp={keyBuffer} />)

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

    render(<AggregateTab keyProp={keyBuffer} />)

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
    })

    render(<AggregateTab keyProp={keyBuffer} />)

    const wrapper = screen.getByTestId(`${TEST_ID}-result-value`)
    const input = wrapper.querySelector('input') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe(bigResult)
    expect(screen.getByTestId(`${TEST_ID}-result-copy-btn`)).toBeInTheDocument()
    expect(screen.queryByTestId(`${TEST_ID}-loading`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`${TEST_ID}-error`)).not.toBeInTheDocument()
  })

  it('forwards the key buffer to the hook', () => {
    render(<AggregateTab keyProp={keyBuffer} />)

    expect(mockUseArrayAggregateQuery).toHaveBeenCalledWith(keyBuffer)
  })

  it('renders an empty form context when keyProp is null', () => {
    render(<AggregateTab keyProp={null} />)

    expect(screen.getByTestId('array-aggregate-form-mock')).toBeInTheDocument()
    expect(mockUseArrayAggregateQuery).toHaveBeenCalledWith(null)
  })
})
