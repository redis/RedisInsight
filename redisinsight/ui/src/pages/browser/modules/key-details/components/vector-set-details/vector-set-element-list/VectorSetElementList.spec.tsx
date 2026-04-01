import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import {
  mockKeyBuffer,
  mockVectorSetElements,
} from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { VectorSetElementList } from './VectorSetElementList'

jest.mock('uiSrc/slices/browser/vectorSet', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/vectorSet',
  ).initialState
  return {
    vectorSetSelector: jest.fn().mockReturnValue(defaultState),
    vectorSetDataSelector: jest.fn().mockReturnValue({
      ...defaultState.data,
      total: mockVectorSetElements.length,
      key: mockKeyBuffer,
      keyName: mockKeyBuffer,
      elements: mockVectorSetElements,
    }),
    fetchMoreVectorSetElements: () => jest.fn(),
  }
})

describe('VectorSetElementList', () => {
  it('should render', () => {
    expect(render(<VectorSetElementList />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<VectorSetElementList />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(mockVectorSetElements.length)
  })

  it('should render vector-set-details test id', () => {
    render(<VectorSetElementList />)
    expect(screen.getByTestId('vector-set-details')).toBeInTheDocument()
  })
})
