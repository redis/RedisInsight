import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { AddDataStep } from './AddDataStep'
import {
  SearchIndexType,
  SampleDataType,
  SampleDataContent,
  StepComponentProps,
} from '../types'

const mockSetParameters = jest.fn()

const defaultProps: StepComponentProps = {
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

    expect(screen.getByText('Select sample dataset')).toBeInTheDocument()
    expect(screen.getByText('Pre-set data')).toBeInTheDocument()
    expect(screen.getByText('Custom data')).toBeInTheDocument()
  })

  it('should render data content section', () => {
    render(<AddDataStep {...defaultProps} />)

    expect(screen.getByText('Data content')).toBeInTheDocument()
    expect(screen.getByText('E-commerce Discovery')).toBeInTheDocument()
    expect(screen.getByText('AI Assistants')).toBeInTheDocument()
    expect(screen.getByText('Content Recommendations')).toBeInTheDocument()
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

    it('should call setParameters with custom data when selected', () => {
      render(<AddDataStep {...defaultProps} />)

      const customDataRadio = screen.getByLabelText('Custom data')
      fireEvent.click(customDataRadio)

      expect(mockSetParameters).toHaveBeenCalledWith({
        sampleDataType: SampleDataType.CUSTOM_DATA,
      })
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
      })
    })

    it('should call setParameters with AI Assistants when clicked', () => {
      render(<AddDataStep {...defaultProps} />)

      const aiAssistantsOption = screen
        .getByText('AI Assistants')
        .closest('div')
      fireEvent.click(aiAssistantsOption!)

      expect(mockSetParameters).toHaveBeenCalledWith({
        dataContent: SampleDataContent.AI_ASSISTANTS,
      })
    })

    it('should not call setParameters when Content Recommendations (disabled) is clicked', () => {
      render(<AddDataStep {...defaultProps} />)

      const contentRecommendationsOption = screen
        .getByText('Content Recommendations')
        .closest('div')
      fireEvent.click(contentRecommendationsOption!)

      // Disabled options should not trigger onClick
      expect(mockSetParameters).not.toHaveBeenCalled()
    })

    it('should show "Coming soon" text for disabled options', () => {
      render(<AddDataStep {...defaultProps} />)

      // There should be 2 "Coming soon" texts - one for Vector Set and one for Content Recommendations
      const comingSoonTexts = screen.getAllByText('Coming soon')
      expect(comingSoonTexts).toHaveLength(2)
    })
  })

  describe('Default Values', () => {
    it('should have preset data selected by default in radio group', () => {
      render(<AddDataStep {...defaultProps} />)

      const presetDataRadio = screen.getByLabelText('Pre-set data')
      expect(presetDataRadio).toBeChecked()

      const customDataRadio = screen.getByLabelText('Custom data')
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
      expect(screen.getByText('Select sample dataset')).toBeInTheDocument()

      // Data content section
      expect(screen.getByText('Data content')).toBeInTheDocument()
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

      expect(screen.getByLabelText('Pre-set data')).toBeInTheDocument()
      expect(screen.getByLabelText('Custom data')).toBeInTheDocument()
    })
  })
})
