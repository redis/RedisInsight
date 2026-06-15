import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import LoadSampleDataset from './LoadSampleDataset'
import { VEC2WORD_INFO, VEC2WORD_PREVIEW } from './data'

describe('LoadSampleDataset', () => {
  it('renders all hardcoded preview rows and info pairs', () => {
    render(<LoadSampleDataset />)

    VEC2WORD_PREVIEW.forEach(({ word, vector }) => {
      const row = screen.getByTestId(`load-sample-dataset-preview-${word}`)
      expect(row).toHaveTextContent(word)
      expect(row).toHaveTextContent(vector)
    })

    VEC2WORD_INFO.forEach(({ label, value }) => {
      const testId = `load-sample-dataset-info-${label.toLowerCase().replace(/\s+/g, '-')}`
      const row = screen.getByTestId(testId)
      expect(row).toHaveTextContent(label)
      expect(row).toHaveTextContent(value)
    })
  })
})
