import { faker } from '@faker-js/faker'
import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { vectorSetElementFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { vectorSetDataSelector } from 'uiSrc/slices/browser/vectorSet'
import { VectorSetKeySubheader } from './VectorSetKeySubheader'
import { Props } from './VectorSetKeySubheader.types'

jest.mock('uiSrc/slices/browser/vectorSet', () => ({
  vectorSetDataSelector: jest.fn(),
}))

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

const defaultProps: Props = {
  openAddItemPanel: jest.fn(),
}

describe('VectorSetKeySubheader', () => {
  const getMockedSelector = () => vectorSetDataSelector as jest.Mock

  const renderComponent = (propsOverride?: Partial<Props>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<VectorSetKeySubheader {...props} />)
  }

  beforeEach(() => {
    getMockedSelector().mockReset()
  })

  it('does not render preview summary when isPaginationSupported is true', () => {
    const elements = vectorSetElementFactory.buildList(
      faker.number.int({ min: 1, max: 6 }),
    )
    getMockedSelector().mockReturnValue({
      total: faker.number.int({ min: elements.length, max: 50 }),
      elements,
      isPaginationSupported: true,
    })

    renderComponent()

    expect(
      screen.queryByTestId('vector-set-preview-summary'),
    ).not.toBeInTheDocument()
  })

  it('does not render preview summary when isPaginationSupported is undefined', () => {
    const elements = vectorSetElementFactory.buildList(3)
    getMockedSelector().mockReturnValue({
      total: 10,
      elements,
    })

    renderComponent()

    expect(
      screen.queryByTestId('vector-set-preview-summary'),
    ).not.toBeInTheDocument()
  })

  it('renders preview summary when isPaginationSupported is false', () => {
    const elements = vectorSetElementFactory.buildList(
      faker.number.int({ min: 1, max: 8 }),
    )
    const total = faker.number.int({ min: elements.length + 1, max: 500 })
    getMockedSelector().mockReturnValue({
      total,
      elements,
      isPaginationSupported: false,
    })

    renderComponent()

    expect(screen.getByTestId('vector-set-preview-summary')).toHaveTextContent(
      `${elements.length} out of ${total}`,
    )
  })

  it('renders the Add Elements button', () => {
    getMockedSelector().mockReturnValue({
      total: 5,
      elements: vectorSetElementFactory.buildList(3),
      isPaginationSupported: true,
    })

    renderComponent()

    expect(screen.getByTestId('add-key-value-items-btn')).toBeInTheDocument()
  })

  it('calls openAddItemPanel when Add Elements button is clicked', () => {
    const openAddItemPanel = jest.fn()
    getMockedSelector().mockReturnValue({
      total: 5,
      elements: vectorSetElementFactory.buildList(3),
      isPaginationSupported: true,
    })

    renderComponent({ openAddItemPanel })

    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))
    expect(openAddItemPanel).toHaveBeenCalledTimes(1)
  })
})
