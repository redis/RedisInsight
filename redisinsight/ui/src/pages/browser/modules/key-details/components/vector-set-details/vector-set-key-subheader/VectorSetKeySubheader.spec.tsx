import { faker } from '@faker-js/faker'
import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { vectorSetElementFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { vectorSetDataSelector } from 'uiSrc/slices/browser/vectorSet'
import { VectorSetKeySubheader } from './VectorSetKeySubheader'

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

describe('VectorSetKeySubheader', () => {
  const getMockedSelector = () => vectorSetDataSelector as jest.Mock

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

    render(<VectorSetKeySubheader />)

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

    render(<VectorSetKeySubheader />)

    expect(screen.getByTestId('vector-set-preview-summary')).toHaveTextContent(
      `${elements.length} out of ${total}`,
    )
  })
})
