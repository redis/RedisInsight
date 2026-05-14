import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { deleteVectorSetElements } from 'uiSrc/slices/browser/vectorSet'
import { VectorSetElementList } from './VectorSetElementList'

jest.mock('uiSrc/slices/browser/vectorSet', () => {
  const actual = jest.requireActual('uiSrc/slices/browser/vectorSet')
  const { faker } = jest.requireActual('@faker-js/faker')
  const { mockKeyBuffer, vectorSetElementFactory } = jest.requireActual(
    'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory',
  )
  faker.seed(8165)
  const elements = vectorSetElementFactory.buildList(3)
  return {
    ...actual,
    vectorSetSelector: jest.fn().mockReturnValue(actual.initialState),
    vectorSetDataSelector: jest.fn().mockReturnValue({
      ...actual.initialState.data,
      total: elements.length,
      isPaginationSupported: true,
      key: mockKeyBuffer,
      keyName: mockKeyBuffer,
      elements,
    }),
    fetchMoreVectorSetElements: jest.fn(() => jest.fn()),
    deleteVectorSetElements: jest.fn(() => jest.fn()),
  }
})

describe('VectorSetElementList', () => {
  const defaultProps = {
    onRemoveKey: jest.fn(),
    onViewElement: jest.fn(),
    onSearchByElement: jest.fn(),
  }

  beforeEach(() => {
    jest.mocked(deleteVectorSetElements).mockClear()
    defaultProps.onViewElement.mockClear()
    defaultProps.onSearchByElement.mockClear()
  })

  it('should render', () => {
    expect(render(<VectorSetElementList {...defaultProps} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<VectorSetElementList {...defaultProps} />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('should render vector-set-details test id', () => {
    render(<VectorSetElementList {...defaultProps} />)
    expect(screen.getByTestId('vector-set-details')).toBeInTheDocument()
  })

  it('should render a remove control for each element row', () => {
    render(<VectorSetElementList {...defaultProps} />)
    expect(screen.getAllByLabelText(/remove field/i)).toHaveLength(3)
  })

  it('should render a view button for each element row', () => {
    render(<VectorSetElementList {...defaultProps} />)
    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(3)
  })

  it('should call onViewElement when view button is clicked', () => {
    render(<VectorSetElementList {...defaultProps} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'View' })[0])
    expect(defaultProps.onViewElement).toHaveBeenCalledTimes(1)
  })

  it('should render a "Find similar elements" button for each element row', () => {
    render(<VectorSetElementList {...defaultProps} />)
    expect(
      screen.getAllByRole('button', { name: 'Find similar elements' }),
    ).toHaveLength(3)
  })

  it('should call onSearchByElement when the search-similar button is clicked', () => {
    render(<VectorSetElementList {...defaultProps} />)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Find similar elements' })[0],
    )
    expect(defaultProps.onSearchByElement).toHaveBeenCalledTimes(1)
  })

  it('should open delete confirmation after clicking remove on a row', () => {
    render(<VectorSetElementList {...defaultProps} />)
    fireEvent.click(screen.getAllByLabelText(/remove field/i)[0])
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('should call deleteVectorSetElements when delete is confirmed', () => {
    render(<VectorSetElementList {...defaultProps} />)
    fireEvent.click(screen.getAllByLabelText(/remove field/i)[0])
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(deleteVectorSetElements).toHaveBeenCalledTimes(1)
  })
})
