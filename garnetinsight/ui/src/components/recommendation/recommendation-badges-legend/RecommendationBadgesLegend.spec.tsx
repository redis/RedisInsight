import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import RecommendationBadgesLegend from './RecommendationBadgesLegend'

describe('RecommendationBadgesLegend', () => {
  it('should render', () => {
    expect(render(<RecommendationBadgesLegend />)).toBeTruthy()
  })
})
