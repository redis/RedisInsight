import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import ConfigElectron from './ConfigElectron'

describe('ConfigElectron', () => {
  it('should render', () => {
    expect(render(<ConfigElectron />)).toBeTruthy()
  })
})
