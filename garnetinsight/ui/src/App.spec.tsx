import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import App from './App'

describe('App', () => {
  it('should render', () => {
    expect(render(<App />)).toBeTruthy()
  })
})
