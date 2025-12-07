import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import UnsupportedTypeDetails from './UnsupportedTypeDetails'

describe('UnsupportedTypeDetails', () => {
  it('should render', () => {
    expect(render(<UnsupportedTypeDetails onClose={jest.fn()} />)).toBeTruthy()
  })
})
