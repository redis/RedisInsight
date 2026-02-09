import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { indexInfoFactory } from 'uiSrc/mocks/factories/vector-search/indexInfo.factory'

import { IndexInfo } from './IndexInfo'
import { IndexInfoProps } from './IndexInfo.types'

const renderComponent = (props?: Partial<IndexInfoProps>) => {
  const defaultProps: IndexInfoProps = {
    indexInfo: indexInfoFactory.build(),
    dataTestId: 'index-info',
  }

  return render(<IndexInfo {...defaultProps} {...props} />)
}

describe('IndexInfo', () => {
  it('should render all sections', () => {
    renderComponent()

    const indexInfo = screen.getByTestId('index-info')
    const definition = screen.getByTestId('index-info--definition')
    const options = screen.getByTestId('index-info--options')
    const summary = screen.getByTestId('index-info--summary')

    expect(indexInfo).toBeInTheDocument()
    expect(definition).toBeInTheDocument()
    expect(options).toBeInTheDocument()
    expect(summary).toBeInTheDocument()
  })

  it('should render loader when indexInfo is undefined', () => {
    renderComponent({ indexInfo: undefined })

    const loader = screen.getByTestId('index-info--loader')

    expect(loader).toBeInTheDocument()
  })

  it('should render table with columns and data', () => {
    const mockIndexInfo = indexInfoFactory.build()

    renderComponent({ indexInfo: mockIndexInfo })

    // Column headers
    const identifierCol = screen.getByText('Identifier')
    const attributeCol = screen.getByText('Attribute')
    const typeCol = screen.getByText('Type')
    const weightCol = screen.getByText('Weight')

    expect(identifierCol).toBeInTheDocument()
    expect(attributeCol).toBeInTheDocument()
    expect(typeCol).toBeInTheDocument()
    expect(weightCol).toBeInTheDocument()

    // First row data
    const firstAttr = mockIndexInfo.attributes[0]
    const identifierValue = screen.getByText(firstAttr.identifier)
    const attributeValue = screen.getByText(firstAttr.attribute)

    expect(identifierValue).toBeInTheDocument()
    expect(attributeValue).toBeInTheDocument()
  })

  it('should use custom dataTestId', () => {
    renderComponent({ dataTestId: 'custom-id' })

    const indexInfo = screen.getByTestId('custom-id')
    const definition = screen.getByTestId('custom-id--definition')

    expect(indexInfo).toBeInTheDocument()
    expect(definition).toBeInTheDocument()
  })
})
