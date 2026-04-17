import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { Props, VectorSetDetails } from './VectorSetDetails'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/vectorSet', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/vectorSet',
  ).initialState
  return {
    vectorSetSelector: jest.fn().mockReturnValue(defaultState),
    vectorSetDataSelector: jest.fn().mockReturnValue(defaultState.data),
    fetchMoreVectorSetElements: () => jest.fn(),
  }
})

describe('VectorSetDetails', () => {
  it('should render', () => {
    expect(render(<VectorSetDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render key details header', () => {
    render(<VectorSetDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('key-details-header')).toBeInTheDocument()
  })

  it('should render subheader with format selector', () => {
    render(<VectorSetDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
  })
})
