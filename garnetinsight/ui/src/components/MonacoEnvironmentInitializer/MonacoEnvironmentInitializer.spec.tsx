import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoEnvironmentInitializer from './MonacoEnvironmentInitializer'

describe('MonacoEnvironmentInitializer', () => {
  it('should render', () => {
    expect(render(<MonacoEnvironmentInitializer />)).toBeTruthy()
  })
})
