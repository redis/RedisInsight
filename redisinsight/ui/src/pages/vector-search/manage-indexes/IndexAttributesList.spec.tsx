import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { indexInfoTableDataFactory } from 'uiSrc/mocks/factories/redisearch/IndexInfoTableData.factory'
import {
  IndexAttributesList,
  IndexAttributesListProps,
} from './IndexAttributesList'

const renderComponent = (props?: Partial<IndexAttributesListProps>) => {
  const defaultProps: IndexAttributesListProps = {
    data: indexInfoTableDataFactory.buildList(3),
  }

  return render(<IndexAttributesList {...defaultProps} {...props} />)
}

describe('IndexAttributesList', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const props: IndexAttributesListProps = {
      data: [
        indexInfoTableDataFactory.build(
          {},
          { transient: { includeWeight: true, includeSeparator: true } },
        ),
      ],
    }

    const { container } = renderComponent(props)
    expect(container).toBeTruthy()

    const list = screen.getByTestId('index-attributes-list')
    expect(list).toBeInTheDocument()

    // Verify data is rendered correctly
    const attribute = screen.getByText(props.data[0].attribute)
    const type = screen.getByText(props.data[0].type)
    const weight = screen.getByText(props.data[0].weight!)
    const separator = screen.getByText(props.data[0].separator!)

    expect(attribute).toBeInTheDocument()
    expect(type).toBeInTheDocument()
    expect(weight).toBeInTheDocument()
    expect(separator).toBeInTheDocument()
  })
})
