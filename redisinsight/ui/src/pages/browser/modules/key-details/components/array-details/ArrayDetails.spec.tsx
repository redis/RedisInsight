import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import { ArrayDetails, Props } from './ArrayDetails'

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
}))

const mockedProps = mock<Props>()

describe('ArrayDetails', () => {
  it('renders the header, range form, and table', () => {
    render(<ArrayDetails {...instance(mockedProps)} />)

    expect(screen.getByTestId('array-details')).toBeInTheDocument()
    expect(screen.getByTestId('key-details-header-mock')).toBeInTheDocument()
    expect(screen.getByTestId('array-range-form-mock')).toBeInTheDocument()
    expect(screen.getByTestId('array-details-table-mock')).toBeInTheDocument()
  })
})
