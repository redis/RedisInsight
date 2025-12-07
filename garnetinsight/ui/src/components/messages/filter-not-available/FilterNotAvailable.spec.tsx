import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import FilterNotAvailable from './FilterNotAvailable'

describe('FilterNotAvailable', () => {
  it('should render', () => {
    expect(render(<FilterNotAvailable />)).toBeTruthy()
  })
})
