import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { vectorSetSimilaritySearchSelector } from 'uiSrc/slices/browser/vectorSet'

import { Props, VectorSetDetails } from './VectorSetDetails'

const mockedVectorSetSimilaritySearchSelector = jest.mocked(
  vectorSetSimilaritySearchSelector,
)

const defaultProps = {
  onRemoveKey: jest.fn(),
  onOpenAddItemPanel: jest.fn(),
  onCloseAddItemPanel: jest.fn(),
} as unknown as Props

jest.mock('uiSrc/slices/browser/vectorSet', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/vectorSet',
  ).initialState
  return {
    ...jest.requireActual('uiSrc/slices/browser/vectorSet'),
    vectorSetSelector: jest.fn().mockReturnValue(defaultState),
    vectorSetDataSelector: jest.fn().mockReturnValue(defaultState.data),
    addVectorSetElementsStateSelector: jest
      .fn()
      .mockReturnValue(defaultState.adding),
    vectorSetSimilaritySearchSelector: jest
      .fn()
      .mockReturnValue(defaultState.similaritySearch),
    vectorSetSimilaritySearchPreviewSelector: jest
      .fn()
      .mockReturnValue(defaultState.similaritySearchPreview),
    fetchMoreVectorSetElements: () => jest.fn(),
    fetchVectorSetElements: () => jest.fn(),
    addVectorSetElements: () => jest.fn(),
    fetchVectorSetSimilaritySearch: () => jest.fn(),
    fetchVectorSetSimilaritySearchPreview: () => jest.fn(),
  }
})

const setSimilaritySearchData = (data?: {
  keyName: any
  elements: { name: any; score: number }[]
}) => {
  mockedVectorSetSimilaritySearchSelector.mockReturnValue({
    loading: false,
    error: '',
    data,
  })
}

describe('VectorSetDetails', () => {
  beforeEach(() => {
    setSimilaritySearchData(undefined)
  })

  it('should render', () => {
    expect(render(<VectorSetDetails {...defaultProps} />)).toBeTruthy()
  })

  it('should render key details header', () => {
    render(<VectorSetDetails {...defaultProps} />)
    expect(screen.getByTestId('key-details-header')).toBeInTheDocument()
  })

  it('should render subheader with format selector', () => {
    render(<VectorSetDetails {...defaultProps} />)
    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
  })

  it('should render add elements button', () => {
    render(<VectorSetDetails {...defaultProps} />)
    expect(screen.getByTestId('add-key-value-items-btn')).toBeInTheDocument()
  })

  it('should open add element panel when add button is clicked', () => {
    render(<VectorSetDetails {...defaultProps} />)

    expect(screen.queryByTestId('save-elements-btn')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))

    expect(screen.getByTestId('save-elements-btn')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-elements-btn')).toBeInTheDocument()
  })

  it('should close add element panel when cancel is clicked', () => {
    render(<VectorSetDetails {...defaultProps} />)

    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))
    expect(screen.getByTestId('save-elements-btn')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('cancel-elements-btn'))
    expect(screen.queryByTestId('save-elements-btn')).not.toBeInTheDocument()
  })

  it('shows the regular elements list when no similarity search has run', () => {
    render(<VectorSetDetails {...defaultProps} />)
    expect(screen.getByTestId('vector-set-details')).toBeInTheDocument()
    expect(
      screen.queryByTestId('vector-set-similarity-results'),
    ).not.toBeInTheDocument()
  })

  it('replaces the elements list with the similarity results table once a search succeeds', () => {
    setSimilaritySearchData({
      keyName: stringToBuffer('mykey'),
      elements: [
        { name: stringToBuffer('alpha'), score: 0.9 },
        { name: stringToBuffer('beta'), score: 0.5 },
      ],
    })

    render(<VectorSetDetails {...defaultProps} />)

    expect(
      screen.getByTestId('vector-set-similarity-results'),
    ).toBeInTheDocument()
    expect(screen.getByText('90.00 %')).toBeInTheDocument()
    expect(screen.getByText('50.00 %')).toBeInTheDocument()
  })
})
