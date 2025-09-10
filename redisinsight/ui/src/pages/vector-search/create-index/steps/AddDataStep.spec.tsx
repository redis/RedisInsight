import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { AddDataStep } from './AddDataStep'
import { selectedBikesIndexFields } from './config'
import {
  SearchIndexType,
  SampleDataType,
  SampleDataContent,
  StepComponentProps,
  PresetDataType,
} from '../types'

const mockSetParameters = jest.fn()

const defaultProps: StepComponentProps = {
  parameters: {
    instanceId: '',
    searchIndexType: SearchIndexType.REDIS_QUERY_ENGINE,
    sampleDataType: SampleDataType.PRESET_DATA,
    dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
    usePresetVectorIndex: true,
    indexName: PresetDataType.BIKES,
    indexFields: selectedBikesIndexFields,
  },
  setParameters: mockSetParameters,
}

describe('AddDataStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<AddDataStep {...defaultProps} />)).toBeTruthy()
  })

  it('should render all search index type options', () => {
    render(<AddDataStep {...defaultProps} />)

    expect(screen.getByText('Redis Query Engine')).toBeInTheDocument()
    expect(
      screen.getByText('For advanced, large-scale search needs'),
    ).toBeInTheDocument()
    expect(screen.getByText('Vector Set')).toBeInTheDocument()
    expect(
      screen.getByText('For quick and simple vector use cases'),
    ).toBeInTheDocument()
  })

  it('should render sample dataset section', () => {
    render(<AddDataStep {...defaultProps} />)

    expect(screen.getByText('Select data to use')).toBeInTheDocument()
    expect(screen.getByText('Pre-set data')).toBeInTheDocument()
    expect(screen.getByText('Custom data')).toBeInTheDocument()
  })

  it('should render data content section', () => {
    render(<AddDataStep {...defaultProps} />)

    expect(screen.getByText('Select sample data to load')).toBeInTheDocument()
    expect(screen.getByText('E-commerce Discovery')).toBeInTheDocument()
    expect(screen.getByText('Movie Recommendations')).toBeInTheDocument()
  })

  describe('Search Index Type Selection', () => {
    it('should call setParameters with Redis Query Engine when clicked', () => {
      render(<AddDataStep {...defaultProps} />)

      const redisQueryEngineOption = screen
        .getByText('Redis Query Engine')
        .closest('div')
      fireEvent.click(redisQueryEngineOption!)

      expect(mockSetParameters).toHaveBeenCalledWith({
        searchIndexType: SearchIndexType.REDIS_QUERY_ENGINE,
      })
    })

    it('should not call setParameters when Vector Set (disabled) is clicked', () => {
      render(<AddDataStep {...defaultProps} />)

      const vectorSetOption = screen.getByText('Vector Set').closest('div')
      fireEvent.click(vectorSetOption!)

      // Disabled options should not trigger onClick
      expect(mockSetParameters).not.toHaveBeenCalled()
    })

    it('should show "Coming soon" text for Vector Set option', () => {
      render(<AddDataStep {...defaultProps} />)

      const comingSoonTexts = screen.getAllByText('Coming soon')
      expect(comingSoonTexts.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Sample Dataset Selection', () => {
    it('should not call setParameters when preset data is clicked (already selected by default)', () => {
      render(<AddDataStep {...defaultProps} />)

      const presetDataRadio = screen.getByLabelText('Pre-set data')
      fireEvent.click(presetDataRadio)

      // Since preset data is already selected by default, clicking it won't trigger onChange
      expect(mockSetParameters).not.toHaveBeenCalled()
    })

    it('should expect custom data to be disabled', () => {
      render(<AddDataStep {...defaultProps} />)

      const customDataRadio = screen.getByLabelText(/Custom data/i)
      expect(customDataRadio).toBeDisabled()
    })

    it('should have preset data selected by default', () => {
      render(<AddDataStep {...defaultProps} />)

      const presetDataRadio = screen.getByLabelText('Pre-set data')
      expect(presetDataRadio).toBeChecked()
    })
  })

  describe('Data Content Selection', () => {
    it('should call setParameters with E-commerce Discovery when clicked', () => {
      render(<AddDataStep {...defaultProps} />)

      const eCommerceOption = screen
        .getByText('E-commerce Discovery')
        .closest('div')
      fireEvent.click(eCommerceOption!)

      expect(mockSetParameters).toHaveBeenCalledWith({
        dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
        indexFields: [
          'model',
          'brand',
          'price',
          'type',
          'material',
          'weight',
          'description_embeddings',
        ],
        indexName: 'idx:bikes_vss',
      })
    })

    it('should call setParameters when Movie Recommendations is clicked', () => {
      render(<AddDataStep {...defaultProps} />)

      const movieRecommendationsOption = screen
        .getByText('Movie Recommendations')
        .closest('div')
      fireEvent.click(movieRecommendationsOption!)

      expect(mockSetParameters).toHaveBeenCalledWith({
        dataContent: SampleDataContent.CONTENT_RECOMMENDATIONS,
        indexFields: ['title', 'genres', 'plot', 'year', 'embedding'],
        indexName: 'idx:movies_vss',
      })
    })

    it('should show "Coming soon" text for disabled Vector set', () => {
      render(<AddDataStep {...defaultProps} />)

      const comingSoonTexts = screen.getAllByText('Coming soon')
      expect(comingSoonTexts).toHaveLength(2)
    })
  })

  describe('Default Values', () => {
    it('should have preset data selected by default in radio group', () => {
      render(<AddDataStep {...defaultProps} />)

      const presetDataRadio = screen.getByLabelText('Pre-set data')
      expect(presetDataRadio).toBeChecked()

      const customDataRadio = screen.getByLabelText(/Custom data/i)
      expect(customDataRadio).not.toBeChecked()
    })

    it('should render with default values set in BoxSelectionGroups', () => {
      render(<AddDataStep {...defaultProps} />)

      // The BoxSelectionGroups have defaultValue set, but we can't easily test the internal state
      // Instead, we verify that the components render without errors and show the expected content
      expect(screen.getByText('Redis Query Engine')).toBeInTheDocument()
      expect(screen.getByText('E-commerce Discovery')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render three main sections', () => {
      render(<AddDataStep {...defaultProps} />)

      // Search index type section (no explicit title, but has options)
      expect(screen.getByText('Redis Query Engine')).toBeInTheDocument()

      // Sample dataset section
      expect(screen.getByText('Select data to use')).toBeInTheDocument()

      // Data content section
      expect(screen.getByText('Select sample data to load')).toBeInTheDocument()
    })

    it('should render all icons for search index types', () => {
      render(<AddDataStep {...defaultProps} />)

      // Icons are rendered as SVG elements, we can check for their presence
      const svgElements = screen.getAllByRole('img', { hidden: true })
      expect(svgElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper radio group for sample dataset', () => {
      render(<AddDataStep {...defaultProps} />)

      const radioGroup = screen.getByRole('radiogroup')
      expect(radioGroup).toBeInTheDocument()
    })

    it('should have proper labels for radio buttons', () => {
      render(<AddDataStep {...defaultProps} />)

      const presetDataLabel = screen.getByLabelText('Pre-set data')
      expect(presetDataLabel).toBeInTheDocument()

      const customDataLabel = screen.getByLabelText(/Custom data/i)
      expect(customDataLabel).toBeInTheDocument()
    })
  })
})
