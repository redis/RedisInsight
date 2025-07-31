import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { CreateIndexStep } from './CreateIndexStep'
import { selectedBikesIndexFields } from './config'
import {
  SearchIndexType,
  SampleDataType,
  SampleDataContent,
  PresetDataType,
  StepComponentProps,
} from '../types'

const mockSetParameters = jest.fn()

const defaultProps: StepComponentProps = {
  setParameters: mockSetParameters,
  parameters: {
    instanceId: 'test-instance',
    searchIndexType: SearchIndexType.REDIS_QUERY_ENGINE,
    sampleDataType: SampleDataType.PRESET_DATA,
    dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
    usePresetVectorIndex: true,
    indexName: PresetDataType.BIKES,
    indexFields: selectedBikesIndexFields,
  },
}

describe('CreateIndexStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<CreateIndexStep {...defaultProps} />)).toBeTruthy()
  })

  it('should render the main heading and description', () => {
    render(<CreateIndexStep {...defaultProps} />)

    expect(screen.getByText('Vector index')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Indexes tell Redis how to search your data. Creating an index enables fast, accurate retrieval across your dataset.',
      ),
    ).toBeInTheDocument()
  })

  it('should render the index name input field', () => {
    render(<CreateIndexStep {...defaultProps} />)

    expect(screen.getByText('Index name')).toBeInTheDocument()
    expect(screen.getByTestId('search-for-index')).toBeInTheDocument()
    expect(screen.getByDisplayValue(PresetDataType.BIKES)).toBeInTheDocument()
  })

  it('should render the index name input as disabled', () => {
    render(<CreateIndexStep {...defaultProps} />)

    const indexNameInput = screen.getByTestId('search-for-index')
    expect(indexNameInput).toBeDisabled()
  })

  it('should render the command preview button', () => {
    render(<CreateIndexStep {...defaultProps} />)

    expect(screen.getByText('► Command preview')).toBeInTheDocument()
  })

  it('should render the tab labels', () => {
    render(<CreateIndexStep {...defaultProps} />)

    expect(screen.getByText('Use preset index')).toBeInTheDocument()
    // Build new index tab should be present but disabled
    expect(screen.getByText('Build new index')).toBeInTheDocument()
  })

  it('should render field boxes for the bikes index', () => {
    render(<CreateIndexStep {...defaultProps} />)

    // Check for some of the expected field labels from bikesIndexFieldsBoxes
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
    expect(screen.getByText('price')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('category')).toBeInTheDocument()
    expect(screen.getByText('embedding')).toBeInTheDocument()
  })

  it('should render field descriptions', () => {
    render(<CreateIndexStep {...defaultProps} />)

    // Check for some field descriptions
    expect(screen.getByText('Unique product identifier')).toBeInTheDocument()
    expect(screen.getByText('Product description')).toBeInTheDocument()
    expect(screen.getByText('Product name')).toBeInTheDocument()
    expect(screen.getByText('Product category')).toBeInTheDocument()
  })

  it('should render field type tags', () => {
    render(<CreateIndexStep {...defaultProps} />)

    // Check for field type tags (these appear as text content)
    expect(screen.getAllByText('TAG')).toHaveLength(2) // id and category fields
    expect(screen.getAllByText('TEXT')).toHaveLength(2) // description and name fields
    expect(screen.getAllByText('NUMERIC')).toHaveLength(2) // price and price_1 fields
    expect(screen.getAllByText('VECTOR')).toHaveLength(2) // embedding and embedding_1 fields
  })

  it('should not render the preview command drawer by default', () => {
    render(<CreateIndexStep {...defaultProps} />)

    // The drawer should not be visible initially
    expect(screen.queryByText('Command Preview')).not.toBeInTheDocument()
  })

  describe('Component Structure', () => {
    it('should render the main wrapper', () => {
      const { container } = render(<CreateIndexStep {...defaultProps} />)

      // Check that the main component structure is present
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render field boxes group', () => {
      render(<CreateIndexStep {...defaultProps} />)

      // The FieldBoxesGroup should be rendered (we can check by looking for its test id)
      expect(screen.getByTestId('field-boxes-group')).toBeInTheDocument()
    })
  })

  describe('Default Values', () => {
    it('should display the correct index name from parameters', () => {
      render(<CreateIndexStep {...defaultProps} />)

      const indexNameInput = screen.getByTestId('search-for-index')
      expect(indexNameInput).toHaveValue(PresetDataType.BIKES)
    })

    it('should render with all expected field boxes', () => {
      render(<CreateIndexStep {...defaultProps} />)

      // Verify all 8 field boxes are rendered (from bikesIndexFieldsBoxes config)
      const fieldLabels = ['id', 'description', 'price', 'price_1', 'name', 'category', 'embedding', 'embedding_1']
      
      fieldLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper input labeling', () => {
      render(<CreateIndexStep {...defaultProps} />)

      const indexNameInput = screen.getByTestId('search-for-index')
      expect(indexNameInput).toHaveAttribute('placeholder', 'Search for index')
    })

    it('should have proper button text', () => {
      render(<CreateIndexStep {...defaultProps} />)

      const commandPreviewButton = screen.getByText('► Command preview')
      expect(commandPreviewButton).toBeInTheDocument()
    })
  })
})
