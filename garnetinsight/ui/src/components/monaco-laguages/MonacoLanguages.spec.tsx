import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoLanguages from './MonacoLanguages'

describe('MonacoLanguages', () => {
  it('should render', () => {
    expect(render(<MonacoLanguages />)).toBeTruthy()
  })
})
