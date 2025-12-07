import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import VerticalDivider from './VerticalDivider'

describe('VerticalDivider', () => {
  it('should render', () => {
    expect(render(<VerticalDivider />)).toBeTruthy()
  })
})
