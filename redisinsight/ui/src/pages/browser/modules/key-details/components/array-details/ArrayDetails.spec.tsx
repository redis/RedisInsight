import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { ArrayDetails, Props } from './ArrayDetails'
import { ARRAY_DETAILS_TAB_LABELS, ArrayDetailsTab } from './constants'

// Stub out the child components so this spec covers only the composition
// surface — the children have their own focused specs.
const stubChild = (testId: string) => () => {
  const ReactLib = require('react')
  return ReactLib.createElement('div', { 'data-testid': testId })
}

jest.mock('./array-details-table', () => ({
  ArrayDetailsTable: stubChild('array-details-table-mock'),
}))
jest.mock('./array-range-form', () => ({
  ArrayRangeForm: stubChild('array-range-form-mock'),
}))
jest.mock('./array-aggregate-form', () => ({
  ArrayAggregateForm: stubChild('array-aggregate-form-mock'),
}))
jest.mock('uiSrc/pages/browser/modules', () => ({
  KeyDetailsHeader: stubChild('key-details-header-mock'),
}))
jest.mock('./hooks', () => ({
  useArrayRangeQuery: () => ({
    start: '0',
    end: '9',
    showEmpty: true,
    setStart: jest.fn(),
    setEnd: jest.fn(),
    setShowEmpty: jest.fn(),
    runQuery: jest.fn(),
    resetQuery: jest.fn(),
    isArrayKeyReady: true,
    elements: [],
    loading: false,
  }),
  useArrayAggregateQuery: () => ({
    start: '0',
    end: '9',
    operation: 'SUM',
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
    result: null,
    hasResult: false,
  }),
}))

const mockedProps = mock<Props>()

describe('ArrayDetails', () => {
  it('renders the header, tabs, range form, and table on the View tab by default', () => {
    render(<ArrayDetails {...instance(mockedProps)} />)

    expect(screen.getByTestId('array-details')).toBeInTheDocument()
    expect(screen.getByTestId('key-details-header-mock')).toBeInTheDocument()
    expect(screen.getByTestId('array-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('array-range-form-mock')).toBeInTheDocument()
    expect(screen.getByTestId('array-details-table-mock')).toBeInTheDocument()
  })

  it('keeps every tab mounted and toggles visibility on tab change', () => {
    render(<ArrayDetails {...instance(mockedProps)} />)

    expect(screen.getByTestId('array-range-form-mock')).toBeVisible()
    expect(screen.getByTestId('array-search-placeholder')).not.toBeVisible()
    expect(screen.getByTestId('array-aggregate-form-mock')).not.toBeVisible()

    fireEvent.mouseDown(
      screen.getByText(ARRAY_DETAILS_TAB_LABELS[ArrayDetailsTab.Search]),
    )

    expect(screen.getByTestId('array-range-form-mock')).not.toBeVisible()
    expect(screen.getByTestId('array-search-placeholder')).toBeVisible()
    expect(screen.getByTestId('array-aggregate-form-mock')).not.toBeVisible()

    fireEvent.mouseDown(
      screen.getByText(ARRAY_DETAILS_TAB_LABELS[ArrayDetailsTab.Aggregate]),
    )

    expect(screen.getByTestId('array-range-form-mock')).not.toBeVisible()
    expect(screen.getByTestId('array-search-placeholder')).not.toBeVisible()
    expect(screen.getByTestId('array-aggregate-form-mock')).toBeVisible()
  })
})
