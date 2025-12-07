import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoEditor from './MonacoEditor'

describe('MonacoEditor', () => {
  it('should render', () => {
    expect(
      render(<MonacoEditor value="val" onChange={jest.fn()} language="val" />),
    ).toBeTruthy()
  })
})
