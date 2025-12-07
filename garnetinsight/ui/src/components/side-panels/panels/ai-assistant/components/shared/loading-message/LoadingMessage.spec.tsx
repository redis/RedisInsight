import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import LoadingMessage from './LoadingMessage'

describe('LoadingMessage', () => {
  it('should render', () => {
    expect(render(<LoadingMessage />)).toBeTruthy()
  })
})
