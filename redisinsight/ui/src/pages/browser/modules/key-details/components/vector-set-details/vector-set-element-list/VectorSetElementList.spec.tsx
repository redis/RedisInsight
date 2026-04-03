import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { VectorSetElementList } from './VectorSetElementList'

jest.mock('uiSrc/slices/browser/vectorSet', () => {
  const { initialState } = jest.requireActual('uiSrc/slices/browser/vectorSet')
  const { mockKeyBuffer, vectorSetElementFactory } = jest.requireActual(
    'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory',
  )
  const elements = vectorSetElementFactory.buildList(3)
  return {
    vectorSetSelector: jest.fn().mockReturnValue(initialState),
    vectorSetDataSelector: jest.fn().mockReturnValue({
      ...initialState.data,
      total: elements.length,
      isPaginationSupported: true,
      key: mockKeyBuffer,
      keyName: mockKeyBuffer,
      elements,
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
    expect(rows).toHaveLength(3)
  })

  it('should render vector-set-details test id', () => {
    render(<VectorSetElementList />)
    expect(screen.getByTestId('vector-set-details')).toBeInTheDocument()
  })
})
