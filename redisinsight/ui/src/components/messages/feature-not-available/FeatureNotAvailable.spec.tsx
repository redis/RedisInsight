import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import FeatureNotAvailable from './FeatureNotAvailable'
import { FILTER_NOT_AVAILABLE_CONTENT } from './constants'

describe('FeatureNotAvailable', () => {
  it('should render', () => {
    expect(
      render(<FeatureNotAvailable content={FILTER_NOT_AVAILABLE_CONTENT} />),
    ).toBeTruthy()
  })
})
