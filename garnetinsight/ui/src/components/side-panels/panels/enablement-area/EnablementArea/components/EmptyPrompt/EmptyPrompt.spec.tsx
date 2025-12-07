import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import EmptyPrompt from './EmptyPrompt'

describe('EmptyPrompt', () => {
  it('should render', () => {
    expect(render(<EmptyPrompt />)).toBeTruthy()
  })
})
