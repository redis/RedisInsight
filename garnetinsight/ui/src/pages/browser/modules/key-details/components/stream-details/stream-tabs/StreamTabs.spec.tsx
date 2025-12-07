import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import StreamTabs from './StreamTabs'

describe('StreamTabs', () => {
  it('should render', () => {
    expect(render(<StreamTabs />)).toBeTruthy()
  })
})
