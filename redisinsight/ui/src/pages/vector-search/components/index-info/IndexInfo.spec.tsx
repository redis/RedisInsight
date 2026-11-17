import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  indexInfoFactory,
  indexAttributeFactory,
} from 'uiSrc/mocks/factories/vector-search/indexInfo.factory'

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

  it('should render table with base columns and data', () => {
    const mockIndexInfo = indexInfoFactory.build({
      attributes: [
        indexAttributeFactory.build({
          type: FieldTypes.TEXT,
          weight: '1',
        }),
      ],
    })

    renderComponent({ indexInfo: mockIndexInfo })

    expect(screen.getByText('Identifier')).toBeInTheDocument()
    expect(screen.getByText('Attribute')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Weight')).toBeInTheDocument()
    expect(screen.queryByText('WITHSUFFIXTRIE')).not.toBeInTheDocument()

    const firstAttr = mockIndexInfo.attributes[0]
    expect(screen.getByText(firstAttr.identifier)).toBeInTheDocument()
    expect(screen.getByText(firstAttr.attribute)).toBeInTheDocument()
  })

  it('should omit Weight column when no attributes have weight', () => {
    const mockIndexInfo = indexInfoFactory.build({
      attributes: [
        indexAttributeFactory.build(
          { type: FieldTypes.TAG },
          { transient: { includeWeight: false } },
        ),
      ],
    })

    renderComponent({ indexInfo: mockIndexInfo })

    expect(screen.queryByText('Weight')).not.toBeInTheDocument()
  })

  it('should render boolean flag columns only when present', () => {
    const mockIndexInfo = indexInfoFactory.build({
      attributes: [
        indexAttributeFactory.build({
          type: FieldTypes.TEXT,
          flags: { WITHSUFFIXTRIE: true, SORTABLE: true },
        }),
        indexAttributeFactory.build({
          type: FieldTypes.TAG,
          flags: { CASESENSITIVE: true },
        }),
      ],
    })

    renderComponent({ indexInfo: mockIndexInfo })

    expect(screen.getByText('SORTABLE')).toBeInTheDocument()
    expect(screen.getByText('CASESENSITIVE')).toBeInTheDocument()
    expect(screen.getByText('WITHSUFFIXTRIE')).toBeInTheDocument()
    expect(screen.queryByText('NOSTEM')).not.toBeInTheDocument()

    expect(
      screen.getAllByTestId('index-info--boolean-flag-WITHSUFFIXTRIE'),
    ).toHaveLength(2)
    expect(
      screen.getAllByTestId('index-info--boolean-flag-SORTABLE'),
    ).toHaveLength(2)
    expect(
      screen.getAllByTestId('index-info--boolean-flag-CASESENSITIVE'),
    ).toHaveLength(2)
  })

  it('should use custom dataTestId', () => {
    renderComponent({ dataTestId: 'custom-id' })

    const indexInfo = screen.getByTestId('custom-id')
    const definition = screen.getByTestId('custom-id--definition')

    expect(indexInfo).toBeInTheDocument()
    expect(definition).toBeInTheDocument()
  })
})
