import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import AppElectron from './AppElectron'

describe('AppElectron', () => {
  it('should render', () => {
    expect(render(<AppElectron />)).toBeTruthy()
  })
})
