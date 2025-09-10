import React from 'react'
import { cleanup, render, screen, within } from 'uiSrc/utils/test-utils'
import {
  indexInfoAttributeFactory,
  indexInfoFactory,
} from 'uiSrc/mocks/factories/redisearch/IndexInfo.factory'
import {
  IndexAttributesList,
  IndexAttributesListProps,
} from './IndexAttributesList'

const renderComponent = (props?: Partial<IndexAttributesListProps>) => {
  const defaultProps: IndexAttributesListProps = {
    indexInfo: indexInfoFactory.build(),
  }

  return render(<IndexAttributesList {...defaultProps} {...props} />)
}

describe('IndexAttributesList', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const props: IndexAttributesListProps = {
      indexInfo: indexInfoFactory.build(),
    }

    const { container } = renderComponent(props)
    expect(container).toBeTruthy()

    const list = screen.getByTestId('index-attributes-list')
    expect(list).toBeInTheDocument()

    const tableHeader1 = screen.getByText('Identifier')
    const summaryInfo = screen.getByTestId(
      'index-attributes-list--summary-info',
    )

    expect(tableHeader1).toBeInTheDocument()
    expect(summaryInfo).toBeInTheDocument()
  })

  it('should render loader when index info is not provided', () => {
    renderComponent({ indexInfo: undefined })

    const loader = screen.getByTestId('index-attributes-list--loader')
    expect(loader).toBeInTheDocument()
  })

  it('should render index attributes in the table', () => {
    const mockIndexAttribute = indexInfoAttributeFactory.build(
      {},
      { transient: { includeWeight: true, includeNoIndex: true } },
    )

    const props: IndexAttributesListProps = {
      indexInfo: indexInfoFactory.build({
        attributes: [mockIndexAttribute],
      }),
    }

    const { container } = renderComponent(props)
    expect(container).toBeTruthy()

    const list = screen.getByTestId('index-attributes-list')
    expect(list).toBeInTheDocument()

    // Verify data is rendered correctly
    const identifier = screen.getByText(mockIndexAttribute.identifier)
    const attribute = screen.getByText(mockIndexAttribute.attribute)
    const type = screen.getByText(mockIndexAttribute.type)
    const weight = screen.getByText(mockIndexAttribute.WEIGHT!)
    const noIndex = screen.getByTestId('index-attributes-list--noindex-icon')

    expect(identifier).toBeInTheDocument()
    expect(attribute).toBeInTheDocument()
    expect(type).toBeInTheDocument()
    expect(weight).toBeInTheDocument()
    expect(noIndex).toBeInTheDocument()
    expect(noIndex).toHaveAttribute(
      'data-attribute',
      mockIndexAttribute.NOINDEX?.toString(),
    )
  })

  it('should display index summary info', () => {
    const mockIndexInfo = indexInfoFactory.build()

    const props: IndexAttributesListProps = {
      indexInfo: mockIndexInfo,
    }

    renderComponent(props)

    const summaryInfo = screen.getByTestId(
      'index-attributes-list--summary-info',
    )
    expect(summaryInfo).toBeInTheDocument()

    // Verify Number of documents
    const numberOfDocumentLabel = screen.getByText(/Number of docs:/)
    const numberOfDocumentValue = within(summaryInfo).getByText(
      new RegExp(mockIndexInfo.num_docs),
    )
    expect(numberOfDocumentLabel).toBeInTheDocument()
    expect(numberOfDocumentValue).toBeInTheDocument()

    // Verify Max document ID
    const maxDocumentIdLabel = screen.getByText(/max/)
    const maxDocumentIdValue = within(summaryInfo).getByText(
      new RegExp(mockIndexInfo.max_doc_id!),
    )
    expect(maxDocumentIdLabel).toBeInTheDocument()
    expect(maxDocumentIdValue).toBeInTheDocument()

    // Verify Number of records
    const numberOfRecordsLabel = screen.getByText(/Number of records:/)
    const numberOfRecordsValue = within(summaryInfo).getByText(
      new RegExp(mockIndexInfo.num_records!),
    )
    expect(numberOfRecordsLabel).toBeInTheDocument()
    expect(numberOfRecordsValue).toBeInTheDocument()

    // Verify Number of terms
    const numberOfTermsLabel = screen.getByText(/Number of terms:/)
    const numberOfTermsValue = within(summaryInfo).getByText(
      new RegExp(mockIndexInfo.num_terms!),
    )
    expect(numberOfTermsLabel).toBeInTheDocument()
    expect(numberOfTermsValue).toBeInTheDocument()
  })
})
