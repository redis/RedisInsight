import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { VectorSetKeySubheader } from './VectorSetKeySubheader'
import { Props } from './VectorSetKeySubheader.types'

jest.mock(
  'uiSrc/pages/browser/modules/key-details-header/components/key-details-header-formatter',
  () => {
    const React = require('react')
    return {
      KeyDetailsHeaderFormatter: () =>
        React.createElement('div', {
          'data-testid': 'key-details-header-formatter-mock',
        }),
    }
  },
)

const PREVIEW_TEST_ID = 'vector-set-preview-summary'
const ADD_BUTTON_TEST_ID = 'add-key-value-items-btn'
const CLEAR_BUTTON_TEST_ID = 'similarity-search-clear-results-btn'

const defaultProps: Props = {
  openAddItemPanel: jest.fn(),
  showPreview: false,
  previewCount: 0,
  total: 0,
  hasSimilarityResults: false,
  onClearResults: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<Props>) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<VectorSetKeySubheader {...props} />)
}

describe('VectorSetKeySubheader', () => {
  it('does not render preview summary when showPreview is false', () => {
    renderComponent({ showPreview: false, previewCount: 5, total: 50 })

    expect(screen.queryByTestId(PREVIEW_TEST_ID)).not.toBeInTheDocument()
  })

  it('renders "Previewing X out of Y" when showPreview is true', () => {
    renderComponent({ showPreview: true, previewCount: 7, total: 42 })

    expect(screen.getByTestId(PREVIEW_TEST_ID)).toHaveTextContent('7 out of 42')
  })

  it('renders the Add Elements button when hasSimilarityResults is false', () => {
    renderComponent({ hasSimilarityResults: false })

    expect(screen.getByTestId(ADD_BUTTON_TEST_ID)).toBeInTheDocument()
    expect(screen.queryByTestId(CLEAR_BUTTON_TEST_ID)).not.toBeInTheDocument()
  })

  it('calls openAddItemPanel when Add Elements button is clicked', () => {
    const openAddItemPanel = jest.fn()

    renderComponent({ openAddItemPanel })

    fireEvent.click(screen.getByTestId(ADD_BUTTON_TEST_ID))
    expect(openAddItemPanel).toHaveBeenCalledTimes(1)
  })

  it('swaps the Add button for the Clear results button when hasSimilarityResults is true', () => {
    renderComponent({ hasSimilarityResults: true })

    expect(screen.getByTestId(CLEAR_BUTTON_TEST_ID)).toBeInTheDocument()
    expect(screen.queryByTestId(ADD_BUTTON_TEST_ID)).not.toBeInTheDocument()
  })

  it('calls onClearResults when the Clear results button is clicked', () => {
    const onClearResults = jest.fn()

    renderComponent({ hasSimilarityResults: true, onClearResults })

    fireEvent.click(screen.getByTestId(CLEAR_BUTTON_TEST_ID))
    expect(onClearResults).toHaveBeenCalledTimes(1)
  })
})
