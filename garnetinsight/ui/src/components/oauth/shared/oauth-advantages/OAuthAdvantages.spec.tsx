import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import OAuthAdvantages from './OAuthAdvantages'

describe('OAuthAdvantages', () => {
  it('should render', () => {
    expect(render(<OAuthAdvantages />)).toBeTruthy()
  })
})
