import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import i18n from 'uiSrc/i18n'

import LoadSampleDataset from './LoadSampleDataset'
import { getVec2WordInfo, VEC2WORD_PREVIEW } from './data'

describe('LoadSampleDataset', () => {
  it('renders all hardcoded preview rows and info pairs', () => {
    render(<LoadSampleDataset />)

    VEC2WORD_PREVIEW.forEach(({ word, vector }) => {
      const row = screen.getByTestId(`load-sample-dataset-preview-${word}`)
      expect(row).toHaveTextContent(word)
      expect(row).toHaveTextContent(vector)
    })

    getVec2WordInfo(i18n.t).forEach(({ testId, label, value }) => {
      const row = screen.getByTestId(`load-sample-dataset-info-${testId}`)
      expect(row).toHaveTextContent(label)
      expect(row).toHaveTextContent(value)
    })
  })
})
