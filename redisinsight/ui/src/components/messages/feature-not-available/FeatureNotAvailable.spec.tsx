import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import FeatureNotAvailable from './FeatureNotAvailable'

describe('FeatureNotAvailable', () => {
  it('should render', () => {
    expect(render(<FeatureNotAvailable />)).toBeTruthy()
  })
})
